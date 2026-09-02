from fastapi import APIRouter
from app.models.schemas import GrievanceAnalysisRequest
from app.services.department_router import DepartmentRouter
from pydantic import BaseModel

router = APIRouter()

class RouteResponse(BaseModel):
    suggested_department: str
    predicted_category: str
    confidence_score: float

@router.post(
    "/route",
    response_model=RouteResponse,
    summary="Direct Department Routing Prediction"
)
def route_grievance(request: GrievanceAnalysisRequest):
    dept, cat, confidence = DepartmentRouter.predict_department(request.title, request.description)
    return RouteResponse(
        suggested_department=dept.value,
        predicted_category=cat,
        confidence_score=confidence
    )
