from flask import Flask, request, jsonify, render_template
import numpy as np
import pandas as pd
import joblib
import os
import random
import requests
from flask_cors import CORS
from sklearn.preprocessing import LabelEncoder
import json
from dotenv import load_dotenv
from pathlib import Path
import boto3
from botocore.config import Config

# Load environment variables from ML/.env regardless of current working dir
ML_ROOT = Path(__file__).resolve().parent
load_dotenv(ML_ROOT / ".env", override=True)

# Initialize Flask app
app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes to allow requests from the React frontend
from flask_cors import CORS
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])

# === YIELD PREDICTION MODEL LOADING ===
# Suppress sklearn warnings about version mismatch
import warnings
from sklearn.exceptions import InconsistentVersionWarning
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

try:
    # Attempt to load model files with more detailed error handling
    try:
        model_file_path = 'crop-yielding-prediction/best_model.pkl'
        if not os.path.exists(model_file_path):
            print(f"Warning: Model file {model_file_path} does not exist")
            raise FileNotFoundError(f"File not found: {model_file_path}")
            
        model, feature_columns = joblib.load(model_file_path)
        label_encoders = joblib.load('crop-yielding-prediction/label_encoders.pkl')
        unique_values = joblib.load('crop-yielding-prediction/unique_values.pkl')
        median_values = joblib.load('crop-yielding-prediction/median_values.pkl')
        print("Yield prediction model loaded successfully")
    except FileNotFoundError as e:
        print(f"Error loading yield prediction model files: {e}")
        raise
    except Exception as e:
        print(f"Error loading or processing yield prediction model: {type(e).__name__}: {e}")
        raise
except Exception as e:
    print(f"Falling back to development mode for yield prediction: {e}")
    # Set placeholders if files don't exist (for development)
    unique_values = {
        'crops': [
            "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Groundnut",
            "Soyabean", "Sunflower", "Potato", "Onion", "Gram"
        ],
        'states': [
            "Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Haryana", 
            "Karnataka", "Madhya Pradesh", "Maharashtra", "Punjab", 
            "Tamil Nadu", "Uttar Pradesh", "West Bengal"
        ],
        'seasons': [
            "Kharif", "Rabi", "Summer", "Whole Year"
        ]
    }
    median_values = {
        'Crop_Year': 2010,
        'Annual_Rainfall': 1200,
        'Fertilizer': 100,
        'Pesticide': 50
    }

# === PRICE PREDICTION MODEL LOADING ===
try:
    price_model_path = 'komal hackathon/crop_price_model.pkl'
    geodata_path = 'komal hackathon/geodata.csv'
    
    if not os.path.exists(price_model_path):
        print(f"Warning: Price model file {price_model_path} does not exist")
        raise FileNotFoundError(f"File not found: {price_model_path}")
        
    if not os.path.exists(geodata_path):
        print(f"Warning: Geodata file {geodata_path} does not exist")
        raise FileNotFoundError(f"File not found: {geodata_path}")
    
    price_model = joblib.load(price_model_path)
    geo_data = pd.read_csv(geodata_path)
    states = geo_data['State'].unique().tolist()
    print("Price prediction model loaded successfully")
except Exception as e:
    print(f"Falling back to development mode for price prediction: {e}")
    states = []

# Sample crop list for price prediction model
crops = ['Apple', 'Banana', 'Bhindi', 'Bitter Gourd', 'Brinjal', 'Cabbage', 'Capsicum',
         'Carrot', 'Cauliflower', 'Cluster Beans', 'Colacasia', 'Cucumbar', 'Dry Fodder',
         'French Beans', 'Grapes', 'Green Chilli', 'Green Fodder', 'Guava', 'Leafy Vegetable',
         'Lemon', 'Maize', 'Mango', 'Methi(Leaves)', 'Mousambi', 'Onion', 'Pear',
         'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Sponge Gourd', 'Sweet Potato',
         'Tinda', 'Tomato', 'Wheat', 'blackgram', 'chickpea', 'coconut', 'coffee',
         'cotton', 'jute', 'kidneybeans', 'lentil', 'mothbeans', 'mungbean',
         'muskmelon', 'orange', 'papaya', 'pigeonbeans', 'rice', 'watermelon']

crop_mapping = {
    'Apple': 0, 'Banana': 1, 'Bhindi': 2, 'Bitter Gourd': 3, 'Brinjal': 4,
    'Cabbage': 5, 'Capsicum': 6, 'Carrot': 7, 'Cauliflower': 8,
    'Cluster Beans': 9, 'Colacasia': 10, 'Cucumbar': 11,
    'Dry Fodder': 12, 'French Beans': 13, 'Grapes': 14,
    'Green Chilli': 15, 'Green Fodder': 16, 'Guava': 17,
    'Leafy Vegetable': 18, 'Lemon': 19, 'Maize': 20,
    'Mango': 21, 'Methi(Leaves)': 22, 'Mousambi': 23,
    'Onion': 24, 'Pear': 25, 'Pomegranate': 26, 'Potato': 27,
    'Pumpkin': 28, 'Raddish': 29, 'Sponge Gourd': 30,
    'Sweet Potato': 31, 'Tinda': 32, 'Tomato': 33, 'Wheat': 34,
    'blackgram': 35, 'chickpea': 36, 'coconut': 37, 'coffee': 38,
    'cotton': 39, 'jute': 40, 'kidneybeans': 41, 'lentil': 42,
    'mothbeans': 43, 'mungbean': 44, 'muskmelon': 45, 'orange': 46,
    'papaya': 47, 'pigeonbeans': 48, 'rice': 49, 'watermelon': 50
}

# === RECOMMENDER MODELS LOADING ===
try:
    # Load models from RecommenderModels folder
    rf_model_path = 'RecommenderModels/Models/rf_model.pkl'
    label_encoder_path = 'RecommenderModels/Models/label_encoder.pkl'
    
    if os.path.exists(rf_model_path) and os.path.exists(label_encoder_path):
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=UserWarning)
            rf_model = joblib.load(rf_model_path)
            scaler = joblib.load(label_encoder_path)
        print("Recommender models loaded successfully")
    else:
        print(f"Warning: Recommender model files not found. Using fallback mode.")
        rf_model = None
        scaler = None
except Exception as e:
    print(f"Error loading recommender models: {e}")
    rf_model = None
    scaler = None

