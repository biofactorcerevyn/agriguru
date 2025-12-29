# AgriGuru MVP: Step-by-Step Implementation Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Repository Structure](#repository-structure)
4. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)

   1. [1. Initialize Project & Infra](#1-initialize-project--infra)
   2. [2. ETL Pipelines](#2-etl-pipelines)
   3. [3. Model Training](#3-model-training)
   4. [4. API Development](#4-api-development)
   5. [5. React Dashboard](#5-react-dashboard)
   6. [6. Docker Compose & Deployment](#6-docker-compose--deployment)
   7. [7. Testing & Validation](#7-testing--validation)

---

## Introduction

This document serves as an actionable, reviewable roadmap for building the **AgriGuru** MVP. Follow the sections in order to scaffold, develop, and deploy the core features, while parallelly designing the React dashboard UI.

---

## Prerequisites

* **Languages & Frameworks:** Python 3.11, FastAPI, Airflow latest
* **Databases:** Supabase (PostgreSQL), optional Vector DB (FAISS/Pinecone)
* **Dev Tools:** Docker, Docker Compose, Git, Postman
* **Cloud:** Supabase account, OpenWeatherMap API key, Agmarknet CSV access

---

## Repository Structure

```bash
agri-guru/
├── api/                   # FastAPI service
│   ├── main.py            # /advise endpoint
│   └── models/            # Serialized model artifacts
├── etl/                   # Airflow DAGs & scripts
│   └── dags/
├── ml/                    # Training notebooks & scripts
│   ├── crop_recommend.py
│   ├── yield_predict.py
│   └── price_forecast.py
├── docker-compose.yml     # Local & demo deployment
└── README.md
```

---

## Step-by-Step Implementation Guide

### 1. Initialize Project & Infra

1. Clone Repo: `git clone <your-repo-url> && cd agri-guru`
2. Create project on supabase.com
3. Enable `raw` and `mart` schemas in Supabase SQL editor
4. Copy `.env.example` to `.env` with Supabase credentials and API keys
5. Run `docker-compose up -d` and ensure all services are up

### 2. ETL Pipelines

1. Create Airflow DAGs:

   * `weather.py`: Pulls OpenWeatherMap data hourly
   * `price.py`: Downloads Agmarknet CSV daily
2. Normalize raw tables into `mart.weather`, `mart.price`
3. Unit test transformation functions in `etl/transform/`
4. Validate scheduling via Airflow UI

### 3. Model Training

1. Crop Recommendation:

   * Use `XGBoostClassifier` with season, soil, and district yield data
   * Store in `api/models/crop_model.pkl`
2. Yield Prediction:

   * Use `LightGBMRegressor` and store in `api/models/yield_model.pkl`
3. Price Forecasting:

   * Use `Prophet` model per crop-market
   * Export JSON like:

     ```json
     {
       "month": "2025-08",
       "min_price": 5200,
       "modal_price": 5800,
       "max_price": 6400
     }
     ```

### 4. API Development

1. Setup FastAPI skeleton in `api/main.py`
2. Install deps: `fastapi`, `uvicorn`, `joblib`, `prophet`, `pydantic`
3. Define schema:

```python
class PriceForecast(BaseModel):
    month: str
    min_price: float
    modal_price: float
    max_price: float

class WeatherAlert(BaseModel):
    summary: str

class AdviceOutput(BaseModel):
    recommended_crop: str
    expected_yield: float
    weather_alert: WeatherAlert
    price_forecast: PriceForecast

class AdviceRequest(BaseModel):
    state: str
    district: str
    month: str
    acreage: float
    crop_history: List[str]
```

4. Implement endpoint logic: load models, fetch mart data, respond with nested schema
5. Add cache via Redis or in-memory TTL
6. Test using Postman or `pytest + httpx`

### 6. Docker Compose & Deployment

1. Services: api, etl, supabase, react-ui
2. One-command: `docker-compose up --build`
3. Expose ports: 3000 (UI), 8000 (API), 8080 (Airflow)

### 7. Testing & Validation

* ETL: Check timestamps in Supabase raw/mart tables
* Models: Run `pytest` for accuracy and MAE
* API: Verify `/advise` endpoint in Postman
* UI: Validate with mock data and mobile views

---

*Use this document as your authoritative implementation tracker and design reference.*
