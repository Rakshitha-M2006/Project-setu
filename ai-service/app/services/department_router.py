from app.services.nlp_classifier import NLPClassifier
from typing import Tuple, Dict, Any

class DepartmentRouter:
    """
    Routes grievance text to the most relevant government department and specific issue type.
    """

    @classmethod
    def predict(cls, title: str, description: str) -> Dict[str, Any]:
        """
        Calculates match score across departments and sub-issue types.
        Returns: {
            "department": str,
            "department_code": str,
            "category": str,
            "issue_type": str,
            "confidence": float,
            "match_score": int
        }
        """
        combined = f"{title} {description}".lower()
        dept_scores = {}
        dept_issue_matches = {}

        for code, data in NLPClassifier.DEPARTMENT_TAXONOMY.items():
            score = 0
            keywords = data["keywords"]

            for kw in keywords:
                if kw in combined:
                    # Give higher weight to matches in the title
                    if kw in title.lower():
                        score += 3
                    else:
                        score += 1

            dept_scores[code] = score

            # Find matching issue type
            best_issue = "General Department Issue"
            best_issue_score = 0
            for issue_name, issue_kws in data.get("issues", []):
                i_score = sum(1 for ik in issue_kws if ik in combined)
                if i_score > best_issue_score:
                    best_issue_score = i_score
                    best_issue = issue_name

            dept_issue_matches[code] = best_issue

        best_dept_code = max(dept_scores, key=dept_scores.get)
        max_score = dept_scores[best_dept_code]

        # If zero keywords matched, return General Administration with low confidence (< 0.85)
        if max_score == 0:
            return {
                "department": "General Administration Department",
                "department_code": "GENERAL_ADMINISTRATION",
                "category": "General Civic Query / Administration",
                "issue_type": "General Civic Issue",
                "confidence": 0.50,
                "match_score": 0
            }

        dept_meta = NLPClassifier.DEPARTMENT_TAXONOMY[best_dept_code]
        issue_type = dept_issue_matches.get(best_dept_code, "General Civic Issue")

        # Confidence calculation:
        # 1 match: 0.75 (below threshold, needs human review)
        # 2 matches: 0.86 (above 0.85 threshold)
        # 3+ matches: 0.92 - 0.98
        if max_score == 1:
            confidence = 0.75
        elif max_score == 2:
            confidence = 0.86
        elif max_score == 3:
            confidence = 0.92
        else:
            confidence = min(0.98, 0.92 + (max_score - 3) * 0.02)

        return {
            "department": dept_meta["department_name"],
            "department_code": best_dept_code,
            "category": dept_meta["category"],
            "issue_type": issue_type,
            "confidence": round(confidence, 2),
            "match_score": max_score
        }
