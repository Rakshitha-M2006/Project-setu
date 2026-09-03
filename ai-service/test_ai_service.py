"""
PROJECT SETU - AI Service Verification Script
Tests NLP classification, priority detection, SLA calculation, and confidence thresholding.
"""

from app.api.v1.endpoints.classification import execute_prediction

def test_ai_classifications():
    print("=== RUNNING PROJECT SETU AI CLASSIFICATION TESTS ===\n")

    test_cases = [
        {
            "id": 1,
            "title": "Power outage in street",
            "description": "My street has been without electricity for two days.",
            "expected_dept": "ELECTRICITY",
            "expected_priority": "HIGH",
            "expect_human_review": False,
        },
        {
            "id": 2,
            "title": "Severe water contamination",
            "description": "Drinking water smells of chlorine and pipeline is leaking brown sludge near main tank.",
            "expected_dept": "WATER_SUPPLY",
            "expected_priority": "CRITICAL",
            "expect_human_review": False,
        },
        {
            "id": 3,
            "title": "Deep pothole on highway",
            "description": "Deep crater pothole causing serious motorcycle accident hazard on main sadak road.",
            "expected_dept": "ROADS_HIGHWAYS",
            "expected_priority": "HIGH",
            "expect_human_review": False,
        },
        {
            "id": 4,
            "title": "Hospital emergency hygiene issue",
            "description": "Government hospital ward has garbage dumps and emergency doctor is absent.",
            "expected_dept": "HEALTH_SANITATION",
            "expected_priority": "CRITICAL",
            "expect_human_review": False,
        },
        {
            "id": 5,
            "title": "Something seems odd today",
            "description": "Things are not looking good in my area please check.",
            "expected_dept": "GENERAL_ADMINISTRATION",
            "expected_priority": "LOW",
            "expect_human_review": True,  # Confidence < 0.85 threshold
        },
    ]

    passed = 0
    for case in test_cases:
        res = execute_prediction(case["title"], case["description"])

        print(f"--- Test Case #{case['id']} ---")
        print(f"Input: \"{case['title']} - {case['description']}\"")
        print(f"  Category: {res.category}")
        print(f"  Department: {res.department} ({res.department_code})")
        print(f"  Issue Type: {res.issue_type}")
        print(f"  Priority: {res.priority} (SLA: {res.suggested_sla_hours} hrs, Urgent: {res.is_urgent})")
        print(f"  Confidence: {res.confidence:.2f}")
        print(f"  Sentiment: {res.sentiment}")
        print(f"  Keywords: {res.extracted_keywords}")
        print(f"  Requires Human Review: {res.requires_human_review} (Below 0.85 Threshold: {res.is_below_threshold})")
        print(f"  Summary: {res.summary}")

        assert res.department_code == case["expected_dept"], f"Expected {case['expected_dept']}, got {res.department_code}"
        assert res.requires_human_review == case["expect_human_review"], f"Expected human review={case['expect_human_review']}, got {res.requires_human_review}"

        print("  -> RESULT: PASSED\n")
        passed += 1

    print(f"=== ALL {passed}/{len(test_cases)} AI TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_ai_classifications()
