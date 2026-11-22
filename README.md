# NetGuard AI: AI-Powered Network Intrusion Detection & Real-Time Threat Monitoring System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Model Accuracy](https://img.shields.io/badge/Accuracy-98.08%25-brightgreen.svg)]()

> **IMPORTANT SCOPE NOTICE**: NetGuard AI is a dataset-based network threat detection and simulation platform trained on the benchmark **CICIDS-2017** dataset. It demonstrates unidirectional flow telemetry ingestion, machine learning inference, real-time alert generation, and forensic evidence extraction. It is not a raw kernel promiscuous packet sniffer.

---

## 1. System Overview

NetGuard AI is a cybersecurity monitoring platform built to enterprise SOC (Security Operations Center) standards. It processes unidirectional network-flow telemetry, executes multi-class threat classification with a trained Random Forest model, and streams telemetry and forensic dossiers to a live monitoring dashboard.

### Core Capabilities
- **Scenario A — Normal Baseline Ingestion**: Continuous replay of benign network flows, maintaining green DEFCON status, live traffic rate graphs, and "ALL SYSTEMS NORMAL" monitoring.
- **Scenario B — Dynamic Threat Injection**: On-demand injection of network attack bursts across 6 dataset categories: **DoS**, **DDoS**, **PortScan**, **Bot**, **Web Attack**, and **Infiltration**.
- **Real-Time ML Inference**: Supervised multi-class Random Forest evaluated on hold-out test data achieving **98.08% accuracy** and **98.07% macro F1-score**. True model confidence scores (`predict_proba`) and extracted feature evidence.
- **Persistent SOC Alert Store**: SQLite-backed alert repository storing unique alert IDs, timestamps, source/destination IPs, ports, protocols, severity ratings, and forensic dossiers.
- **WebSocket Gateway**: High-frequency duplex streaming broadcasting traffic rates, flow counters, time-series metrics, and immediate alert notifications.

---

## 2. Architecture Diagram

