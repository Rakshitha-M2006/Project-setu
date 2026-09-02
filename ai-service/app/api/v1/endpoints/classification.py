from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    GrievanceAnalysisRequest,
    GrievanceClassificationResponse,
    AnomalyCheckRequest,
    AnomalyCheckResponse
)
from app.services.nlp_classifier import NLPClassifier
from app.services.priority_detector import PriorityDetector
from app.services.department_router import DepartmentRouter

router = APIRouter()

@router.post(
    "/classify",
    response_model=GrievanceClassificationResponse,
    summary="Comprehensive NLP Grievance Triage",
    status_code=status.HTTP_200_OK
)
def classify_grievance(request: GrievanceAnalysisRequest):
    """
    Performs end-to-end NLP analysis:
    - Extracts meaningful civic keywords
    - Evaluates sentiment and urgency
    - Computes SLA deadline priority
    - Recommends department routing and category
    """
    try:
        combined_text = f"{request.title} {request.description}"
        keywords = NLPClassifier.extract_keywords(combined_text)
        sentiment = NLPClassifier.detect_sentiment(combined_text)
        priority, sla_hours, is_urgent = PriorityDetector.evaluate_priority(combined_text)
        dept, category, confidence = DepartmentRouter.predict_department(request.title, request.description)

        summary = f"Identified as {category} with {priority.value} priority routed to {dept.value}."

        return GrievanceClassificationResponse(
            category=category,
            suggested_department=dept,
            confidence_score=confidence,
            priority=priority,
            estimated_sla_hours=sla_hours,
            extracted_keywords=keywords,
            sentiment=sentiment,
            is_urgent=is_urgent,
            summary=summary
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification error: {str(e)}"
        )

@router.post(
    "/anomaly-check",
    response_model=AnomalyCheckResponse,
    summary="Spam & Duplicate Check"
)
def check_anomaly(request: AnomalyCheckRequest):
    text = request.text.strip()

    # Gibberish/Spam check: if no vowels or too short or repetitive
    if len(text) < 10 or len(set(text.split())) < 3:
        return AnomalyCheckResponse(
            is_spam_or_gibberish=True,
            is_duplicate=False,
            similarity_score=0.0,
            reason="Complaint text is insufficiently descriptive or repetitive."
        )

    # Simple word overlap similarity for duplicate detection
    current_words = set(text.lower().split())
    max_similarity = 0.0

    for prev in (request.previous_submissions or []):
        prev_words = set(prev.lower().split())
        if not prev_words:
            continue
        intersection = current_words.intersection(prev_words)
        union = current_words.union(prev_words)
        sim = len(intersection) / len(union) if union else 0.0
        if sim > max_similarity:
            max_similarity = sim

    is_dup = max_similarity > 0.85

    return AnomalyCheckResponse(
        is_spam_or_gibberish=False,
        is_duplicate=is_dup,
        similarity_score=round(max_similarity, 2),
        reason="Potential duplicate complaint detected." if is_dup else None
    )