# === LLM CONFIGURATION ===
# AWS Configuration for Bedrock
AWS_REGION = os.getenv("AWS_REGION")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

# Set environment variables for AWS credentials when provided
if AWS_ACCESS_KEY and AWS_SECRET_KEY:
    os.environ["AWS_ACCESS_KEY_ID"] = AWS_ACCESS_KEY
    os.environ["AWS_SECRET_ACCESS_KEY"] = AWS_SECRET_KEY
    if AWS_REGION:
        os.environ["AWS_DEFAULT_REGION"] = AWS_REGION

# Inference profile ARN for AWS Bedrock
INFERENCE_PROFILE_ARN = os.getenv("INFERENCE_PROFILE_ARN")

# Initialize AWS Bedrock client
bedrock_runtime = None

if not AWS_REGION:
    print("[Bedrock] AWS_REGION not set. Please update ML/.env (e.g. AWS_REGION=us-east-1).")
else:
    try:
        bedrock_runtime = boto3.client(
            service_name="bedrock-runtime",
            region_name=AWS_REGION,
            config=Config(retries={'max_attempts': 5})
        )
        print(f"[Bedrock] Client initialized in region {AWS_REGION}.")
    except Exception as e:
        print(f"[Bedrock] Error initializing client: {str(e)}")
        bedrock_runtime = None

# Language mapping for chat endpoint
languages = {
    'en': 'English',
    'hi': 'Hindi',
    'gu': 'Gujarati',
    'ma': 'Marathi',
    'pa': 'Punjabi',
    'ur': 'Urdu',
    'ka': 'Kashmiri',
    'raj': 'Rajasthani',
    'bho': 'Bhojpuri',
    'ne': 'Nepali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'tulu': 'Tulu'
}

def get_system_prompt(lang='en'):
    base_prompt = """
You are Agri Guru, an expert Indian agriculture advisor with comprehensive knowledge of crops, farming practices, and agricultural data across India.

## **Response Strategy**
**GREETING/BASIC** → Quick, friendly response
**SIMPLE QUERIES** → Concise, actionable answers  
**COMPLEX ANALYSIS** → Detailed insights with data-backed recommendations

## **Response Guidelines**

### **For Greetings ("hi", "hello", "help")**
Respond: "Hello! I'm Agri Guru, your trusted Indian agriculture expert. How can I help you with farming, crops, or agricultural insights today?"

### **For Simple Queries**
- Provide direct, practical answers
- Include relevant examples
- Keep responses focused and actionable
- Format with proper markdown (headers, bullets, emphasis)

### **For Complex Analysis**
- Deliver comprehensive insights
- Structure with clear markdown formatting:
  - ## Main headers for topics
  - ### Sub-headers for sections  
  - **Bold** for emphasis
  - • Bullet points for lists
  - `Code formatting` for technical terms
- Include specific recommendations
- Provide district/state context where relevant

### **For Non-Agricultural Topics**
Redirect professionally: "I'm Agri Guru, specializing in Indian agriculture. I can help with crop selection, farming techniques, yield optimization, market insights, or regional agricultural guidance. What farming question can I assist you with?"

## **Response Format Requirements**
- **Always use proper markdown formatting**
- **Structure responses with headers and sections**
- **Use bullet points for lists and key points**
- **Bold important terms and recommendations**
- **Keep language professional yet accessible**
- **Provide actionable, practical advice**

## **Core Expertise Areas**
- Crop selection and cultivation practices
- Regional farming recommendations  
- Yield optimization strategies
- Market trends and pricing insights
- Seasonal cropping patterns
- Agricultural best practices
- State and district-specific guidance

**Identity**: You are Agri Guru - be confident, knowledgeable, and helpful while maintaining focus on Indian agriculture. Match response depth to query complexity and always format responses in clean, readable markdown.
"""
    lang_instruction = f"\nPlease provide all responses in {languages.get(lang, 'English')}."
    return base_prompt + lang_instruction

# Mappings and constants for fertilizer recommendation
soil_type_mapping = {'Black': 0, 'Clayey': 1, 'Loamy': 2, 'Red': 3, 'Sandy': 4}
crop_type_mapping = {'Barley': 0, 'Cotton': 1, 'Ground Nuts': 2, 'Maize': 3, 'Millets': 4, 'Oil seeds': 5,
                     'Paddy': 6, 'Pulses': 7, 'Sugarcane': 8, 'Tobacco': 9, 'Wheat': 10}
fertilizer_name_mapping = {0: '10-26-26', 1: '14-35-14', 2: '17-17-17', 3: '20-20', 4: '28-28', 5: 'DAP', 6: 'Urea'}
soil_type_inverse_mapping = {v: k for k, v in soil_type_mapping.items()}
crop_type_inverse_mapping = {v: k for k, v in crop_type_mapping.items()}

