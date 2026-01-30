# 1️⃣ Use stable Python version (TensorFlow compatible)
FROM python:3.10-slim

# 2️⃣ Environment safety flags
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3️⃣ Set working directory inside container
WORKDIR /app

# 4️⃣ Install system dependencies (needed for Pillow / OpenCV)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 5️⃣ Copy only requirements first (Docker cache optimization)
COPY requirements.txt .

# 6️⃣ Install Python dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 7️⃣ Copy backend source code
COPY . .

# 8️⃣ Expose port (Render uses 10000 internally)
EXPOSE 10000

# 9️⃣ Start FastAPI using Gunicorn
CMD ["sh", "-c", "gunicorn -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:${PORT}"]


