# PROJECT SETU - AI Microservice

This microservice handles all Natural Language Processing (NLP), dynamic priority scoring, anomaly detection, and department routing tasks for **PROJECT SETU**.

---

## 🧠 Capabilities

1. **Grievance Classification (`/api/v1/classify`)**:
   - Tokenizes and extracts semantic keywords from citizen complaints.
   - Categorizes complaints into structured municipal problem domains.
2. **Dynamic Priority Detection (`/api/v1/priority`)**:
   - Analyzes urgency keywords, public safety risks, and hazard indicators.
   - Computes SLA deadline recommendations (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
3. **Department Routing (`/api/v1/route`)**:
   - Assigns corresponding department code (e.g. `WATER_SUPPLY`, `ELECTRICITY`, `ROADS_HIGHWAYS`, `HEALTH_SANITATION`).
   - Emits a routing confidence score.
4. **Anomaly & Duplicate Detection (`/api/v1/anomaly-check`)**:
   - Flags potential spam, gibberish, or duplicate grievance submissions.

---

## 🚀 Running the Service

### 1. Setup Virtual Environment
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
```

### 2. Install Requirements
```bash
pip install -r requirements.txt
```

### 3. Start Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
