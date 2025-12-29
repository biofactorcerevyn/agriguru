# AgriGuru ML Models Unified API Server

This directory contains machine learning models and a unified API server for AgriGuru that serves multiple prediction models through a consistent RESTful interface.

## Directory Structure

- `/crop-yielding-prediction/`: Contains the crop yield prediction model and data
- `/komal hackathon/`: Contains the crop price prediction model and data
- `/Llama/`: Large Language Model integration for natural language processing tasks
- `/RecommenderModels/`: Crop and fertilizer recommendation models
- `unified_api_server.py`: Flask API server that exposes all models through RESTful endpoints
- `start_api_dev.sh`: Script to start the API server in development mode

## ML Models Overview

### 1. Crop Yield Prediction Model
- Located in: `/crop-yielding-prediction/`
- Predicts crop yields in metric tons per hectare
- Inputs: crop type, state, season, year, rainfall, fertilizer usage, pesticide usage
- Based on XGBoost algorithm trained on historical yield data
- Model files: best_model.pkl, label_encoders.pkl, unique_values.pkl, median_values.pkl

### 2. Crop Price Prediction Model
- Located in: `/komal hackathon/`
- Predicts crop prices based on geographical and seasonal factors
- Inputs: state, district, crop type, date, production quantity
- Utilizes regression techniques to forecast prices
- Model files: crop_price_model.pkl, geodata.csv

### 3. Crop Recommendation Model
- Located in: `/RecommenderModels/`
- Recommends optimal crops based on soil and environmental parameters
- Inputs: N, P, K values, pH, temperature, humidity, rainfall
- Uses decision tree-based algorithms
- Provides confidence scores for recommendations

### 4. LLama Integration
- Located in: `/Llama/`
- Provides natural language processing capabilities for:
  - Answering farming queries
  - Generating cultivation tips
  - Processing unstructured agricultural data
- Uses LLM technology for contextual understanding of agricultural questions

## API Endpoints

### Yield Prediction

- **GET** `/yield/options` - Get available options for crop types, states, and seasons
- **POST** `/yield/predict` - Make a yield prediction based on provided data

### Price Prediction

- **GET** `/price/states` - Get list of available states
- **GET** `/price/districts?state={state_name}` - Get districts for a specific state
- **POST** `/price/predict` - Make a crop price prediction based on provided data

### Crop Recommendation

- **GET** `/crop/soil-parameters` - Get accepted ranges for soil parameters
- **POST** `/crop/recommend` - Get crop recommendations based on soil and climate data

### LLM Endpoints

- **POST** `/llm/query` - Send a natural language query about farming
- **POST** `/llm/cultivation-tips` - Get cultivation tips for a specific crop

## Setup and Running

### Prerequisites

- Python 3.7+
- Required Python packages (install with `pip install -r unified_api_server_requirements.txt`)

### Running the API Server

#### Development Mode (No Model Files Required)

We've provided a development mode that works without requiring the actual model files. In this mode, the API will use random values for predictions.

1. Use the provided script to start in development mode:

```bash
chmod +x start_api_dev.sh
./start_api_dev.sh
```

This script will:
- Create a virtual environment if needed
- Install required dependencies
- Run the API server in development mode

#### Production Mode (With Model Files)

If you have the model files, you can run in production mode:

1. Install dependencies:

```bash
pip install -r unified_api_server_requirements.txt
```

2. Ensure model files are in their respective directories (see Directory Structure)

3. Start the unified API server:

```bash
python unified_api_server.py
```

The server will start on port 8000 by default. You can access it at `http://localhost:8000`.

## API Payload Examples

### Yield Prediction

```json
// Request
POST /yield/predict
{
  "crop": "Rice",
  "state": "Karnataka",
  "season": "Kharif",
  "year": "2022",
  "rainfall": "1200",
  "fertilizer": "100",
  "pesticide": "50"
}

// Response
{
  "status": "success",
  "prediction": {
    "crop": "Rice",
    "state": "Karnataka",
    "season": "Kharif",
    "prediction": 3.75
  }
}
```

### Price Prediction

```json
// Request
POST /price/predict
{
  "state": "Karnataka",
  "district": "Bangalore",
  "date": "2023-08-15",
  "crop": "Rice",
  "production": 1000
}

// Response
{
  "status": "success",
  "prediction": {
    "crop": "Rice",
    "state": "Karnataka",
    "district": "Bangalore",
    "year": 2023,
    "production": 1000,
    "predicted_price": 2500.75
  }
}
```

### Crop Recommendation

```json
// Request
POST /crop/recommend
{
  "nitrogen": 90,
  "phosphorus": 42,
  "potassium": 43,
  "ph": 6.5,
  "temperature": 24,
  "humidity": 65,
  "rainfall": 140
}

// Response
{
  "status": "success",
  "recommendations": [
    {"crop": "Rice", "confidence": 0.92},
    {"crop": "Maize", "confidence": 0.87},
    {"crop": "Cotton", "confidence": 0.65}
  ]
}
```

### LLM Query

```json
// Request
POST /llm/query
{
  "query": "What is the best time to plant wheat?",
  "context": {
    "location": "Northern India",
    "season": "Rabi"
  }
}

// Response
{
  "status": "success",
  "response": "In Northern India, the best time to plant wheat is during the Rabi season, typically from mid-October to mid-November. This timing allows the crop to benefit from winter temperatures during the vegetative phase and early spring temperatures during grain development."
}
```

## Frontend Integration

The React frontend components connect to these API endpoints:

- `YieldPredictionPage.tsx` connects to `/yield/options` and `/yield/predict`
- `MarketPricesPage.tsx` connects to price prediction endpoints
- `CropRecommendationPage.tsx` connects to crop recommendation endpoints
- `CultivationTipsPage.tsx` connects to LLM endpoints

## Error Handling

The API includes comprehensive error handling:

- Input validation with clear error messages
- Graceful degradation when model files are missing
- Fallback to development mode when models can't be loaded
- Rate limiting for production environments
- Cross-origin resource sharing (CORS) support

## Monitoring and Logging

The API server includes:
- Request logging for debugging
- Performance metrics for model inference
- Error tracking for failed predictions

## Future ML Model Integrations

We plan to integrate additional models:
- Disease detection from leaf images
- Precision irrigation scheduling
- Harvest timing optimization
- Pest outbreak prediction

## Testing

Run the included tests to verify model loading and API functionality:

```bash
pytest test_unified_api.py
```

## Troubleshooting

If the API server fails to load model files:
1. Verify model files exist in their correct directories
2. Check Python and scikit-learn versions match those used for training
3. Examine API server logs for specific error messages
4. Try running in development mode to verify API functionality

## Contributing

To contribute new ML models or improve existing ones:
1. Create a new directory for your model
2. Include all necessary model files and documentation
3. Update the unified API server to expose your model
4. Add tests for your model endpoints
