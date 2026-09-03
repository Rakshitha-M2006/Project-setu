from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    PredictRequest,
    PredictResponse,
    GrievanceAnalysisRequest,
    GrievanceClassificationResponse,
    AnomalyCheckRequest,
    AnomalyCheckResponse
)
from app.core.config import settings
from app.services.nlp_classifier import NLPClassifier
from app.services.priority_detector import PriorityDetector
from app.services.department_router import DepartmentRouter

router = APIRouter()

def execute_prediction(title: str, description: str, raw_text: str = "") -> PredictResponse:
    combined_text = f"{title} {description} {raw_text}".strip()
    keywords = NLPClassifier.extract_keywords(combined_text)
    sentiment = NLPClassifier.detect_sentiment(combined_text)
    priority, sla_hours, is_urgent = PriorityDetector.evaluate_priority(combined_text)
    routing = DepartmentRouter.predict(title, description)

    confidence = routing["confidence"]
    is_below_threshold = confidence < settings.CONFIDENCE_THRESHOLD
    requires_human_review = is_below_threshold

    summary = (
        f"Classified as '{routing['issue_type']}' under '{routing['department']}' "
        f"with {priority} priority (Confidence: {confidence * 100:.1f}%). "
        f"{'Requires manual human officer review.' if requires_human_review else 'Eligible for auto-routing.'}"
    )

    return PredictResponse(
        category=routing["category"],
        department=routing["department"],
        department_code=routing["department_code"],
        issue_type=routing["issue_type"],
        priority=priority,
        confidence=confidence,
        is_urgent=is_urgent,
        sentiment=sentiment,
        extracted_keywords=keywords,
        suggested_sla_hours=sla_hours,
        is_below_threshold=is_below_threshold,
        requires_human_review=requires_human_review,
        summary=summary,
        model_version=settings.MODEL_VERSION,
        raw_inference={
            "match_score": routing["match_score"],
            "threshold_configured": settings.CONFIDENCE_THRESHOLD,
            "sentiment_detected": sentiment,
        }
    )

@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Primary AI Grievance Classification & Triage Endpoint",
    status_code=status.HTTP_200_OK
)
def predict_endpoint(request: PredictRequest):
    """
    Classifies raw grievance text into:
    - category
    - department & department_code
    - issue_type
    - priority (CRITICAL, HIGH, MEDIUM, LOW)
    - confidence score (0.0 - 1.0)
    - SLA turnaround suggestion
    - Human review flag (confidence < configurable threshold)
    """
    try:
        title = request.title or (request.text[:80] if request.text else "Grievance")
        description = request.description or request.text or ""
        return execute_prediction(title, description, request.text or "")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification inference error: {str(e)}"
        )

@router.post(
    "/classify",
    response_model=GrievanceClassificationResponse,
    summary="Legacy compatibility classification endpoint"
)
def classify_endpoint(request: GrievanceAnalysisRequest):
    try:
        pred = execute_prediction(request.title, request.description)
        return GrievanceClassificationResponse(
            category=pred.category,
            suggested_department=pred.department_code,
            confidence_score=pred.confidence,
            priority=pred.priority,
            estimated_sla_hours=pred.suggested_sla_hours,
            extracted_keywords=pred.extracted_keywords,
            sentiment=pred.sentiment,
            is_urgent=pred.is_urgent,
            summary=pred.summary,
            requires_human_review=pred.requires_human_review,
            is_below_threshold=pred.is_below_threshold,
            issue_type=pred.issue_type,
            department_code=pred.department_code,
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
    if len(text) < 10 or len(set(text.split())) < 3:
        return AnomalyCheckResponse(
            is_spam_or_gibberish=True,
            is_duplicate=False,
            similarity_score=0.0,
            reason="Complaint text is insufficiently descriptive or repetitive."
        )

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
