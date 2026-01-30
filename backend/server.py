import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import uvicorn
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
import httpx
import json
from openai import AzureOpenAI
import firebase_admin
from firebase_admin import credentials, firestore
import tensorflow as tf
import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))



ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ========== FIREBASE INIT ==========
FIREBASE_CRED_PATH = os.environ.get("FIREBASE_CREDENTIALS")

firebase_db = None
if FIREBASE_CRED_PATH and os.path.exists(FIREBASE_CRED_PATH):
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CRED_PATH)
        firebase_admin.initialize_app(cred)
    firebase_db = firestore.client()
else:
    print("⚠ Firebase disabled: credentials not found")



# MongoDB connection
mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")

if not mongo_url or not db_name:
    raise RuntimeError("MongoDB environment variables not set")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


# ========== ML MODELS LOAD ==========

crop_model = None
corn_model = None
cotton_model = None

def load_crop_model():
    global crop_model
    if crop_model is None:
        crop_model = tf.keras.models.load_model(
            os.path.join(BASE_DIR, "models", "crop_classifier.h5"),
            compile=False
        )
    return crop_model

def load_corn_model():
    global corn_model
    if corn_model is None:
        corn_model = tf.keras.models.load_model(
            os.path.join(BASE_DIR, "models", "corn_disease_model.h5"),
            compile=False
        )
    return corn_model

def load_cotton_model():
    global cotton_model
    if cotton_model is None:
        cotton_model = tf.keras.models.load_model(
            os.path.join(BASE_DIR, "models", "cotton_disease_model.h5"),
            compile=False
        )
    return cotton_model




crop_classes = ['Corn', 'Cotton', 'Wheat']
corn_diseases = ['Blight', 'Common_Rust', 'Gray_Leaf_Spot', 'Healthy']
cotton_diseases = ['Bacterial_Blight', 'Curl_Virus', 'Fusarium_Wilt', 'Healthy']


# Azure OpenAI client
azure_client = AzureOpenAI(
    api_key=os.environ.get('AZURE_API_KEY'),
    api_version=os.environ.get('AZURE_OPENAI_API_VERSION'),
    azure_endpoint=os.environ.get('AZURE_OPENAI_API_BASE')
)

# # Create the main app
# app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup (optional)
    yield
    # Shutdown
    client.close()
    logger.info("MongoDB connection closed")


app = FastAPI(lifespan=lifespan)