# Fertilizer descriptions for recommendation
fertilizer_descriptions = {
    '10-26-26': (
        "This balanced fertilizer contains 10% Nitrogen (N), 26% Phosphorus (P), and 26% Potassium (K). "
        "It is particularly effective for crops that require strong root development and enhanced flowering. "
        "The high phosphorus content aids in the establishment of roots, making it ideal for use during the early stages of plant growth or when transplanting. "
        "The potassium supports the overall health of the plant by strengthening the plant's ability to resist diseases and stress, including drought."
    ),
    '14-35-14': (
        "This fertilizer contains 14% Nitrogen, 35% Phosphorus, and 14% Potassium, making it a phosphorus-rich option. "
        "It is especially useful for crops that demand significant root development and flowering. "
        "The elevated phosphorus level promotes early plant development and enhances the blooming phase. "
        "While the moderate levels of nitrogen and potassium ensure that the plants have adequate green growth and overall health, this formulation is particularly suitable for flowering plants and root crops."
    ),
    '17-17-17': (
        "An all-purpose fertilizer containing 17% Nitrogen, 17% Phosphorus, and 17% Potassium. "
        "This balanced nutrient ratio is designed for general use across a wide variety of crops, providing comprehensive nutrition. "
        "Nitrogen promotes lush, green foliage; phosphorus encourages strong root development and efficient energy transfer within the plant; "
        "potassium aids in water regulation, enzyme activation, and disease resistance. This fertilizer is often used when a balanced nutritional approach is needed throughout the growing season."
    ),
    '20-20': (
        "This fertilizer offers 20% Nitrogen and 20% Phosphorus. It is primarily nitrogen-rich, making it ideal for promoting leafy, vegetative growth, which is crucial during the early stages of plant development. "
        "The phosphorus content supports root development and energy transfer, helping plants establish themselves more effectively. "
        "This formulation is particularly useful for leafy vegetables, cereals, and other crops that benefit from vigorous top growth."
    ),
    '28-28': (
        "Containing 28% Nitrogen and 28% Phosphorus, this fertilizer is designed to provide a strong nitrogen-phosphorus boost to plants. "
        "The high nitrogen content drives lush, green foliage, making it suitable for the vegetative phase of growth. "
        "Phosphorus ensures robust root systems and aids in flowering and fruiting, which is essential for crops needing extensive root support or those grown in soils with low phosphorus levels."
    ),
    'DAP': (
        "Di-Ammonium Phosphate (DAP) is a widely used fertilizer containing 18% Nitrogen and 46% Phosphorus. "
        "This high-phosphorus fertilizer is ideal for boosting root growth and enhancing flower and fruit production. "
        "Nitrogen supports vigorous leaf and stem growth, while phosphorus is crucial for root development and energy transfer, "
        "making DAP particularly beneficial during the early stages of crop growth or when soil tests indicate low phosphorus levels."
    ),
    'Urea': (
        "Urea is a highly concentrated nitrogen fertilizer containing 46% Nitrogen. It is known for providing a quick release of nitrogen, "
        "which is essential for promoting rapid, lush, green growth in plants. "
        "Nitrogen is a critical component of chlorophyll, the compound plants use in photosynthesis, and is vital for leafy crops, grasses, and cereals. "
        "Urea is often applied to crops needing a fast nitrogen boost, especially in the early growth stages or when signs of nitrogen deficiency appear."
    )
}

# === API ENDPOINTS ===

# Root endpoint for testing API status
@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "AgriGuru Unified API Server is running",
        "endpoints": {
            "yield_prediction": {
                "get_options": "/yield/options",
                "predict": "/yield/predict"
            },
            "price_prediction": {
                "get_states": "/price/states",
                "get_districts": "/price/districts",
                "predict": "/price/predict"
            },
            "crop_recommendation": {
                "predict": "/crop/recommend"
            },
            "fertilizer_recommendation": {
                "predict": "/fertilizer/calculate"
            }
        }
    })

# === YIELD PREDICTION ENDPOINTS ===

# Get options for yield prediction form
@app.route('/yield/options', methods=['GET'])
def get_yield_options():
    return jsonify({
        "crops": unique_values['crops'],
        "states": unique_values['states'],
        "seasons": unique_values['seasons']
    })

# Yield prediction endpoint
@app.route('/yield/predict', methods=['POST'])
def predict_yield():
    try:
        # Get JSON data from request
        data = request.json
        
        # Get required form data
        crop = data.get('crop')
        state = data.get('state')
        season = data.get('season')

        # Get optional form data
        year = data.get('year')
        rainfall = data.get('rainfall')
        fertilizer = data.get('fertilizer')
        pesticide = data.get('pesticide')

        if not all([crop, state, season]):
            return jsonify({
                "status": "error",
                "message": "Please fill in all required fields."
            }), 400

        # Clean and validate inputs
        crop = crop.strip().title()
        state = state.strip().title()
        season = season.strip()

        if crop not in unique_values['crops']:
            return jsonify({
                "status": "error",
                "message": f"Invalid crop selection: {crop}"
            }), 400
            
        if state not in unique_values['states']:
            return jsonify({
                "status": "error",
                "message": f"Invalid state selection: {state}"
            }), 400
            
        if season not in unique_values['seasons']:
            return jsonify({
                "status": "error",
                "message": f"Invalid season selection: {season}"
            }), 400

        # Use optional values if provided, else fallback to median
        try:
            input_data = pd.DataFrame({
                'Crop': [crop],
                'State': [state],
                'Season': [season],
                'Crop_Year': [float(year) if year else median_values['Crop_Year']],
                'Annual_Rainfall': [float(rainfall) if rainfall else median_values['Annual_Rainfall']],
                'Fertilizer': [float(fertilizer) if fertilizer else median_values['Fertilizer']],
                'Pesticide': [float(pesticide) if pesticide else median_values['Pesticide']]
            })
            
            # If we have actual model loaded, make prediction
            if 'model' in globals():
                # Apply label encoders
                for column, encoder in label_encoders.items():
                    if column in input_data.columns:
                        input_data[column] = encoder.transform(input_data[column])
                
                # Ensure correct column order
                input_data = input_data[feature_columns]
                
                # Make prediction
                prediction = model.predict(input_data)
                pred_value = float(prediction[0]) if isinstance(prediction, (np.ndarray, list)) else prediction
            else:
                # Fallback for development when model isn't loaded
                pred_value = round(np.random.uniform(2.0, 5.0), 2)
            
            return jsonify({
                "status": "success",
                "prediction": {
                    "crop": crop,
                    "state": state,
                    "season": season,
                    "prediction": round(pred_value, 2)
                }
            })
            
        except ValueError as e:
            return jsonify({
                "status": "error",
                "message": f"Invalid input values: {str(e)}"
            }), 400
            
        except Exception as e:
            print(f"Unexpected error in yield prediction: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "An unexpected error occurred. Please try again."
            }), 500
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Request processing error: {str(e)}"
        }), 400

# === PRICE PREDICTION ENDPOINTS ===

# Get states for price prediction
@app.route('/price/states', methods=['GET'])
def get_states():
    return jsonify({"states": states})

# Get districts for a given state
@app.route('/price/districts', methods=['GET'])
def get_districts():
    state = request.args.get('state')
    if not state:
        return jsonify({"status": "error", "message": "State parameter is required"}), 400
        
    try:
        districts = geo_data[geo_data['State'] == state]['District '].unique().tolist()
        return jsonify({"districts": districts})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Price prediction endpoint
