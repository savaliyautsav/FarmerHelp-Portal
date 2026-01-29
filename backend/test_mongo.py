from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

MONGO_URL = "mongodb+srv://utsav:ush%402611@cluster0.s5lox76.mongodb.net/?tls=true"

async def test():
    client = AsyncIOMotorClient(MONGO_URL)
    await client.admin.command("ping")
    print("MongoDB Connected Successfully")

asyncio.run(test())