```
                             +------------------------------------------+
                             |           CICIDS-2017 Dataset            |
                             |  (data/raw/ or Benchmark Generator)      |
                             +--------------------+---------------------+
                                                  |
                                                  v
                               +--------------------------------------+
                               |       scripts/prepare_dataset.py     |
                               |  - Column Normalization              |
                               |  - Duplicate & Inf/NaN Handling      |
                               |  - Stratified Class Balancing        |
                               +------------------+-------------------+
                                                  |
                                                  v
                               +--------------------------------------+
                               |       backend/models/train.py        |
                               |  - Zero Data Leakage Train/Test Split|
                               |  - StandardScaler Preprocessor       |
                               |  - RandomForestClassifier Training   |
                               +------------------+-------------------+
                                                  |
                  +-------------------------------+-------------------------------+
                  |                                                               |
                  v                                                               v
      +------------------------+                                      +------------------------+
      |  models/trained/       |                                      |  models/evaluation/    |
      |  - model.joblib        |                                      |  - metrics.json        |
      |  - preprocessor.joblib |                                      |  - confusion_matrix    |
      +-----------+------------+                                      +------------------------+
                  |
                  v
+--------------------------------------------------------------------------------------------------+
|                                    FASTAPI BACKEND RUNTIME                                        |
|                                                                                                  |
|   +-----------------------+      +-----------------------+      +----------------------------+   |
|   |   TrafficReplayer     | ---> |    ThreatDetector     | ---> |      AlertStore (SQLite)   |   |
|   |  - Non-blocking loop  |      |  - True probabilities |      |  - Persistent alert table  |   |
|   |  - Benign streaming   |      |  - Evidence extraction|      |  - Indexed timestamps/cats |   |
|   |  - Attack injections  |      |  - Severity mapping   |      +----------------------------+   |
|   +-----------+-----------+      +-----------------------+                                       |
|               |                                                                                  |
|               +-----------------------------+------------------------------------+               |
|                                             |                                    |               |
|                                             v                                    v               |
|                              +-----------------------------+      +----------------------------+ |
|                              |      StatisticsService      |      |      WebSocketManager      | |
|                              |  - Sliding-window rates     |      |  - /ws/live broadcast      | |
|                              |  - 60s time-series buckets  |      |  - Auto disconnect cleanup | |
|                              +-----------------------------+      +--------------+-------------+ |
+----------------------------------------------------------------------------------|---------------+
                                                                                   |
                                                                   WebSockets &    |
                                                                   REST APIs       v
+--------------------------------------------------------------------------------------------------+
|                                  REACT + VITE FRONTEND (SOC DASHBOARD)                           |
|                                                                                                  |
|  - Sidebar Navigation (SOC Overview, Live Telemetry, Threat Intel, Alert History, Models)        |
|  - Header (DEFCON indicator, Ingestion rate, UTC clock, WebSocket status)                        |
|  - Main Status Banner ("ALL SYSTEMS NORMAL" / "THREAT DETECTED — UNDER ATTACK")                  |
|  - 4 Key Metrics Cards (Flows, Rate, Total Threats, Average Confidence)                          |
|  - Simulation Console (START, STOP, INJECT ATTACK with category dropdown, RESET, Speed 0.5x-5x)  |
|  - Recharts Ingestion Chart (60-second time-series area chart of normal vs suspicious flows)     |
|  - Threat Donut Chart (Proportional incursion category distribution)                             |
|  - Live Alert Feed & Timeline (Real-time tabular incident stream and chronological log)          |
|  - Forensic Evidence Dossier Modal (Detailed flow telemetry, destination, and top feature values)|
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend & ML** | Python 3.11+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Joblib, Pydantic v2, SQLite |
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, Recharts, Lucide React, WebSocket Client |
| **Testing** | Pytest, AnyIO, HTTPX |
| **DevOps & Containers** | Docker, Docker Compose, Nginx Alpine, Vercel, Render, Railway |

---

## 4. Repository Structure

```
netguard-ai/
├── backend/
│   ├── main.py                  # FastAPI server & route handlers
│   ├── config.py                # Pydantic settings & environment configuration
│   ├── detector.py              # ML inference engine & feature evidence extraction
│   ├── replayer.py              # Async non-blocking network flow replayer
│   ├── alert_store.py           # SQLite persistent alert store
│   ├── schemas.py               # Pydantic request/response models
│   ├── websocket_manager.py     # Live telemetry broadcast manager
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Production container definition
│   ├── models/
│   │   ├── train.py             # Model training script with train/test split
│   │   ├── preprocessing.py     # Preprocessing pipeline (StandardScaler + Imputer)
│   │   ├── trained/             # Serialized model & preprocessor artifacts
│   │   └── evaluation/          # Hold-out test set metrics & confusion matrix
│   ├── services/
│   │   ├── traffic_service.py   # Traffic replayer orchestration
│   │   ├── detection_service.py # Threat prediction & evaluation service
│   │   └── statistics_service.py# Sliding-window metrics & 60s time-series
│   └── tests/
│       ├── test_api.py          # REST endpoint & unit tests
│       └── test_e2e_simulation.py# End-to-end Scenario A & Scenario B test suite
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main SOC Operations Center shell
│   │   ├── main.jsx             # React entrypoint
│   │   ├── index.css            # Tailwind CSS styling & custom scrollbars
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # SOC Navigation sidebar
│   │   │   ├── Header.jsx       # Telemetry header & real-time clock
│   │   │   ├── StatusBanner.jsx # DEFCON status banner
│   │   │   ├── StatsCards.jsx   # Top 4 KPI metric cards
│   │   │   ├── ControlPanel.jsx # Simulation & attack injection controls
│   │   │   ├── TrafficChart.jsx # 60s area chart (Recharts)
│   │   │   ├── ThreatDonut.jsx  # Threat distribution donut chart (Recharts)
│   │   │   ├── LiveAlertFeed.jsx# Real-time alert stream table
│   │   │   ├── ThreatTimeline.jsx# Chronological incident timeline
│   │   │   ├── ConfidenceBar.jsx# Visual confidence indicator
│   │   │   ├── EvidenceModal.jsx# Forensic evidence dossier modal
│   │   │   ├── ModelPerformanceView.jsx# Model evaluation metrics view
│   │   │   ├── ThreatIntelView.jsx # Threat intelligence knowledge base
│   │   │   └── SettingsView.jsx # Environment diagnostics
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js  # Auto-reconnecting WebSocket hook
│   │   │   └── useDashboard.js  # Central dashboard state & control dispatcher
│   │   └── services/
│   │       └── api.js           # REST API client
│   ├── public/                  # Favicon and static assets
│   ├── package.json             # Frontend dependencies & scripts
│   ├── vite.config.js           # Vite build configuration
│   ├── Dockerfile               # Frontend production container
│   ├── nginx.conf               # Nginx reverse proxy configuration
│   └── vercel.json              # Vercel SPA rewrite rules
├── data/
│   ├── raw/                     # Original CICIDS-2017 CSV drop directory
│   └── processed/               # Cleaned & balanced flow datasets
├── scripts/
│   └── prepare_dataset.py       # Data cleaning, normalization & benchmark generator
├── docker-compose.yml           # Full-stack containerized local setup
├── render.yaml                  # Render web service blueprint
├── railway.json                 # Railway deployment configuration
├── vercel.json                  # Root Vercel monorepo configuration
├── .gitignore                   # Version control exclusion rules
└── README.md                    # Project documentation
```

---

## 5. Dataset Instructions (CICIDS-2017)

Official Source: [Canadian Institute for Cybersecurity IDS 2017](https://www.unb.ca/cic/datasets/ids-2017.html)

### Using Full Raw CSVs:
1. Download the generated CSV files from UNB.
2. Place the CSV files in `data/raw/`:
   ```bash
   data/raw/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv
   data/raw/Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv
   data/raw/Wednesday-workingHours.pcap_ISCX.csv
   ...
   ```
3. Run the preprocessing pipeline:
   ```bash
   python scripts/prepare_dataset.py
   ```

### Out-of-the-Box Benchmark Mode:
If `data/raw/` is empty, `scripts/prepare_dataset.py` automatically generates a statistically authentic CICIDS-2017 benchmark dataset matching the exact flow features, distributions, and attack profiles across all 7 target classes.

---

## 6. Machine Learning Pipeline

### Training
Execute the training script:
```bash
python backend/models/train.py
```

### Hold-Out Test Evaluation Results (Zero Data Leakage)
Evaluated on hold-out test set (1,300 flows, 20% split):
```
              precision    recall  f1-score   support

      BENIGN       0.99      0.97      0.98       500
         Bot       0.87      0.93      0.90       120
        DDoS       1.00      1.00      1.00       160
         DoS       1.00      1.00      1.00       160
