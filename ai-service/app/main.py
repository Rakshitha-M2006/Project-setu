from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints.classification import predict_endpoint, PredictRequest, PredictResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI and NLP microservice powering Smart India Hackathon 2026 - PROJECT SETU",
    version=settings.MODEL_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount direct /predict endpoint at root for standard schema compliance
@app.post("/predict", response_model=PredictResponse, tags=["Classification"])
def root_predict(request: PredictRequest):
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
