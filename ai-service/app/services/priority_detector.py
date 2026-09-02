from app.models.schemas import PriorityEnum
from typing import Tuple

class PriorityDetector:
    """
    Evaluates dynamic urgency score and assigns SLA deadline estimates.
    """

    CRITICAL_KEYWORDS = {
        "spark", "fire", "electrocution", "collapse", "gas leak", "burst",
        "emergency", "poisonous", "contamination", "fatal", "casualty", "danger"
    }

    HIGH_KEYWORDS = {
        "overflow", "hospital", "patient", "dengue", "accident", "broken wire",
        "no water", "blackout", "urgent", "hazard", "deep pothole"
    }

    MEDIUM_KEYWORDS = {
        "delay", "garbage", "meter", "billing", "street light", "cleaning",
        "slow", "pothole", "stench", "maintenance"
    }

    @classmethod
    def evaluate_priority(cls, text: str) -> Tuple[PriorityEnum, int, bool]:
        """
        Returns (PriorityEnum, estimated_sla_hours, is_urgent)
        """
        lower = text.lower()

        for kw in cls.CRITICAL_KEYWORDS:
            if kw in lower:
                return PriorityEnum.CRITICAL, 6, True

        for kw in cls.HIGH_KEYWORDS:
            if kw in lower:
                return PriorityEnum.HIGH, 24, True

        for kw in cls.MEDIUM_KEYWORDS:
            if kw in lower:
                return PriorityEnum.MEDIUM, 48, False

        return PriorityEnum.LOW, 72, False
