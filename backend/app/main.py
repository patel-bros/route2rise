from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from app.config import settings
from app.database.mongo import connect_db, disconnect_db
from app.auth.routes import router as auth_router
from app.leads.routes import router as leads_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("🚀 Route2Rise Backend Starting...")
    await connect_db()
    
    yield
    
    # Shutdown
    logger.info("🛑 Route2Rise Backend Shutting Down...")
    await disconnect_db()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Internal Lead Management System for Route2Rise",
    version="1.0.0",
    lifespan=lifespan
)

# Custom validation error handler for better error messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with better error messages"""
    errors = exc.errors()
    error_details = []
    
    for error in errors:
        field = " -> ".join(str(x) for x in error["loc"][1:])  # Skip "body"
        error_details.append(f"{field}: {error['msg']}")
    
    logger.error(f"Validation error: {error_details}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": error_details,
            "message": "Validation failed. Please check the required fields: company_name, sector, source"
        }
    )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(leads_router)

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
