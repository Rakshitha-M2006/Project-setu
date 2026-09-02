from app.models.schemas import DepartmentCodeEnum
from app.services.nlp_classifier import NLPClassifier
from typing import Tuple

class DepartmentRouter:
    """
    Routes grievance text to the most relevant government department.
    """

    @classmethod
    def predict_department(cls, title: str, description: str) -> Tuple[DepartmentCodeEnum, str, float]:
        """
        Calculates match score across departments.
        Returns: (DepartmentCodeEnum, predicted_category, confidence_score)
        """
        combined = f"{title} {description}".lower()
        dept_scores = {}

        for dept, keywords in NLPClassifier.CATEGORY_MAPPINGS.items():
            score = 0
            for kw in keywords:
                if kw in combined:
                    # Title matches have higher weight
                    if kw in title.lower():
                        score += 3
                    else:
                        score += 1
            dept_scores[dept] = score

        best_dept_str = max(dept_scores, key=dept_scores.get)
        max_score = dept_scores[best_dept_str]

        if max_score == 0:
            return (
                DepartmentCodeEnum.GENERAL_ADMINISTRATION,
                "General Civic Query / Administration",
                0.50
            )

        # Normalize confidence between 0.65 and 0.98 based on match strength
        confidence = min(0.98, 0.65 + (max_score * 0.05))
        category_name = f"{best_dept_str.replace('_', ' ').title()} Redressal"

        return (
            DepartmentCodeEnum(best_dept_str),
            category_name,
            round(confidence, 2)
        )