# ✅ CORS MUST COME HERE
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get(
        "CORS_ORIGINS",
        "https://farmsmart-1842b9ra1-savaliyautsav836-gmailcoms-projects.vercel.app,http://localhost:3000"
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# THEN include routes





# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ========== MODELS ==========

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    role: str = "user"
    # farm_location: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfileCreate(BaseModel):
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    role: str = "user"
    # farm_location: Optional[dict] = None

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    # farm_location: Optional[dict] = None
    role: Optional[str] = None

class DiseaseReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    image_base64: Optional[str] = None
    crop_name: str
    disease_name: str
    cause: str
    symptoms: List[str]
    treatment: str
    recommended_fertilizer: str
    recommended_medicine: str
    severity: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CropCalendarEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    crop_name: str
    activity: str
    scheduled_date: str
    notes: Optional[str] = None
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CropCalendarCreate(BaseModel):
    user_id: str
    crop_name: str
    activity: str
    scheduled_date: str
    notes: Optional[str] = None

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str



def get_farm_location_from_firebase(firebase_uid: str):
    doc = firebase_db.collection("users").document(firebase_uid).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found in Firebase")

    data = doc.to_dict()
    location = data.get("farmLocation")

    if not location:
        raise HTTPException(status_code=400, detail="Farm location not set")

    return location["lat"], location["lng"]

# DISEASE_INFO = {
#     "Corn_Blight": {
#         "cause": "Fungal infection",
#         "symptoms": ["Brown elongated spots", "Dry leaves"],
#         "treatment": "Apply fungicide",
#         "recommended_fertilizer": "Balanced NPK",
#         "recommended_medicine": "Mancozeb",
#         "severity": "Medium"
#     },
#     "Cotton_Curl_Virus": {
#         "cause": "Virus transmitted by whiteflies",
#         "symptoms": ["Leaf curling", "Stunted growth"],
#         "treatment": "Control whiteflies",
#         "recommended_fertilizer": "Micronutrients",
#         "recommended_medicine": "Imidacloprid",
#         "severity": "High"
#     },
#     "Healthy": {
#         "cause": "No disease",
#         "symptoms": ["Healthy green leaves"],
#         "treatment": "No treatment required",
#         "recommended_fertilizer": "Routine NPK",
#         "recommended_medicine": "None",
#         "severity": "Low"
#     }
# }

# ========== ROUTES ==========

@api_router.get("/")
async def root():
    return {"message": "Smart Farmer Portal API", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    try:
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        # "azure_openai": "configured" if os.environ.get('AZURE_API_KEY') else "not configured",
        "ml_models": "loaded",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ========== USER MANAGEMENT ==========

@api_router.post("/users", response_model=UserProfile)
async def create_or_update_user(user: UserProfileCreate):
    existing = await db.users.find_one({"firebase_uid": user.firebase_uid}, {"_id": 0})
    if existing:
        return UserProfile(**existing)
    
    user_obj = UserProfile(**user.model_dump())
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.users.insert_one(doc)
    return user_obj

@api_router.get("/users/{firebase_uid}", response_model=UserProfile)
async def get_user(firebase_uid: str):
    user = await db.users.find_one({"firebase_uid": firebase_uid}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    if isinstance(user.get('updated_at'), str):
        user['updated_at'] = datetime.fromisoformat(user['updated_at'])
    return UserProfile(**user)

@api_router.put("/users/{firebase_uid}", response_model=UserProfile)
async def update_user(firebase_uid: str, update: UserProfileUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await get_user(firebase_uid)

@api_router.get("/users", response_model=List[UserProfile])
async def get_all_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('updated_at'), str):
            user['updated_at'] = datetime.fromisoformat(user['updated_at'])
    return [UserProfile(**u) for u in users]

@api_router.delete("/users/{firebase_uid}")
async def delete_user(firebase_uid: str):
    result = await db.users.delete_one({"firebase_uid": firebase_uid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# ========== DISEASE DETECTION ==========

@api_router.post("/detect-disease")
async def detect_disease(
    user_id: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # ---------- IMAGE PREPROCESS ----------
        img = Image.open(image.file).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # ---------- STEP 1: CROP PREDICTION (ML) ----------
        crop_pred = load_crop_model().predict(img_array)

        crop_index = int(np.argmax(crop_pred))
        crop_name = crop_classes[crop_index]
        crop_confidence = float(np.max(crop_pred)) * 100

        # ---------- STEP 2: DISEASE PREDICTION (ML) ----------
        if crop_name == "Corn":
           dis_pred = load_corn_model().predict(img_array)
           disease_name = corn_diseases[np.argmax(dis_pred)]
        elif crop_name == "Cotton":
            dis_pred = load_cotton_model().predict(img_array)
            disease_name = cotton_diseases[np.argmax(dis_pred)]
        else:
            disease_name = "Healthy"
            dis_pred = [[1.0]]

        disease_confidence = float(np.max(dis_pred)) * 100

        # ---------- STEP 3: AZURE OPENAI (TEXT RECOMMENDATIONS) ----------
        system_prompt = """
        You are an expert agricultural scientist.
        Given a crop name and disease name, return ONLY valid JSON:

        {
          "cause": "",
          "symptoms": [],
          "treatment": "",
          "recommended_fertilizer": "",
          "recommended_medicine": "",
          "severity": "Low/Medium/High/Critical"
        }
        """

        user_prompt = f"""
        Crop: {crop_name}
        Disease: {disease_name}
        """

        response = azure_client.chat.completions.create(
            model=os.environ.get("AZURE_OPENAI_API_NAME", "gpt-4o"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500
        )

        ai_text = response.choices[0].message.content

        # ---------- SAFE JSON PARSING ----------
        try:
            if "```json" in ai_text:
                ai_text = ai_text.split("```json")[1].split("```")[0]
            elif "```" in ai_text:
                ai_text = ai_text.split("```")[1].split("```")[0]

            info = json.loads(ai_text)
        except:
            info = {
                "cause": "Unknown",
                "symptoms": [],
                "treatment": "N/A",
                "recommended_fertilizer": "N/A",
                "recommended_medicine": "N/A",
                "severity": "Unknown"
            }

        # ---------- SAVE REPORT ----------
        report = DiseaseReport(
            user_id=user_id,
            crop_name=crop_name,
            disease_name=disease_name,
            cause=info["cause"],
            symptoms=info["symptoms"],
            treatment=info["treatment"],
            recommended_fertilizer=info["recommended_fertilizer"],
            recommended_medicine=info["recommended_medicine"],
            severity=info["severity"]
        )

        doc = report.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        doc["crop_confidence"] = round(crop_confidence, 2)
        doc["disease_confidence"] = round(disease_confidence, 2)

        await db.disease_reports.insert_one(doc)

        return {
            "success": True,
            "crop": crop_name,
            "crop_confidence": round(crop_confidence, 2),
            "disease": disease_name,
            "disease_confidence": round(disease_confidence, 2),
            "details": info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@api_router.get("/disease-reports/{user_id}", response_model=List[DiseaseReport])
async def get_user_disease_reports(user_id: str):
    reports = await db.disease_reports.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for report in reports:
        if isinstance(report.get('created_at'), str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    return [DiseaseReport(**r) for r in reports]

@api_router.get("/disease-reports", response_model=List[DiseaseReport])
async def get_all_disease_reports():
    reports = await db.disease_reports.find({}, {"_id": 0}).to_list(1000)
    for report in reports:
        if isinstance(report.get('created_at'), str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    return [DiseaseReport(**r) for r in reports]

# ========== CROP CALENDAR ==========

@api_router.post("/crop-calendar", response_model=CropCalendarEntry)
async def create_calendar_entry(entry: CropCalendarCreate):
    entry_obj = CropCalendarEntry(**entry.model_dump())
    doc = entry_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.crop_calendar.insert_one(doc)
    return entry_obj

@api_router.get("/crop-calendar/{user_id}", response_model=List[CropCalendarEntry])
async def get_user_calendar(user_id: str):
    entries = await db.crop_calendar.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for entry in entries:
        if isinstance(entry.get('created_at'), str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    return [CropCalendarEntry(**e) for e in entries]

@api_router.put("/crop-calendar/{entry_id}")
async def update_calendar_entry(entry_id: str, completed: bool):
    result = await db.crop_calendar.update_one(
        {"id": entry_id},
        {"$set": {"completed": completed}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry updated"}

@api_router.delete("/crop-calendar/{entry_id}")
async def delete_calendar_entry(entry_id: str):
    result = await db.crop_calendar.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry deleted"}

# ========== WEATHER API ==========

@api_router.get("/weather/{firebase_uid}")
async def get_weather(firebase_uid: str):
    lat, lng = get_farm_location_from_firebase(firebase_uid)

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&current_weather=true"
        f"&hourly=relativehumidity_2m,apparent_temperature"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max"
        f"&forecast_days=5"
        f"&timezone=auto"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()



# ========== NEWS API ==========

@api_router.get("/news")
async def get_farming_news():
    try:
        api_key = os.environ.get('NEWS_API_KEY')
        url = f"https://gnews.io/api/v4/search?q=agriculture+farming+india&lang=en&country=in&max=10&apikey={api_key}"
        
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(url)
            data = response.json()
            
            if "articles" in data:
                return {"articles": data["articles"]}
            
            # Fallback dummy data
            return {
                "articles": [
                    {
                        "title": "Government Announces New Farmer Subsidy Scheme",
                        "description": "The Ministry of Agriculture has announced a new subsidy scheme for small and marginal farmers.",
                        "url": "#",
                        "image": "https://images.unsplash.com/photo-1589292144899-2f43a71a1b2b",
                        "publishedAt": datetime.now(timezone.utc).isoformat(),
                        "source": {"name": "Agriculture Today"}
                    },
                    {
                        "title": "Monsoon Forecast: Above Normal Rainfall Expected",
                        "description": "IMD predicts above normal rainfall during the upcoming monsoon season, beneficial for Kharif crops.",
                        "url": "#",
                        "image": "https://images.unsplash.com/photo-1696371269777-88d1ce71642c",
                        "publishedAt": datetime.now(timezone.utc).isoformat(),
                        "source": {"name": "Weather India"}
                    },
                    {
                        "title": "New Pest-Resistant Wheat Variety Released",
                        "description": "ICAR releases new wheat variety with resistance to yellow rust and better yield potential.",
                        "url": "#",
                        "image": "https://images.unsplash.com/photo-1645439162146-b2b94da3d55b",
                        "publishedAt": datetime.now(timezone.utc).isoformat(),
                        "source": {"name": "Krishi Jagran"}
                    }
                ]
            }
    except Exception as e:
        logging.error(f"News API error: {str(e)}")
        # Return fallback data on error
        return {
            "articles": [
                {
                    "title": "Government Announces New Farmer Subsidy Scheme",
                    "description": "The Ministry of Agriculture has announced a new subsidy scheme.",
                    "url": "#",
                    "image": "https://images.unsplash.com/photo-1589292144899-2f43a71a1b2b",
                    "publishedAt": datetime.now(timezone.utc).isoformat(),
                    "source": {"name": "Agriculture Today"}
                }
            ]
        }

# ========== MARKET PRICES ==========

@api_router.get("/market-prices")
async def get_market_prices():
    api_key = os.environ.get("MARKET_API_KEY")
    resource_id = os.environ.get("MARKET_RESOURCE_ID")

    # ✅ If API not configured → dummy immediately
    if not api_key or not resource_id:
        return {
            "prices": [
                {"commodity": "Wheat", "market": "Azadpur", "state": "Delhi", "modal_price": "2200"}
            ],
            "source": "dummy"
        }

    try:
        url = f"https://api.data.gov.in/resource/{resource_id}?api-key={api_key}&format=json&limit=50"

        async with httpx.AsyncClient(timeout=10) as http_client:
            response = await http_client.get(url)
            response.raise_for_status()
            data = response.json()

            if "records" in data:
                return {"prices": data["records"], "source": "live"}

    except Exception as e:
        logging.error(f"Market API error: {e}")
    
    # Fallback dummy data
    return {
        "prices": [
            {"commodity": "Wheat", "market": "Azadpur", "state": "Delhi", "min_price": "2100", "max_price": "2300", "modal_price": "2200"},
            {"commodity": "Rice", "market": "Vashi", "state": "Maharashtra", "min_price": "3200", "max_price": "3500", "modal_price": "3350"},
            {"commodity": "Tomato", "market": "Koyambedu", "state": "Tamil Nadu", "min_price": "1500", "max_price": "2000", "modal_price": "1750"},
            {"commodity": "Onion", "market": "Lasalgaon", "state": "Maharashtra", "min_price": "800", "max_price": "1200", "modal_price": "1000"},
            {"commodity": "Potato", "market": "Azadpur", "state": "Delhi", "min_price": "1000", "max_price": "1400", "modal_price": "1200"},
            {"commodity": "Cotton", "market": "Rajkot", "state": "Gujarat", "min_price": "6500", "max_price": "7200", "modal_price": "6850"},
            {"commodity": "Soybean", "market": "Indore", "state": "Madhya Pradesh", "min_price": "4200", "max_price": "4600", "modal_price": "4400"},
            {"commodity": "Groundnut", "market": "Gondal", "state": "Gujarat", "min_price": "5500", "max_price": "6000", "modal_price": "5750"}
        ]
    }

# ========== CONTACT ==========

@api_router.post("/contact", response_model=ContactMessage)
async def submit_contact(message: ContactMessageCreate):
    msg_obj = ContactMessage(**message.model_dump())
    doc = msg_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    return msg_obj

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find({}, {"_id": 0}).to_list(100)
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    return [ContactMessage(**m) for m in messages]

# ========== ADMIN STATS ==========

@api_router.get("/admin/stats")
async def get_admin_stats():
    user_count = await db.users.count_documents({})
    report_count = await db.disease_reports.count_documents({})
    message_count = await db.contact_messages.count_documents({})
    calendar_count = await db.crop_calendar.count_documents({})
    
    return {
        "total_users": user_count,
        "total_reports": report_count,
        "total_messages": message_count,
        "total_calendar_entries": calendar_count
    }

# ========== FARMING RESOURCES ==========

@api_router.get("/resources/tools")
async def get_farming_tools():
    return {
        "tools": [
            {"name": "Tractor", "description": "Multi-purpose farming vehicle for plowing, tilling, and transportation", "category": "Machinery", "image": "https://images.unsplash.com/photo-1760938580105-3bad290397dd"},
            {"name": "Rotavator", "description": "Soil preparation equipment for breaking up soil", "category": "Machinery", "image": "https://images.unsplash.com/photo-1677126577258-1a82fdf1a976"},
            {"name": "Seed Drill", "description": "Precision seeding equipment for row crops", "category": "Machinery", "image": "https://images.unsplash.com/photo-1705113998946-1eefc7961c24"},
            {"name": "Sprayer", "description": "Pesticide and fertilizer application equipment", "category": "Equipment", "image": "https://images.unsplash.com/photo-1677126577258-1a82fdf1a976"},
            {"name": "Harvester", "description": "Crop harvesting machinery", "category": "Machinery", "image": "https://images.unsplash.com/photo-1760938580105-3bad290397dd"},
            {"name": "Drip Irrigation Kit", "description": "Water-efficient irrigation system", "category": "Irrigation", "image": "https://images.unsplash.com/photo-1756158450046-24e51d854f71"}
        ]
    }

@api_router.get("/resources/fertilizers")
async def get_fertilizers():
    return {
        "fertilizers": [
            {"name": "Urea (46-0-0)", "description": "High nitrogen fertilizer for leafy growth", "usage": "Apply during vegetative growth stage", "dosage": "50-100 kg/acre"},
            {"name": "DAP (18-46-0)", "description": "Diammonium phosphate for root development", "usage": "Apply at sowing time", "dosage": "25-50 kg/acre"},
            {"name": "MOP (0-0-60)", "description": "Muriate of potash for fruit quality", "usage": "Apply during flowering stage", "dosage": "25-40 kg/acre"},
            {"name": "NPK (10-26-26)", "description": "Balanced fertilizer for overall growth", "usage": "General purpose application", "dosage": "50-75 kg/acre"},
            {"name": "Vermicompost", "description": "Organic fertilizer for soil health", "usage": "Apply before sowing", "dosage": "2-4 tons/acre"},
            {"name": "Neem Cake", "description": "Organic pest deterrent and fertilizer", "usage": "Mix with soil", "dosage": "100-200 kg/acre"}
        ]
    }

@api_router.get("/resources/medicines")
async def get_medicines():
    return {
        "medicines": [
            {"name": "Mancozeb", "description": "Broad-spectrum fungicide", "target": "Fungal diseases", "usage": "Foliar spray 2g/L"},
            {"name": "Carbendazim", "description": "Systemic fungicide", "target": "Powdery mildew, rust", "usage": "Foliar spray 1g/L"},
            {"name": "Imidacloprid", "description": "Systemic insecticide", "target": "Sucking pests, aphids", "usage": "Foliar spray 0.5ml/L"},
            {"name": "Chlorpyrifos", "description": "Contact insecticide", "target": "Soil pests, termites", "usage": "Soil drench 2ml/L"},
            {"name": "Neem Oil", "description": "Organic pest control", "target": "General pest management", "usage": "Foliar spray 5ml/L"},
            {"name": "Trichoderma", "description": "Bio-fungicide", "target": "Soil-borne diseases", "usage": "Soil application 2kg/acre"}
        ]
    }

# ========== GOVERNMENT POLICIES ==========

@api_router.get("/policies")
async def get_government_policies():
    return {
        "policies": [
            {
                "name": "PM-KISAN",
                "description": "Direct income support of ₹6000 per year to farmer families",
                "eligibility": "Small and marginal farmers with cultivable land",
                "benefits": "₹6000 per year in 3 installments",
                "link": "https://pmkisan.gov.in"
            },
            {
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "description": "Crop insurance scheme for farmers",
                "eligibility": "All farmers growing notified crops",
                "benefits": "Insurance coverage against crop loss",
                "link": "https://pmfby.gov.in"
            },
            {
                "name": "Kisan Credit Card",
                "description": "Credit facility for farmers at subsidized interest rates",
                "eligibility": "Farmers, fishermen, animal husbandry farmers",
                "benefits": "Credit up to ₹3 lakh at 4% interest",
                "link": "https://www.nabard.org"
            },
            {
                "name": "Soil Health Card Scheme",
                "description": "Free soil testing and health card issuance",
                "eligibility": "All farmers",
                "benefits": "Free soil testing, fertilizer recommendations",
                "link": "https://soilhealth.dac.gov.in"
            },
            {
                "name": "e-NAM",
                "description": "Online trading platform for agricultural commodities",
                "eligibility": "Registered farmers and traders",
                "benefits": "Better price discovery, reduced intermediaries",
                "link": "https://enam.gov.in"
            }
        ]
    }

# Include the router in the main app

app.include_router(api_router)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# @app.on_event("shutdown")
# async def shutdown_db_client():
#     client.close()




# if __name__ == "__main__":
#     uvicorn.run(
#         "server:app",
#         host="0.0.0.0",
#         port=int(os.environ.get("PORT", 8000))
#     )

# uvicorn server:app --reload