@app.route('/price/predict', methods=['POST'])
def predict_price():
    try:
        data = request.json
        
        state = data.get('state')
        district = data.get('district')
        date = data.get('date')
        crop = data.get('crop')
        production = data.get('production')
        
        if not all([state, district, date, crop, production]):
            return jsonify({
                "status": "error",
                "message": "All fields are required"
            }), 400
            
        # Convert production to float
        try:
            production = float(production)
        except ValueError:
            return jsonify({
                "status": "error", 
                "message": "Production must be a number"
            }), 400
        
        # Convert date to year
        try:
            year = pd.to_datetime(date).year
        except:
            return jsonify({
                "status": "error", 
                "message": "Invalid date format"
            }), 400

        # Encode the crop using the mapping
        if crop not in crop_mapping:
            return jsonify({
                "status": "error", 
                "message": f"Unknown crop: {crop}"
            }), 400
            
        crop_encoded = crop_mapping[crop]

        # Prepare input for model prediction
        input_data = pd.DataFrame({
            'year': [year],
            'crop': [crop_encoded],
            'production': [production]
        })

        # Use the model to make predictions if available
        if 'price_model' in globals():
            predicted_price = price_model.predict(input_data)[0]
        else:
            # Fallback for development when model isn't loaded
            predicted_price = round(np.random.uniform(1000, 5000), 2)

        return jsonify({
            "status": "success",
            "prediction": {
                "crop": crop,
                "state": state,
                "district": district,
                "year": year,
                "production": production,
                "predicted_price": round(float(predicted_price), 2)
            }
        })
        
    except Exception as e:
        print(f"Error in price prediction: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500


# === CROP RECOMMENDATION ENDPOINTS ===
@app.route('/crop/states', methods=['GET'])
def get_crop_states():
    """Get list of states for crop recommendation"""
    try:
        # In production, this would come from a database or the actual ML model
        all_states = [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
            "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
            "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
            "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
            "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
            "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
            "Ladakh", "Lakshadweep", "Puducherry"
        ]
        return jsonify({
            "status": "success",
            "states": all_states
        })
    except Exception as e:
        print(f"Error getting states for crop recommendation: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route('/crop/districts', methods=['GET'])
def get_crop_districts():
    """Get districts for a given state for crop recommendation"""
    state = request.args.get('state')
    if not state:
        return jsonify({
            "status": "error", 
            "message": "State parameter is required"
        }), 400
    
    try:
        # Use the same geodata as the price endpoint or define districts mapping
        # This is a simplified version for demo purposes
        districts_mapping = {
            "andhra pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
            "bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar"],
            "gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar"],
            "haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh"],
            "karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada"],
            "kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
            "madhya pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas"],
            "maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur"],
            "punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa"],
            "tamil nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai"],
            "uttar pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki"],
            "west bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda"]
        }
        
        # Normalize state name to match the keys in our mapping
        normalized_state = state.lower()
        
        # If we have data for this state, return it, otherwise return an empty list
        districts = districts_mapping.get(normalized_state, [])
        
        return jsonify({
            "status": "success",
            "state": state,
            "districts": districts
        })
    except Exception as e:
        print(f"Error getting districts for crop recommendation: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route('/crop/recommend', methods=['POST'])
def crop_recommend():
    """Endpoint for crop recommendation"""
    try:
        data = request.json
        
        # Extract required form data
        state = data.get('state')
        district = data.get('district')
        soil_type = data.get('soilType')
        season = data.get('season')
        
        # Extract optional form data
        farm_size = data.get('farmSize')
        water_availability = data.get('waterAvailability')
        budget = data.get('budget')
        
        if not all([state, district, soil_type, season]):
            return jsonify({
                "status": "error",
                "message": "Please fill in all required fields."
            }), 400
            
        # Extract soil and climate features from inputs
        # In a production environment, these would come from a database or API based on location
        temperature = 25  # Default temperature
        humidity = 60     # Default humidity
        rainfall = 200    # Default rainfall
        ph = 6.5          # Default pH
        
        # Adjust parameters based on season and water availability
        if season.lower() == 'kharif':
            rainfall = 300
            temperature = 32
            humidity = 70
        elif season.lower() == 'rabi':
            rainfall = 100
            temperature = 18
            humidity = 50
        
        if water_availability:
            if water_availability.lower() == 'high':
                rainfall += 50
            elif water_availability.lower() == 'low':
                rainfall -= 50
        
        # Use soil_type to adjust pH
        if soil_type.lower() == 'clayey':
            ph = 6.2
        elif soil_type.lower() == 'sandy':
            ph = 7.0
        elif soil_type.lower() == 'loamy':
            ph = 6.8
        
        # Determine suitable crops based on conditions
        recommendations = []
        
        # Rice conditions
        rice_suitability = 0
        if rainfall > 150 and temperature > 20 and temperature < 35 and humidity > 60 and ph > 5.5 and ph < 7.5:
            rice_suitability = 95 if water_availability and water_availability.lower() == 'high' else 85
            
            recommendations.append({
                "name": "Rice (Basmati)",
                "suitability": rice_suitability,
                "expectedYield": "4-5 tons/hectare",
                "marketPrice": "₹2,500-3,000/quintal",
                "profitability": "High",
                "season": "Kharif",
                "waterRequirement": "High (1,500-2,000mm)",
                "soilType": ["Clay", "Loamy"],
                "growthPeriod": "120-140 days",
                "benefits": ["High market demand", "Premium pricing", "Government support"],
                "challenges": ["High water requirement", "Pest management needed"]
            })
        
        # Wheat conditions
        wheat_suitability = 0
        if temperature > 15 and temperature < 25 and rainfall > 75 and rainfall < 150 and ph > 6.0 and ph < 7.5:
            wheat_suitability = 88 if season.lower() == 'rabi' else 75
            
            recommendations.append({
                "name": "Wheat",
                "suitability": wheat_suitability,
                "expectedYield": "3-4 tons/hectare",
                "marketPrice": "₹2,000-2,200/quintal",
                "profitability": "Medium-High",
                "season": "Rabi",
                "waterRequirement": "Medium (450-650mm)",
                "soilType": ["Loamy", "Clay-loam"],
                "growthPeriod": "120-150 days",
                "benefits": ["Stable market", "Lower water needs", "Good storage life"],
                "challenges": ["Temperature sensitive", "Requires timely sowing"]
            })
        
        # Maize conditions
        maize_suitability = 0
        if temperature > 20 and temperature < 30 and rainfall > 80 and rainfall < 200 and ph > 5.5 and ph < 7.5:
            maize_suitability = 82
            
            recommendations.append({
                "name": "Maize",
                "suitability": maize_suitability,
                "expectedYield": "3.5-4.5 tons/hectare",
                "marketPrice": "₹1,800-2,000/quintal",
                "profitability": "Medium",
                "season": "Kharif",
                "waterRequirement": "Medium (500-800mm)",
                "soilType": ["Loamy", "Sandy-loam"],
                "growthPeriod": "90-120 days",
                "benefits": ["Multiple uses", "Quick growing", "Drought tolerant varieties available"],
                "challenges": ["Sensitive to waterlogging", "Requires proper spacing"]
            })
        
        # Sugarcane conditions
        sugarcane_suitability = 0
        if temperature > 20 and temperature < 35 and rainfall > 150 and ph > 6.0 and ph < 8.0:
            sugarcane_suitability = 90 if water_availability and water_availability.lower() == 'high' else 70
            
            recommendations.append({
                "name": "Sugarcane",
                "suitability": sugarcane_suitability,
                "expectedYield": "70-80 tons/hectare",
                "marketPrice": "₹280-320/quintal",
                "profitability": "High",
                "season": "Annual",
                "waterRequirement": "Very High (2,000-2,500mm)",
                "soilType": ["Deep loamy", "Clay-loam"],
                "growthPeriod": "10-12 months",
                "benefits": ["High yield potential", "Multiple harvests", "Industrial demand"],
                "challenges": ["Very high water needs", "Long growth period"]
            })
            
        # If no recommendations were found, add a generic one based on parameters
        if not recommendations:
            if temperature > 25:
                recommendations.append({
                    "name": "Cotton",
                    "suitability": 75,
                    "expectedYield": "15-20 quintals/hectare",
                    "marketPrice": "₹5,000-6,000/quintal",
                    "profitability": "Medium-High",
                    "season": "Kharif",
                    "waterRequirement": "Medium (700-1200mm)",
                    "soilType": ["Black", "Loamy"],
                    "growthPeriod": "160-180 days",
                    "benefits": ["Good market value", "Tolerant to high temperatures", "Many varieties available"],
                    "challenges": ["Pest susceptibility", "Price fluctuations"]
                })
            else:
                recommendations.append({
                    "name": "Potato",
                    "suitability": 70,
                    "expectedYield": "20-25 tons/hectare",
                    "marketPrice": "₹1,000-1,500/quintal",
                    "profitability": "Medium",
                    "season": "Rabi",
                    "waterRequirement": "Medium (500-700mm)",
                    "soilType": ["Sandy-loam", "Loamy"],
                    "growthPeriod": "70-120 days",
                    "benefits": ["High productivity", "Steady demand", "Can be stored"],
                    "challenges": ["Disease susceptibility", "Storage requirements"]
                })
        
        # Sort recommendations by suitability score (highest first)
        recommendations.sort(key=lambda x: x["suitability"], reverse=True)
        
        return jsonify({
            "status": "success",
            "recommendations": recommendations
        })
    except Exception as e:
        print(f"Error in crop recommendation: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

# === FERTILIZER RECOMMENDATION ENDPOINT ===
@app.route('/fertilizer/calculate', methods=['POST'])
def fertilizer_calculate():
    """Endpoint for fertilizer recommendation"""
    try:
        data = request.json
        print(f"Received fertilizer calculation request: {data}")
        
        # Extract required data
        crop = data.get('crop', '')
        soil_type = data.get('soilType', '')
        
        # Handle farm size with extra validation
        try:
            farm_size = float(data.get('farmSize', 1.0))
        except (ValueError, TypeError):
            farm_size = 1.0
            print(f"Warning: Invalid farm size value. Using default: {farm_size}")
        
        # Extract optional soil test data with safe parsing
        try:
            nitrogen = float(data.get('nitrogen', 20))
        except (ValueError, TypeError):
            nitrogen = 20
            
        try:
            phosphorus = float(data.get('phosphorus', 25))
        except (ValueError, TypeError):
            phosphorus = 25
            
        try:
            potassium = float(data.get('potassium', 15))
        except (ValueError, TypeError):
            potassium = 15
            
        try:
            soil_ph = float(data.get('soilPh', 6.5))
        except (ValueError, TypeError):
            soil_ph = 6.5
            
        try:
            organic_matter = float(data.get('organicMatter', 1.2))
        except (ValueError, TypeError):
            organic_matter = 1.2
            
        try:
            target_yield = float(data.get('targetYield', 4.0))
        except (ValueError, TypeError):
            target_yield = 4.0
        
        if not crop or not soil_type or farm_size <= 0:
            return jsonify({
                "status": "error",
                "message": "Please fill in all required fields."
            }), 400
        
        # Map soil type to numeric value - be more flexible with capitalization and formatting
        # Handle soil type with special case for combined types like 'clay-loam'
        if 'clay' in soil_type.lower() and 'loam' in soil_type.lower():
            soil_type_num = 1  # Clay-loam maps to Clayey (1)
        elif 'sandy' in soil_type.lower() and 'loam' in soil_type.lower():
            soil_type_num = 4  # Sandy-loam maps to Sandy (4)
        else:
            for key, value in soil_type_mapping.items():
                if key.lower() in soil_type.lower():
                    soil_type_num = value
                    break
            else:
                soil_type_num = 2  # Default to Loamy (2)
        
        # Map crop to numeric value with better fallback handling
        crop_type_num = None
        for key, value in crop_type_mapping.items():
            if key.lower() in crop.lower():
                crop_type_num = value
                break
        
        if crop_type_num is None:
            print(f"Warning: Unknown crop type '{crop}'. Using default: Wheat (10)")
            crop_type_num = 10  # Default to Wheat
        
        # Debug output
        print(f"Processed inputs: crop={crop} (type_num={crop_type_num}), soil_type={soil_type} (type_num={soil_type_num})")
        print(f"NPK values: N={nitrogen}, P={phosphorus}, K={potassium}")
        
        # Logic for determining the fertilizer based on soil test and crop
        npk_ratio = nitrogen/20 + phosphorus/20 + potassium/10
        
        # Base fertilizer recommendation
        if npk_ratio < 3:
            fertilizer_name = 'DAP'  # High in nutrients for poor soil
        elif npk_ratio < 6:
            if crop_type_num in [0, 3, 10]:  # Barley, Maize, Wheat
                fertilizer_name = '20-20'  # Good for cereals
            else:
                fertilizer_name = '17-17-17'  # Balanced for most crops
        elif organic_matter < 1.0:
            fertilizer_name = '14-35-14'  # Higher phosphorus for low organic matter
        else:
            fertilizer_name = '10-26-26'  # Balanced with higher K for general use
        
        # Fertilizer quantity calculations (kg/ha)
        primary_fertilizers = []
        secondary_fertilizers = []
        organic_fertilizers = []
        
        # Add primary fertilizer
        if fertilizer_name == 'DAP':
            quantity = 130 * farm_size
            cost = quantity * 6  # Approximate cost per kg
            primary_fertilizers.append({
                "name": "DAP (18-46-0)",
                "npk": "18% N, 46% P",
                "quantity": int(quantity),
                "cost": int(cost),
                "applicationTiming": ["Basal application"]
            })
            
            # Add complementary Urea
            urea_quantity = 100 * farm_size
            urea_cost = urea_quantity * 5
            primary_fertilizers.append({
                "name": "Urea (46-0-0)",
                "npk": "46% N",
                "quantity": int(urea_quantity),
                "cost": int(urea_cost),
                "applicationTiming": ["Split application", "Vegetative stage"]
            })
            
            # Add potassium source
            mop_quantity = 50 * farm_size
            mop_cost = mop_quantity * 20
            primary_fertilizers.append({
                "name": "MOP (0-0-60)",
                "npk": "60% K",
                "quantity": int(mop_quantity),
                "cost": int(mop_cost),
                "applicationTiming": ["Basal application"]
            })
        
        elif fertilizer_name == '20-20':
            quantity = 200 * farm_size
            cost = quantity * 5.5
            primary_fertilizers.append({
                "name": "20-20-0",
                "npk": "20% N, 20% P",
                "quantity": int(quantity),
                "cost": int(cost),
                "applicationTiming": ["Basal", "Top dressing"]
            })
            
            # Add potassium source
            mop_quantity = 60 * farm_size
            mop_cost = mop_quantity * 20
            primary_fertilizers.append({
                "name": "MOP (0-0-60)",
                "npk": "60% K",
                "quantity": int(mop_quantity),
                "cost": int(mop_cost),
                "applicationTiming": ["Basal application"]
            })
        
        else:
            # For other balanced fertilizers
            npk_parts = fertilizer_name.split('-')
            npk_desc = f"{npk_parts[0]}% N, {npk_parts[1]}% P, {npk_parts[2]}% K" if len(npk_parts) > 2 else f"{npk_parts[0]}% N, {npk_parts[1]}% P"
            
            quantity = 150 * farm_size
            cost = quantity * 7
            
            primary_fertilizers.append({
                "name": fertilizer_name,
                "npk": npk_desc,
                "quantity": int(quantity),
                "cost": int(cost),
                "applicationTiming": ["Basal application", "Top dressing"]
            })
        
        # Add secondary fertilizers based on soil pH and other parameters
        if soil_ph < 6.0:
            # Add lime for acidic soil
            lime_quantity = 100 * farm_size
            lime_cost = lime_quantity * 2
            secondary_fertilizers.append({
                "name": "Agricultural Lime",
                "quantity": int(lime_quantity),
                "cost": int(lime_cost),
                "purpose": "pH correction for acidic soil"
            })
        
        if nitrogen < 15:
            # Add nitrogen booster
            n_booster_quantity = 20 * farm_size
            n_booster_cost = n_booster_quantity * 10
            secondary_fertilizers.append({
                "name": "Ammonium Sulphate",
                "quantity": int(n_booster_quantity),
                "cost": int(n_booster_cost),
                "purpose": "Nitrogen boost for deficient soil"
            })
        
        # Add Zinc Sulphate as a micronutrient
        zn_quantity = 25 * farm_size
        zn_cost = zn_quantity * 15
        secondary_fertilizers.append({
            "name": "Zinc Sulphate",
            "quantity": int(zn_quantity),
            "cost": int(zn_cost),
            "purpose": "Micronutrient supplementation"
        })
        
        # Add organic fertilizers
        if organic_matter < 1.5:
            fym_quantity = 5000 * farm_size
            fym_cost = fym_quantity * 0.5
            
            organic_fertilizers.append({
                "name": "Farmyard Manure",
                "quantity": int(fym_quantity),
                "cost": int(fym_cost),
                "benefits": ["Improves soil structure", "Increases water retention", "Provides slow-release nutrients"]
            })
        
        vermi_quantity = 1000 * farm_size
        vermi_cost = vermi_quantity * 3
        
        organic_fertilizers.append({
            "name": "Vermicompost",
            "quantity": int(vermi_quantity),
            "cost": int(vermi_cost),
            "benefits": ["Rich in nutrients", "Improves soil biology", "Enhances root development"]
        })
        
        # Calculate total cost
        total_cost = sum(fert["cost"] for fert in primary_fertilizers)
        total_cost += sum(fert["cost"] for fert in secondary_fertilizers)
        total_cost += sum(fert["cost"] for fert in organic_fertilizers)
        
        # Create application schedule
        application_schedule = []
        
        # Add organic matter application
        if organic_fertilizers:
            application_schedule.append({
                "stage": "Land Preparation",
                "fertilizer": organic_fertilizers[0]["name"],
                "quantity": organic_fertilizers[0]["quantity"],
                "method": "Broadcasting",
                "timing": "15 days before sowing"
            })
        
        # Add basal application
        basal_fertilizers = []
        for fert in primary_fertilizers:
            if "Basal" in fert["applicationTiming"] or "Basal application" in fert["applicationTiming"]:
                basal_fertilizers.append(fert["name"])
        
        if basal_fertilizers:
            application_schedule.append({
                "stage": "Basal Application",
                "fertilizer": " + ".join(basal_fertilizers),
                "quantity": int(sum(fert["quantity"]/2 for fert in primary_fertilizers if "Basal" in fert["applicationTiming"] or "Basal application" in fert["applicationTiming"])),
                "method": "Broadcasting & incorporation",
                "timing": "At sowing"
            })
        
        # Add top dressing / split applications
        top_dress_fertilizers = []
        for fert in primary_fertilizers:
            if any(timing for timing in fert["applicationTiming"] if "Top" in timing or "split" in timing.lower() or "Vegetative" in timing):
                top_dress_fertilizers.append(fert["name"])
        
        if top_dress_fertilizers:
            application_schedule.append({
                "stage": "Vegetative Stage",
                "fertilizer": " + ".join(top_dress_fertilizers),
                "quantity": int(sum(fert["quantity"]/2 for fert in primary_fertilizers if any(timing for timing in fert["applicationTiming"] if "Top" in timing or "split" in timing.lower() or "Vegetative" in timing))),
                "method": "Side dressing",
                "timing": "30-35 days after sowing"
            })
        
        # Add micronutrient application
        if len(secondary_fertilizers) > 0:
            application_schedule.append({
                "stage": "Micronutrient Application",
                "fertilizer": secondary_fertilizers[0]["name"],
                "quantity": secondary_fertilizers[0]["quantity"],
                "method": "Foliar spray or soil application",
                "timing": "40-45 days after sowing"
            })
        
        # Generate application tips based on crop and fertilizer
        tips = [
            "Apply fertilizers when soil moisture is adequate",
            "Split nitrogen application for better efficiency",
            "Apply organic matter before land preparation for best results",
            "Use appropriate protective gear when handling chemical fertilizers"
        ]
        
        # Generate warnings
        warnings = [
            "Avoid over-application of nitrogen to prevent lodging",
            f"Don't apply fertilizers during heavy rain to prevent runoff",
            "Maintain proper spacing between fertilizer and seeds to prevent damage",
            "Store fertilizers in a dry place away from children and pets"
        ]
        
        # Format the response
        recommendation = {
            "crop": crop,
            "farmSize": farm_size,
            "soilTest": {
                "nitrogen": int(nitrogen),
                "phosphorus": int(phosphorus),
                "potassium": int(potassium),
                "ph": soil_ph,
                "organicMatter": organic_matter
            },
            "recommendations": {
                "primary": primary_fertilizers,
                "secondary": secondary_fertilizers,
                "organic": organic_fertilizers
            },
            "totalCost": int(total_cost),
            "applicationSchedule": application_schedule,
            "tips": tips,
            "warnings": warnings
        }
        
        print(f"Successfully generated fertilizer recommendation for {crop}")
        
        return jsonify({
            "status": "success",
            "recommendation": recommendation
        })
    except Exception as e:
        import traceback
        print(f"Error in fertilizer calculation: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": "An error occurred while calculating fertilizer recommendations. Please check your inputs and try again."
        }), 500

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        headers = response.headers

        headers["Access-Control-Allow-Origin"] = "*"
        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        headers["Access-Control-Allow-Headers"] = "Content-Type"

        return response

@app.route('/chat', methods=['POST'])
def plant_chat():
    """
    General Plant Analysis Chat using AWS Bedrock
    """
    try:
        data = request.json
        user_query = data.get("query", "")
        lang = data.get("language", "en")  # Default to English if no language specified

        if not user_query:
            return jsonify({"error": "Query is required"}), 400

        if lang not in languages:
            return jsonify({"error": f"Unsupported language code. Supported codes are: {', '.join(languages.keys())}"}), 400

        # Get system prompt
        system_prompt = get_system_prompt(lang)

        # Prepare the user query with language instruction
        full_query = f"{user_query}\n\nPlease respond in {languages.get(lang, 'English')}."

        # Use AWS Bedrock directly
        if not bedrock_runtime:
            raise Exception("AWS Bedrock client not initialized. Please check your AWS credentials (AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY) in your .env file.")

        if not INFERENCE_PROFILE_ARN:
            raise Exception("INFERENCE_PROFILE_ARN not configured. Please set it in your .env file.")

        # Prepare request for Claude model
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": full_query
                }
            ],
            "temperature": 0.7
        }

        # Call AWS Bedrock Claude model
        response = bedrock_runtime.invoke_model(
            modelId=INFERENCE_PROFILE_ARN,
            contentType='application/json',
            accept='application/json',
            body=json.dumps(request_body)
        )

        # Parse response
        response_body = json.loads(response['body'].read())
        
        # Extract the main content based on the response structure
        if 'content' in response_body and len(response_body['content']) > 0:
            ai_response = response_body['content'][0]['text']
        elif 'usage' in response_body and len(response_body['usage']) > 0:
            ai_response = response_body['usage'][0]['text']
        else:
            ai_response = "Unable to extract response from the model."

        return jsonify({
            "response": ai_response,
            "language": languages[lang],
            "status": "success",
            "model": "bedrock:claude"
        })
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "language": languages.get(lang, "English"),
            "status": "error"
        }), 500


