import re
from typing import List, Tuple, Dict

class NLPClassifier:
    """
    Lightweight rule-based and semantic NLP tokenization engine for
    Smart India Hackathon 2026 grievance classification.
    """

    STOP_WORDS = {
        "a", "an", "the", "in", "on", "at", "to", "for", "from", "by", "with",
        "and", "or", "is", "are", "was", "were", "this", "that", "there", "it",
        "of", "be", "has", "have", "had", "my", "our", "we", "i", "please", "kindly",
        "sir", "madam", "issue", "problem", "complaint", "area"
    }

    CATEGORY_MAPPINGS = {
        "WATER_SUPPLY": [
            "water", "drinking", "pipeline", "leakage", "sewage", "drainage",
            "tap", "borewell", "contamination", "dirty water", "low pressure",
            "jal", "paani", "overflow"
        ],
        "ELECTRICITY": [
            "electricity", "power", "powercut", "blackout", "transformer",
            "sparking", "voltage", "meter", "current", "wire", "pole", "light",
            "bijli", "generator", "fuse"
        ],
        "ROADS_HIGHWAYS": [
            "road", "pothole", "highway", "traffic", "pavement", "footpath",
            "bridge", "asphalt", "flyover", "street", "divider", "tar", "sadak"
        ],
        "HEALTH_SANITATION": [
            "garbage", "trash", "waste", "sanitation", "hospital", "clinic",
            "doctor", "medicine", "dengue", "malaria", "mosquito", "smell",
            "dump", "swachh", "safai"
        ],
        "REVENUE_LAND": [
            "land", "patta", "property", "tax", "mutation", "survey", "encroachment",
            "registry", "revenue", "tehsildar", "khata", "deed"
        ],
        "WOMEN_CHILD": [
            "women", "child", "anganwadi", "harassment", "midday meal", "poshan",
            "safety", "scholarship", "girl", "matrutva"
        ]
    }

    @classmethod
    def extract_keywords(cls, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        meaningful = [w for w in words if w not in cls.STOP_WORDS]
        # Return unique preserved order
        seen = set()
        result = []
        for w in meaningful:
            if w not in seen:
                seen.add(w)
                result.append(w)
        return result[:10]

    @classmethod
    def detect_sentiment(cls, text: str) -> str:
        lower = text.lower()
        negative_words = ["urgent", "danger", "hazard", "worst", "unacceptable", "broken", "critical", "helpless", "fire", "spark"]
        positive_words = ["resolved", "thank", "appreciate", "good", "satisfied", "helpful"]

        neg_count = sum(1 for w in negative_words if w in lower)
        pos_count = sum(1 for w in positive_words if w in lower)

        if neg_count > pos_count:
            return "FRUSTRATED_CRITICAL" if neg_count >= 2 else "DISSATISFIED"
        elif pos_count > neg_count:
            return "SATISFIED"
        return "NEUTRAL"
