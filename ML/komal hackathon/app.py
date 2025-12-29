from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# Load your trained model
model = joblib.load('crop_price_model.pkl')

# Load the geospatial data
geo_data = pd.read_csv('geodata.csv')  # Update with your actual CSV file path
states = geo_data['State'].unique().tolist()

# Sample crop list for demonstration; replace with actual crop data if needed
crops = ['Apple', 'Banana', 'Bhindi', 'Bitter Gourd', 'Brinjal', 'Cabbage', 'Capsicum',
         'Carrot', 'Cauliflower', 'Cluster Beans', 'Colacasia', 'Cucumbar', 'Dry Fodder',
         'French Beans', 'Grapes', 'Green Chilli', 'Green Fodder', 'Guava', 'Leafy Vegetable',
         'Lemon', 'Maize', 'Mango', 'Methi(Leaves)', 'Mousambi', 'Onion', 'Pear',
         'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Sponge Gourd', 'Sweet Potato',
         'Tinda', 'Tomato', 'Wheat', 'blackgram', 'chickpea', 'coconut', 'coffee',
         'cotton', 'jute', 'kidneybeans', 'lentil', 'mothbeans', 'mungbean',
         'muskmelon', 'orange', 'papaya', 'pigeonbeans', 'rice', 'watermelon']

# Create a LabelEncoder for the 'crop' column
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


@app.route('/')
def index():
    return render_template('index.html', states=states, crops=crops)


@app.route('/districts', methods=['POST'])
def get_districts():
    state = request.form.get('state')
    districts = geo_data[geo_data['State'] == state]['District '].unique().tolist()
    return jsonify({'districts': districts})


@app.route('/predict', methods=['POST'])
def predict():
    state = request.form.get('state')
    district = request.form.get('district')
    date = request.form.get('date')
    crop = request.form.get('crop')
    production = float(request.form.get('production'))

    # Convert date to year
    year = pd.to_datetime(date).year

    # Encode the crop using the mapping
    crop_encoded = crop_mapping[crop]

    # Prepare input for model prediction
    input_data = pd.DataFrame({
        'year': [year],
        'crop': [crop_encoded],  # Use the encoded crop
        'production': [production]
    })

    # Use the model to make predictions
    predicted_price = model.predict(input_data)[0]  # Get the predicted price

    return jsonify({'predicted_price': predicted_price})


if __name__ == '__main__':
    app.run(port=7860,host='0.0.0.0')