Infiltration       1.00      1.00      1.00        80
    PortScan       1.00      1.00      1.00       160
  Web Attack       0.99      0.98      0.99       120

    accuracy                           0.98      1300
   macro avg       0.98      0.98      0.98      1300
weighted avg       0.98      0.98      0.98      1300
```
- **Overall Test Accuracy**: **98.08%**
- **Macro F1-Score**: **98.07%**

---

## 7. Local Installation & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/netguard-ai.git
cd netguard-ai
```

### Step 2: Set Up Python Backend
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Prepare dataset and train model (takes ~10 seconds)
python scripts/prepare_dataset.py
python backend/models/train.py

# Run backend unit & integration tests
python -m pytest backend/tests/ -v

# Start FastAPI backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be accessible at: `http://localhost:8000` (Swagger docs at `/docs`)

### Step 3: Set Up React Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 8. Docker Compose Execution

Run both backend and frontend in isolated production containers:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## 9. Cloud Deployment

### A. Frontend Deployment (Vercel)
1. Push project to your GitHub repository.
2. In the Vercel Dashboard, import the repository.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Configure Environment Variables in Vercel:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://netguard-ai-backend.onrender.com`)
   - `VITE_WS_URL`: Your deployed WebSocket URL (e.g. `wss://netguard-ai-backend.onrender.com`)
5. Click **Deploy**.

### B. Backend Deployment (Render or Railway)

#### Deploy on Render:
1. Connect your GitHub repository to Render.
2. Select **Web Service** or use the included `render.yaml`.
3. Set:
   - **Build Command**: `pip install -r backend/requirements.txt && python scripts/prepare_dataset.py && python backend/models/train.py`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `CORS_ORIGINS`: `https://<your-vercel-app>.vercel.app`
   - `PORT`: `8000`
   - `DB_PATH`: `/tmp/netguard.db`

#### Deploy on Railway:
1. Create a New Project on Railway from the GitHub repository.
2. Railway will automatically detect `backend/Dockerfile` as defined in `railway.json`.
3. Set environment variable `CORS_ORIGINS` to your Vercel domain.

---

## 10. Limitations & Future Roadmap

1. **Unidirectional Flow Telemetry**: NetGuard AI analyzes flow-level statistical aggregates rather than full packet payload payload inspection (DPI).
2. **Ephemeral Cloud Storage**: SQLite is used for persistent local and MVP storage. For large-scale distributed deployments, set `DB_PATH` to a persistent block volume or migrate to PostgreSQL.
3. **Hardware Acceleration**: Future versions can leverage GPU acceleration (e.g., cuML / RAPIDS) for million-flow-per-second enterprise throughput.

---

## 11. License

This project is licensed under the MIT License - see the LICENSE file for details.
