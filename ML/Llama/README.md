# AgriGuru LLM Integration Service

This directory contains the LLM (Large Language Model) integration service for AgriGuru, providing natural language processing capabilities for agricultural queries, cultivation tips, and disease information.

## Overview

The LLM service uses advanced language models to:
- Answer farming-related questions in natural language
- Generate detailed cultivation tips for different crops
- Provide information about crop diseases and treatments
- Process and interpret unstructured agricultural data
- Generate personalized farming recommendations

## Key Components

- `app.py`: Flask API server exposing LLM functionality
- `GROQ_INTEGRATION.md`: Details on integration with the GROQ LLM provider
- `.env.example`: Template for environment variables needed for LLM API keys

## Supported LLM Providers

The service can integrate with multiple LLM providers:
- GROQ
- OpenAI
- Other compatible API providers

## API Endpoints

### Query Endpoint

```
POST /llm/query
```

Send general agricultural queries and receive detailed, contextual responses.

**Request Body:**
```json
{
  "query": "What is the best time to plant wheat?",
  "context": {
    "location": "Northern India",
    "season": "Rabi"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "response": "In Northern India, the best time to plant wheat is during the Rabi season, typically from mid-October to mid-November. This timing allows the crop to benefit from winter temperatures during the vegetative phase and early spring temperatures during grain development."
}
```

### Cultivation Tips Endpoint

```
POST /llm/cultivation-tips
```

Get detailed cultivation guidelines for specific crops.

**Request Body:**
```json
{
  "crop": "Rice",
  "stage": "Seedling",
  "region": "South India"
}
```

**Response:**
```json
{
  "status": "success",
  "tips": [
    "Maintain water level at 2-5 cm during the seedling stage",
    "Apply first dose of nitrogen 15-20 days after transplanting",
    "Monitor for leaf folder and stem borer during this stage",
    "Ensure proper spacing of 20cm x 10cm for optimal growth"
  ]
}
```

### Disease Information Endpoint

```
POST /llm/disease-info
```

Get information about crop diseases including symptoms, causes, and treatments.

**Request Body:**
```json
{
  "crop": "Tomato",
  "symptoms": "Yellow leaves with brown spots"
}
```

**Response:**
```json
{
  "status": "success",
  "disease": {
    "name": "Early Blight",
    "scientific_name": "Alternaria solani",
    "symptoms": "Brown to black lesions with concentric rings forming a target pattern. Often begins on lower, older leaves.",
    "causes": "Fungal pathogen that survives in soil and plant debris. Spreads in warm, humid conditions.",
    "prevention": [
      "Use disease-resistant varieties",
      "Rotate crops every 2-3 years",
      "Avoid overhead irrigation"
    ],
    "treatment": [
      "Apply copper-based fungicides",
      "Remove and destroy infected plant parts",
      "Improve air circulation around plants"
    ]
  }
}
```

## Setup and Configuration

1. Copy the `.env.example` file to `.env`
2. Add your LLM provider API keys to the `.env` file
3. Install required dependencies:

```bash
pip install -r requirements.txt
```

4. Run the service:

```bash
python app.py
```

The service will start on port 5001 by default and can be accessed at `http://localhost:5001`.

## Integration with the Unified API

This LLM service is integrated with the main AgriGuru unified API server, which proxies requests to these endpoints. The unified server handles authentication, rate limiting, and logging.

## Development

To contribute to the LLM service:

1. Add new prompt templates in the appropriate modules
2. Test responses with various agricultural queries
3. Optimize prompts for accurate and helpful information
4. Add support for additional languages as needed

## Future Enhancements

- Multi-language support for regional farming dialects
- Visual disease recognition through image analysis
- Integration with weather data for context-aware responses
- Personalized recommendations based on user history
- Voice interface for hands-free operation in the field
