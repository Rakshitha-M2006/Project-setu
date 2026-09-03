from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="AI Service Health Check")
def health_check():
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.MODEL_VERSION,
        environment=settings.ENVIRONMENT,
        confidence_threshold=settings.CONFIDENCE_THRESHOLD,
    )
