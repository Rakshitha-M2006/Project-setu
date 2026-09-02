from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class PriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class DepartmentCodeEnum(str, Enum):
    WATER_SUPPLY = "WATER_SUPPLY"
    ELECTRICITY = "ELECTRICITY"
    ROADS_HIGHWAYS = "ROADS_HIGHWAYS"
    HEALTH_SANITATION = "HEALTH_SANITATION"
    REVENUE_LAND = "REVENUE_LAND"
    WOMEN_CHILD = "WOMEN_CHILD"
    GENERAL_ADMINISTRATION = "GENERAL_ADMINISTRATION"

class GrievanceAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="Headline or title of grievance")
    description: str = Field(..., min_length=5, description="Full description of the citizen complaint")
    location: Optional[str] = Field(None, description="Location or address if mentioned")
    pincode: Optional[str] = Field(None, description="Postal pincode")

class GrievanceClassificationResponse(BaseModel):
    category: str
    suggested_department: DepartmentCodeEnum
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    priority: PriorityEnum
    estimated_sla_hours: int
    extracted_keywords: List[str]
    sentiment: str
    is_urgent: bool
    summary: str

class AnomalyCheckRequest(BaseModel):
    text: str
    previous_submissions: Optional[List[str]] = []

class AnomalyCheckResponse(BaseModel):
    is_spam_or_gibberish: bool
    is_duplicate: bool
    similarity_score: float
    reason: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
