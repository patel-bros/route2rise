from motor.motor_asyncio import AsyncClient, AsyncDatabase
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncClient = None
    db: AsyncDatabase = None

async def connect_db():
    """Connect to MongoDB"""
    try:
        Database.client = AsyncClient(settings.MONGODB_URL)
        Database.db = Database.client[settings.DATABASE_NAME]
        
        # Test connection
        await Database.db.command("ping")
        logger.info("✓ Connected to MongoDB")
    except Exception as e:
        logger.error(f"✗ Failed to connect to MongoDB: {str(e)}")
        raise

async def disconnect_db():
    """Disconnect from MongoDB"""
    if Database.client:
        Database.client.close()
        logger.info("✓ Disconnected from MongoDB")

def get_db():
    """Get database instance"""
    return Database.db
