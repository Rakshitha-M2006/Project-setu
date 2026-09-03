import sys
from app.services.nlp_classifier import NLPClassifier
from app.api.v1.endpoints.classification import PredictRequest, predict_endpoint

def test_ai_microservice():
    print("==================================================================")
    print("TESTING PYTHON FASTAPI AI MICROSERVICE INFERENCE ENGINE")
    print("==================================================================")

    # 1. Test Direct NLP Classifier (Electricity)
    req1 = PredictRequest(
        title="Transformer spark and power cut",
        description="Transformer exploded on main road and entire block is without electricity",
        pincode="110085",
        address_text="Rohini Sector 14"
    )
    res1 = predict_endpoint(req1)
    print(f"  [Test 1] Power Cut: Dept={res1.department_code}, Conf={res1.confidence}, Priority={res1.priority}")
    assert res1.department_code == "ELECTRICITY", f"Expected ELECTRICITY, got {res1.department_code}"
    assert res1.confidence >= 0.85, f"Expected high confidence, got {res1.confidence}"
    assert res1.requires_human_review == False, "Expected auto-route"

    # 2. Test Water Contamination
    req2 = PredictRequest(
        title="Muddy contaminated tap water",
        description="Drinking water pipeline is leaking sewage and smelly dirty water coming from tap",
        pincode="110001",
        address_text="Connaught Place"
    )
    res2 = predict_endpoint(req2)
    print(f"  [Test 2] Dirty Water: Dept={res2.department_code}, Conf={res2.confidence}, Priority={res2.priority}")
    assert res2.department_code == "WATER_SUPPLY", f"Expected WATER_SUPPLY, got {res2.department_code}"
    assert res2.priority in ["HIGH", "CRITICAL"], f"Expected HIGH/CRITICAL priority, got {res2.priority}"

    # 3. Test Ambiguous Input (Below Threshold Human Review)
    req3 = PredictRequest(
        title="Need urgent attention",
        description="Please look into this issue immediately",
        pincode="110001"
    )
    res3 = predict_endpoint(req3)
    print(f"  [Test 3] Ambiguous Input: Dept={res3.department_code}, Conf={res3.confidence}, HumanReview={res3.requires_human_review}")
    assert res3.requires_human_review == True, "Expected requires_human_review=True"

    print("\n[SUCCESS] All Python AI Microservice Tests Passed Successfully!")

if __name__ == "__main__":
    try:
        test_ai_microservice()
    except Exception as e:
        print(f"[FAILED] Test Failed: {e}")
        sys.exit(1)
