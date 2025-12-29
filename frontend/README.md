# AgriGuru - AI Farm Assistant

## Project Overview

AgriGuru is an AI-powered agricultural platform designed to help farmers with crop recommendations, weather forecasts, disease alerts, cultivation tips, and market insights. It integrates multiple machine learning models to provide data-driven decision support for smallholder farmers.

## Technologies Used

This project is built with:

- Vite with PWA support
- TypeScript
- React
- shadcn-ui components
- Tailwind CSS
- Supabase for authentication and data storage
- Flask-based ML API server

## Features

### Core Features

- **Crop Recommendation**: AI-driven crop suggestions based on soil, weather, and location
- **Yield Prediction**: ML model to predict crop yields using historical data and environmental factors
- **Market Price Analysis**: Track and forecast agricultural commodity prices
- **Weather Forecasts**: Real-time weather data and forecasts for agricultural planning
- **Disease Alerts**: Get real-time alerts on potential crop diseases based on location and crop types
- **Soil Health Analysis**: Monitor and analyze soil health parameters

### Additional Features

- **Cultivation Tips**: Access detailed cultivation guidance for different crops
- **Disaster Prediction**: Early warning system for weather-related disasters
- **Expert Assistance**: Request callback from agricultural experts through integrated calling API
- **Fertilizer Calculator**: Calculate optimal fertilizer application based on crop and soil parameters
- **Multilingual Support**: Interface available in multiple regional languages
- **Offline Mode**: Progressive Web App with offline capabilities
- **Floating Expert Help**: Persistent floating button to request expert assistance

## ML Models Integration

The application integrates with several machine learning models:

1. **Crop Yield Prediction Model**: 
   - Predicts yield based on crop type, state, season, and other parameters
   - Integrates with the unified API server

2. **Price Forecasting Model**:
   - Predicts crop prices based on state, district, crop type, and production data
   - Provides historical price trends and future forecasts

3. **Crop Recommendation Model**:
   - Suggests optimal crops based on soil composition and environmental factors

## Running the Project

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Frontend Setup

```sh
# Step 1: Clone the repository 
git clone <REPOSITORY_URL>

# Step 2: Navigate to the project directory
cd AgriGuruGlobal/frontend

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

### ML API Server Setup

```sh
# Navigate to the ML directory
cd ../ML

# Run the development API server (no model files required)
./start_api_dev.sh

# Alternatively, run with model files
# pip install -r unified_api_server_requirements.txt
# python unified_api_server.py
```

## Project Structure

- `src/pages`: Main application pages
  - `CropRecommendationPage.tsx`: Crop recommendation feature
  - `YieldPredictionPage.tsx`: Yield prediction using ML model
  - `MarketPricesPage.tsx`: Market price tracking and forecasts
  - `SoilHealthPage.tsx`: Soil health analysis
  - `WeatherPage.tsx`: Weather forecasts
  - `DiseaseAlertsPage.tsx`: Crop disease alerts
  - `CultivationTipsPage.tsx`: Farming best practices
  - `DisasterPredictionPage.tsx`: Weather disaster prediction
  - `FertilizerCalculatorPage.tsx`: Fertilizer calculation tool
- `src/components`: Reusable UI components
  - `ui/`: shadcn UI components
  - `features/`: Feature-specific components
  - `navigation/`: Navigation and layout components
- `src/contexts`: React context providers for global state
- `src/hooks`: Custom React hooks
- `src/redux`: Redux store and slices

## Backend Services

The application connects to multiple backend services:

- **Unified ML API Server**: Main API server that provides endpoints for various ML models
  - `/yield/predict`: Yield prediction endpoint
  - `/price/predict`: Price prediction endpoint
- **LLama LLM Service**: Large Language Model API for generating cultivation tips and disease alerts
- **Supabase**: Authentication, user profiles, and database storage
- **Weather API**: Integration with weather data providers

## Mobile and Offline Support

AgriGuru is built as a Progressive Web App (PWA) with:
- Fully responsive design for mobile devices
- Service worker for offline functionality
- Local data caching for offline access
- Push notifications for alerts
- Install-to-home-screen capability

This ensures farmers can access vital information even with limited or intermittent internet connectivity in rural areas.

## API Documentation

The ML API endpoints are documented in the ML directory's README.md file. The frontend connects to these endpoints to provide predictions and recommendations to users.

## Contributing

Please see the CONTRIBUTING.md file for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
