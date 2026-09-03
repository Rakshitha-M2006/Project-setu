from fastapi import FastAPI, Request, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints.classification import predict_endpoint, PredictRequest, PredictResponse

API_KEY_HEADER = APIKeyHeader(name="X-Internal-API-Key", auto_error=False)

def verify_internal_api_key(api_key: str = Security(API_KEY_HEADER)):
    # Allow in dev or if matches configured internal secret
    if settings.ENVIRONMENT == "production":
        if not api_key or api_key != settings.INTERNAL_API_SECRET:
            raise HTTPException(status_code=403, detail="Forbidden: Invalid or missing internal microservice API key")
    return True

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI and NLP microservice powering PROJECT SETU - Government Services & Grievance Management Platform",
    version=settings.MODEL_VERSION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Mount direct /predict endpoint with internal auth verification
@app.post("/predict", response_model=PredictResponse, tags=["Classification"])
def root_predict(request: PredictRequest, authenticated: bool = Depends(verify_internal_api_key)):
    return predict_endpoint(request)

# Register versioned API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.MODEL_VERSION,
        "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
        "endpoints": {
            "predict": "/predict",
            "health": "/api/v1/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