# Run the Flask app
if __name__ == '__main__':
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
       # Start the Flask app on port 8000 with CORS enabled
    app.run(host='0.0.0.0', port=8000, debug=True)   
    print("\n" + "="*50)
    print("🌱 Starting AgriGuru Unified API Server on port 000...")
    print("Available endpoints:")
    print("  - GET  /                    : API status")
    print("  - GET  /yield/options       : Get yield prediction options")
    print("  - POST /yield/predict       : Predict crop yield")
    print("  - GET  /price/states        : Get states for price prediction")
    print("  - GET  /price/districts     : Get districts for a state")
    print("  - POST /price/predict       : Predict crop prices")
    print("  - GET  /crop/states         : Get states for crop recommendation")
    print("  - GET  /crop/districts      : Get districts for crop recommendation")
    print("  - POST /crop/recommend      : Get crop recommendations")
    print("  - POST /fertilizer/calculate: Calculate fertilizer recommendations")
    print("  - GET  /disasters           : Get disaster predictions and alerts (Ambee API)")
    print("  - POST /disease_alerts      : Get crop disease alerts based on location (LLM)")
    print("  - POST /cultivation_tips    : Get cultivation tips based on location and crops (LLM)")
    print("="*50 + "\n")
    
    # === CULTIVATION TIPS API ENDPOINT ===
    @app.route('/cultivation_tips', methods=['POST'])
    def proxy_cultivation_tips():
        """
        Proxy endpoint to forward cultivation tips requests to the Llama LLM service
        """
        try:
            # Get data from the request
            data = request.json
            
            if not data:
                return jsonify({"error": "No data provided in request"}), 400
            
            # Forward the request to the Llama API
            llama_response = requests.post(
                "http://localhost:8000/cultivation_tips",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            
            # Get the response from Llama API
            if llama_response.status_code == 200:
                return jsonify(llama_response.json()), 200
            else:
                error_message = f"Error from Llama API: {llama_response.text}"
                print(error_message)
                
                # Return a formatted error response
                return jsonify({
                    "status": "error",
                    "message": error_message,
                    "tips": []
                }), llama_response.status_code
                
        except Exception as e:
            print(f"Error proxying cultivation tips request: {str(e)}")
            
            # Create a fallback response for development/demo purposes
            fallback_tips = [
                {
                    "crop_name": "Rice",
                    "best_season": "Kharif (June-July sowing)",
                    "varieties": ["IR-36", "MTU-1010", "Swarna", "BPT-5204"],
                    "soil_preparation": [
                        "Plough the field 2-3 times and puddle with onset of monsoon",
                        "Level the field properly for uniform water distribution",
                        "Apply well decomposed farmyard manure @ 10-15 tonnes/hectare"
                    ],
                    "irrigation": "Keep 2-5 cm standing water during transplanting to tillering. Apply critical irrigation during flowering and grain filling stages.",
                    "fertilizer": [
                        "Apply NPK @ 120:60:60 kg/ha",
                        "Apply 50% N and full P and K as basal dose",
                        "Top dress remaining N in two equal splits at tillering and panicle initiation stages"
                    ],
                    "pest_management": [
                        "Monitor for stem borers and leaf folders",
                        "Use pheromone traps @ 5/acre",
                        "If needed, spray Chlorantraniliprole 0.4% GR @ 4 kg/acre"
                    ],
                    "weed_control": [
                        "Apply pre-emergence herbicide Butachlor @ 1.5 kg a.i./ha within 3 days after transplanting",
                        "One hand weeding at 30-35 days after transplanting"
                    ],
                    "harvest_indicators": [
                        "When 80% of the grains turn golden yellow",
                        "Moisture content of grain around 20-22%"
                    ],
                    "post_harvest": [
                        "Dry grains to bring down moisture content to 12-14%",
                        "Store in clean, dry and pest-free containers"
                    ],
                    "expected_yield": "5.0-6.5 tonnes/hectare",
                    "region_note": "These tips are adapted for your region based on general agricultural practices."
                }
            ]
            
            return jsonify({
                "status": "error", 
                "message": f"Error connecting to Llama API: {str(e)}",
                "tips": fallback_tips
            }), 500
    
    # === DISEASE ALERTS API ENDPOINT ===
    @app.route('/disease_alerts', methods=['POST'])
    def proxy_disease_alerts():
        """
        Proxy endpoint to forward disease alerts requests to the Llama LLM service
        """
        try:
            # Get data from the request
            data = request.json
            
            if not data:
                return jsonify({"error": "No data provided in request"}), 400
            
            # Forward the request to the Llama API
            llama_response = requests.post(
                "http://localhost:8000/disease_alerts",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            
            # Get the response from Llama API
            if llama_response.status_code == 200:
                return jsonify(llama_response.json()), 200
            else:
                error_message = f"Error from Llama API: {llama_response.text}"
                print(error_message)
                
                # Return a formatted error response
                return jsonify({
                    "status": "error",
                    "message": error_message,
                    "alerts": []
                }), llama_response.status_code
                
        except Exception as e:
            print(f"Error proxying disease alerts request: {str(e)}")
            
            # Create a fallback response for development/demo purposes
            fallback_alerts = [
                {
                    "disease_name": "Rice Blast",
                    "crop_type": "Rice",
                    "severity": "Medium",
                    "probability": 65,
                    "description": "A fungal disease that affects rice leaves, stems, and panicles, causing lesions and reducing yield.",
                    "symptoms": [
                        "Diamond-shaped lesions on leaves with gray centers and brown borders",
                        "Black/brown spots on panicles",
                        "Withered and broken panicles"
                    ],
                    "prevention_steps": [
                        "Use resistant rice varieties",
                        "Apply balanced fertilizers",
                        "Maintain proper field drainage"
                    ],
                    "treatment_options": [
                        "Apply fungicides like Tricyclazole or Isoprothiolane",
                        "Adjust nitrogen application timing",
                        "Improve field aeration"
                    ],
                    "affected_regions": ["Bangalore Rural", "Mysore", "Mandya"],
                    "expected_duration": "4-6 weeks during monsoon season"
                },
                {
                    "disease_name": "Late Blight",
                    "crop_type": "Potato",
                    "severity": "High",
                    "probability": 85,
                    "description": "A devastating fungal disease affecting potato leaves and tubers, causing rapid decay especially in humid conditions.",
                    "symptoms": [
                        "Dark green to black water-soaked spots on leaves",
                        "White fuzzy growth on leaf undersides",
                        "Brown lesions on tubers"
                    ],
                    "prevention_steps": [
                        "Plant certified disease-free seed potatoes",
                        "Implement crop rotation",
                        "Ensure good drainage and airflow"
                    ],
                    "treatment_options": [
                        "Apply copper-based fungicides preventively",
                        "Use systemic fungicides like Mancozeb plus Metalaxyl",
                        "Remove and destroy infected plants"
                    ],
                    "affected_regions": ["Bangalore Rural", "Hassan", "Chikmagalur"],
                    "expected_duration": "2-3 weeks if untreated, can destroy entire crop"
                }
            ]
            
            return jsonify({
                "status": "error", 
                "message": f"Error connecting to Llama API: {str(e)}",
                "alerts": fallback_alerts if "Mock" in str(data.get("location", {}).get("district", "")) else []
            }), 500
    
    # === DISASTERS API ENDPOINT ===
    @app.route('/disasters', methods=['GET'])
    def get_disasters():
        """Proxy endpoint for Ambee API disaster data"""
        try:
            # Get the API key from environment variables
            ambee_api_key = "151b2ba19ade8cefb5fdb480d7ead6182ef1c6a9918ca4aa2f806a9c455d39a7"
            
            # Make the actual API call to Ambee API - request up to 50 events to get more variety
            response = requests.get(
                "https://api.ambeedata.com/disasters/latest/by-country-code",
                params={"countryCode": "IND", "limit": 50},
                headers={"x-api-key": ambee_api_key, "Content-type": "application/json"}
            )
            
            # Check if the response was successful
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Ambee API returned status code: {response.status_code}")
                print(f"Response content: {response.text}")
                return jsonify({
                    "status": "error",
                    "message": f"Ambee API returned status code: {response.status_code}",
                    "result": []
                }), response.status_code
            
        except Exception as e:
            print(f"Error fetching disaster data: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"An error occurred: {str(e)}"
            }), 500
    
    app.run(debug=True, port=8000, host='0.0.0.0')
