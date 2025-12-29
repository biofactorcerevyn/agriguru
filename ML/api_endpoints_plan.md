# API Endpoints Plan for AgriGuru Unified API Server

This document outlines the planned API endpoints for the unified API server, including both implemented and proposed endpoints.

## Currently Implemented Endpoints

### Root
- `GET /` - API Status and available endpoints

### Yield Prediction
- `GET /yield/options` - Get available options for crop types, states, and seasons
- `POST /yield/predict` - Make a yield prediction based on provided data

### Price Prediction
- `GET /price/states` - Get list of available states
- `GET /price/districts?state={state_name}` - Get districts for a specific state
- `POST /price/predict` - Make a crop price prediction based on provided data

## Proposed Endpoints for Future Implementation

### Crop Recommendation
- `GET /crop/options` - Get available options for crop recommendation form
- `POST /crop/recommend` - Get crop recommendations based on farm details

### Fertilizer Calculator
- `GET /fertilizer/options` - Get available options for fertilizer calculator form
- `POST /fertilizer/calculate` - Calculate optimal fertilizer requirements based on soil test and crop needs

## API Response Formats

### Yield Prediction

```json
// Response from /yield/predict
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

### Crop Recommendation

```json
// Response from /crop/recommend
{
  "status": "success",
  "recommendations": [
    {
      "name": "Rice (Basmati)",
      "suitability": 95,
      "expectedYield": "4-5 tons/hectare",
      "marketPrice": "₹2,500-3,000/quintal",
      "profitability": "High",
      "season": "Kharif",
      "waterRequirement": "High (1,500-2,000mm)",
      "soilType": ["Clay", "Loamy"],
      "growthPeriod": "120-140 days",
      "benefits": ["High market demand", "Premium pricing", "Government support"],
      "challenges": ["High water requirement", "Pest management needed"]
    },
    // Additional recommendations...
  ]
}
```

### Fertilizer Calculator

```json
// Response from /fertilizer/calculate
{
  "status": "success",
  "recommendation": {
    "crop": "Rice",
    "farmSize": 2,
    "soilTest": {
      "nitrogen": 180,
      "phosphorus": 25,
      "potassium": 150,
      "ph": 6.5,
      "organicMatter": 1.2
    },
    "recommendations": {
      "primary": [
        {
          "name": "Urea (46-0-0)",
          "npk": "46% N",
          "quantity": 130,
          "cost": 780,
          "applicationTiming": ["Basal", "Tillering", "Panicle initiation"]
        },
        // Additional primary fertilizers...
      ],
      "secondary": [
        // Secondary fertilizers...
      ],
      "organic": [
        // Organic fertilizers...
      ]
    },
    "totalCost": 9805,
    "applicationSchedule": [
      // Application schedule...
    ],
    "tips": [
      // Application tips...
    ],
    "warnings": [
      // Important warnings...
    ]
  }
}
```

## Implementation Strategy

1. First priority: Ensure Yield Prediction API is fully functional
2. Second priority: Implement Crop Recommendation API
3. Third priority: Implement Fertilizer Calculator API

Each API endpoint should:
- Validate input data
- Handle errors gracefully with appropriate status codes and messages
- Include detailed documentation
- Have fallback values for development mode
