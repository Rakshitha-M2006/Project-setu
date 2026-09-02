from fastapi import APIRouter
from app.api.v1.endpoints import health, classification, routing

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(classification.router, tags=["Classification"])
api_router.include_router(routing.router, tags=["Routing"])
