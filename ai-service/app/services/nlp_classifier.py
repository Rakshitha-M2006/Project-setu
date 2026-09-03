import re
from typing import List, Tuple, Dict, Any

class NLPClassifier:
    """
    Lightweight rule-based and semantic NLP tokenization engine for
    PROJECT SETU citizen grievance classification.
    Can be replaced or augmented with transformer embeddings (e.g., IndicBERT / RoBERTa).
    """

    STOP_WORDS = {
        "a", "an", "the", "in", "on", "at", "to", "for", "from", "by", "with",
        "and", "or", "is", "are", "was", "were", "this", "that", "there", "it",
        "of", "be", "has", "have", "had", "my", "our", "we", "i", "please", "kindly",
        "sir", "madam", "issue", "problem", "complaint", "area", "locality", "since",
        "day", "days", "past", "yesterday", "been", "having", "very", "much"
    }

    # Department taxonomy & semantic dictionary
    DEPARTMENT_TAXONOMY = {
        "ELECTRICITY": {
            "department_name": "Electricity Department",
            "category": "Electricity & Power Supply",
            "keywords": [
                "electricity", "power", "powercut", "blackout", "transformer",
                "sparking", "voltage", "meter", "current", "wire", "pole", "light",
                "bijli", "generator", "fuse", "outage", "shock", "electrocution",
                "high voltage", "low voltage", "substation", "line fault"
            ],
            "issues": [
                ("Power Outage / Line Fault", ["outage", "powercut", "blackout", "no electricity", "power"]),
                ("Transformer Failure / Sparking", ["transformer", "sparking", "fire", "blast", "explosion"]),
                ("Voltage Fluctuation", ["voltage", "fluctuation", "high voltage", "low voltage"]),
                ("Faulty Smart Meter / Billing", ["meter", "reading", "bill", "billing", "smart meter"]),
                ("Fallen Pole / Live Wire Hazard", ["pole", "wire", "broken wire", "live wire", "hanging"])
            ]
        },
        "WATER_SUPPLY": {
            "department_name": "Department of Water Supply",
            "category": "Water Supply & Sewerage",
            "keywords": [
                "water", "drinking", "pipeline", "leakage", "leak", "burst", "sewage", "drainage",
                "tap", "borewell", "contamination", "dirty water", "low pressure",
                "jal", "paani", "overflow", "drain", "shortage", "chlorine", "tanker",
                "smelly water", "muddy water", "pipe burst"
            ],
            "issues": [
                ("Drinking Water Contamination", ["contamination", "dirty water", "smelly", "muddy", "yellow", "chlorine"]),
                ("Water Pipeline Burst / Leakage", ["leakage", "leak", "burst", "pipeline", "broken pipe", "overflow"]),
                ("Low Pressure / No Water Supply", ["no water", "shortage", "low pressure", "dry tap", "tanker"]),
                ("Sewage & Drainage Overflow", ["sewage", "drain", "drainage", "overflow", "manhole", "gutter"])
            ]
        },
        "ROADS_HIGHWAYS": {
            "department_name": "Public Works Department (PWD)",
            "category": "Roads, Bridges & Infrastructure",
            "keywords": [
                "road", "pothole", "potholes", "highway", "traffic", "pavement", "footpath",
                "bridge", "asphalt", "flyover", "street", "divider", "tar", "sadak",
                "crater", "debris", "streetlight", "street light", "speed breaker"
            ],
            "issues": [
                ("Severe Potholes / Road Damage", ["pothole", "potholes", "crater", "damaged road", "asphalt", "broken road"]),
                ("Dark Spot / Streetlight Outage", ["streetlight", "street light", "dark", "no light", "lamp"]),
                ("Footpath & Pavement Obstruction", ["footpath", "pavement", "sidewalk", "pedestrian", "divider"]),
                ("Stormwater Drain & Waterlogging", ["waterlogging", "flooding", "water accumulation", "drain clog"])
            ]
        },
        "HEALTH_SANITATION": {
            "department_name": "Department of Health & Family Welfare",
            "category": "Public Health & Hospital Care",
            "keywords": [
                "garbage", "trash", "waste", "sanitation", "hospital", "clinic",
                "doctor", "medicine", "dengue", "malaria", "mosquito", "smell",
                "dump", "swachh", "safai", "ambulance", "nurse", "ward", "hygiene",
                "medical", "health center", "phc", "stagnant water"
            ],
            "issues": [
                ("Hospital Hygiene & Doctor Absence", ["hospital", "doctor", "clinic", "nurse", "absent", "medicine", "ward"]),
                ("Dengue / Mosquito Vector Threat", ["dengue", "malaria", "mosquito", "breeding", "stagnant water"]),
                ("Garbage Dump & Waste Stench", ["garbage", "trash", "waste", "dump", "stench", "smell", "safai"]),
                ("Emergency Care & Ambulance Delay", ["ambulance", "emergency", "denied", "icu", "critical care"])
            ]
        },
        "REVENUE_LAND": {
            "department_name": "Department of Revenue & Land Administration",
            "category": "Land Records, Mutation & Revenue",
            "keywords": [
                "land", "patta", "property", "tax", "mutation", "survey", "encroachment",
                "registry", "revenue", "tehsildar", "khata", "deed", "caste certificate",
                "income certificate", "land dispute", "bribe", "patwari"
            ],
            "issues": [
                ("Land Record & Mutation Delay", ["mutation", "khata", "land record", "patta", "registry", "survey"]),
                ("Government Certificate Delay", ["caste certificate", "income certificate", "domicile", "certificate"]),
                ("Illegal Land Encroachment", ["encroachment", "illegal construction", "boundary dispute", "grab"])
            ]
        },
        "WOMEN_CHILD": {
            "department_name": "Department of Women & Child Development",
            "category": "Women Safety & Child Welfare",
            "keywords": [
                "women", "child", "anganwadi", "harassment", "midday meal", "poshan",
                "safety", "scholarship", "girl", "matrutva", "nutrition", "infant",
                "creche", "maternity", "domestic violence"
            ],
            "issues": [
                ("Anganwadi Nutrition & Meal Supply", ["anganwadi", "poshan", "nutrition", "midday meal", "ration"]),
                ("Maternity Scheme & Benefit Delay", ["maternity", "matrutva", "scheme", "benefit", "grant"]),
                ("Women Safety & Harassment Helpline", ["harassment", "safety", "threat", "violence", "stalking"])
            ]
        }
    }

    @classmethod
    def extract_keywords(cls, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        meaningful = [w for w in words if w not in cls.STOP_WORDS]
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
        critical_words = ["urgent", "danger", "hazard", "fire", "blast", "spark", "poison", "fatal", "accident", "dying", "collapsed"]
        frustrated_words = ["worst", "unacceptable", "broken", "useless", "pathetic", "delay", "negligence", "suffering", "no one cares"]
        positive_words = ["thank", "resolved", "appreciate", "good", "satisfied", "helpful", "prompt"]

        if any(w in lower for w in critical_words):
            return "FRUSTRATED_CRITICAL"

        frustrated_count = sum(1 for w in frustrated_words if w in lower)
        pos_count = sum(1 for w in positive_words if w in lower)

        if frustrated_count > pos_count:
            return "FRUSTRATED" if frustrated_count >= 2 else "DISSATISFIED"
        elif pos_count > frustrated_count:
            return "SATISFIED"
        return "NEUTRAL"
