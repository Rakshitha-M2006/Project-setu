from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
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

class PredictRequest(BaseModel):
    text: Optional[str] = Field(None, description="Raw grievance text or complaint statement")
    title: Optional[str] = Field(None, description="Title or headline of grievance")
    description: Optional[str] = Field(None, description="Full description of the citizen complaint")
    address_text: Optional[str] = Field(None, description="Physical location or street address")
    pincode: Optional[str] = Field(None, description="Postal pincode")

class PredictResponse(BaseModel):
    category: str
    department: str
    department_code: str
    issue_type: str
    priority: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    is_urgent: bool
    sentiment: str
    extracted_keywords: List[str]
    suggested_sla_hours: int
    is_below_threshold: bool
    requires_human_review: bool
    summary: str
    model_version: str = "1.0.0-nlp-rules"
    raw_inference: Optional[Dict[str, Any]] = None

# Backward compatibility request / response models
class GrievanceAnalysisRequest(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    pincode: Optional[str] = None

class GrievanceClassificationResponse(BaseModel):
    category: str
    suggested_department: str
    confidence_score: float
    priority: str
    estimated_sla_hours: int
    extracted_keywords: List[str]
    sentiment: str
    is_urgent: bool
    summary: str
    requires_human_review: bool = False
    is_below_threshold: bool = False
    issue_type: str = "General Civic Issue"
    department_code: str = "GENERAL_ADMINISTRATION"

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
    confidence_threshold: float
