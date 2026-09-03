from typing import Tuple

class PriorityDetector:
    """
    Evaluates dynamic urgency score and assigns SLA deadline estimates.
    """

    CRITICAL_KEYWORDS = {
        "spark", "sparking", "fire", "electrocution", "collapse", "gas leak", "burst",
        "emergency", "poisonous", "contamination", "fatal", "casualty", "danger",
        "live wire", "open manhole", "deep crater accident", "short circuit"
    }

    HIGH_KEYWORDS = {
        "overflow", "hospital", "patient", "dengue", "accident", "broken wire",
        "no water", "blackout", "outage", "urgent", "hazard", "deep pothole",
        "power cut", "powercut", "no electricity", "waterlogging", "stench", "cholera",
        "sewage", "dirty water", "smelly", "leaking"
    }

    MEDIUM_KEYWORDS = {
        "delay", "garbage", "meter", "billing", "street light", "cleaning",
        "slow", "pothole", "maintenance", "certificate", "mutation", "noise"
    }

    @classmethod
    def evaluate_priority(cls, text: str) -> Tuple[str, int, bool]:
        """
        Returns (priority_str, estimated_sla_hours, is_urgent)
        """
        lower = text.lower()

        for kw in cls.CRITICAL_KEYWORDS:
            if kw in lower:
                return "CRITICAL", 6, True

        for kw in cls.HIGH_KEYWORDS:
            if kw in lower:
                return "HIGH", 24, True

        for kw in cls.MEDIUM_KEYWORDS:
            if kw in lower:
                return "MEDIUM", 48, False

        return "LOW", 72, False
