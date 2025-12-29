from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import base64
import boto3
import json
import time
from botocore.config import Config
from groq import Groq

app = Flask(__name__)

# Enable CORS
CORS(app)

load_dotenv()

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

# Set environment variables for AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = AWS_ACCESS_KEY
os.environ["AWS_SECRET_ACCESS_KEY"] = AWS_SECRET_KEY
os.environ["AWS_DEFAULT_REGION"] = AWS_REGION

# os.environ["AWS_ACCESS_KEY_ID"] = "dummy"
# os.environ["AWS_SECRET_ACCESS_KEY"] = "dummy"
# os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

# Your inference profile ARN
INFERENCE_PROFILE_ARN = os.getenv("INFERENCE_PROFILE_ARN")


# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "gsk_2az3"))
# GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
GROQ_MODEL = "llama-3.3-70b-versatile"

# Initialize AWS Bedrock client
try:
    bedrock_runtime = boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
        config=Config(retries={'max_attempts': 5})
    )
    print("AWS Bedrock client initialized successfully")
except Exception as e:
    print(f"Error initializing AWS Bedrock client: {str(e)}")
    bedrock_runtime = None

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


# Updated system prompt with language instruction
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

@app.route('/classify_plant_disease', methods=['POST'])
def classify_plant_disease():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    lang = request.form.get('language', 'en')  # Get language from form data

    if lang not in languages:
        return jsonify({"error": f"Unsupported language code. Supported codes are: {', '.join(languages.keys())}"}), 400

    try:
        if not bedrock_runtime:
            raise Exception("AWS Bedrock client not initialized")

        # Read image file
        image_file = request.files['image']
        image_data = base64.b64encode(image_file.read()).decode('utf-8')

        # Enhanced prompt with specific instructions for plant disease analysis
        prompt = f"""
        Analyze this plant/crop image and provide a comprehensive disease diagnosis and treatment plan. 

        **Analysis Requirements:**
        1. Identify the specific plant disease or health issue
        2. Determine the crop/plant type if possible
        3. Assess the severity level (Early/Moderate/Severe)
        4. Provide detailed treatment recommendations
        5. Include prevention strategies

        **Response Format:**
        Please structure your response using proper markdown formatting for React UI rendering:

        ## Disease Identification
        ### **Primary Diagnosis**
        - **Disease Name**: [Specific disease name]
        - **Confidence Level**: [High/Medium/Low based on image clarity]
        - **Affected Crop**: [Crop/plant type]
        - **Severity**: [Early/Moderate/Severe stage]

        ### **Symptoms Analysis**
        - **Visual Indicators**: [What you observe in the image]
        - **Affected Parts**: [Leaves/stems/fruits/roots]
        - **Pattern**: [Localized/Widespread]

        ## Treatment Plan

        ### **Immediate Actions** (Next 24-48 hours)
        1. **Isolation**: [Steps to prevent spread]
        2. **Sanitation**: [Cleaning procedures]
        3. **Emergency Treatment**: [Quick intervention steps]

        ### **Treatment Options**
        #### **Organic Methods**
        - [Natural remedies and bio-control agents]
        - [Dosage and application methods]

        #### **Chemical Treatment** (if needed)
        - **Recommended Products**: [Specific fungicides/pesticides]
        - **Application Rate**: [Dosage per acre/hectare]
        - **Timing**: [When and how often to apply]
        - **Safety Precautions**: [PPE and handling instructions]

        ### **Monitoring Protocol**
        - **Daily Checks**: [What to monitor daily]
        - **Weekly Assessment**: [Progress indicators]
        - **Recovery Timeline**: [Expected improvement timeframe]

        ## Prevention Strategies

        ### **Cultural Practices**
        - **Crop Rotation**: [Recommended rotation schedule]
        - **Spacing**: [Plant density recommendations]
        - **Timing**: [Optimal planting/harvesting times]

        ### **Environmental Management**
        - **Irrigation**: [Water management practices]
        - **Humidity Control**: [Ventilation and spacing]
        - **Soil Health**: [Fertility and pH management]

        ### **Resistant Varieties**
        - [Recommended disease-resistant cultivars if available]

        ## Additional Recommendations
        - [Region-specific considerations]
        - [Seasonal factors]
        - [Economic considerations]

        > **Important Note**: Consult local agricultural extension officers for region-specific guidance and latest recommendations.

        **Language**: Please provide the entire response in {languages[lang]}.
        """

        # Specialized system prompt for plant disease analysis
        system_prompt = f"""
        You are an expert plant pathologist and agricultural consultant specializing in Indian crop diseases. You have comprehensive knowledge of:

        ## Core Expertise
        - **Plant Disease Diagnosis**: Fungal, bacterial, viral, and nutritional disorders
        - **Crop-Specific Diseases**: Major diseases affecting Indian crops (rice, wheat, cotton, sugarcane, etc.)
        - **Integrated Disease Management**: Organic and chemical control methods
        - **Regional Disease Patterns**: State-wise and season-wise disease prevalence
        - **Resistance Management**: Preventing pesticide resistance

        ## Response Guidelines
        - **Always use proper markdown formatting** for React UI rendering
        - **Provide specific, actionable recommendations** based on image analysis
        - **Include both organic and chemical solutions** when appropriate
        - **Consider Indian agricultural context** (climate, crops, available products)
        - **Use technical terms with explanations** for farmer understanding
        - **Include safety precautions** for chemical applications
        - **Provide realistic timelines** for treatment and recovery

        ## Image Analysis Protocol
        1. **Systematic Observation**: Examine leaves, stems, fruits, and overall plant health
        2. **Pattern Recognition**: Identify disease symptoms, distribution, and severity
        3. **Differential Diagnosis**: Consider multiple possible causes
        4. **Confidence Assessment**: Rate diagnosis confidence based on image quality
        5. **Treatment Prioritization**: Recommend most effective and practical solutions

        ## Safety and Disclaimer
        - Always recommend consulting local agricultural extension services
        - Include appropriate safety warnings for chemical treatments
        - Consider economic feasibility for small-scale farmers
        - Emphasize integrated pest management principles

        **Response Language**: Provide all responses in {languages.get(lang, 'English')} while maintaining technical accuracy.
        """

        # Prepare request for Claude Vision model
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1500,  # Increased for comprehensive response
            "temperature": 0.3,  # Lower temperature for more consistent diagnostic responses
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_data
                            }
                        }
                    ]
                }
            ]
        }

        # Call AWS Bedrock Claude Vision model with the inference profile ARN
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
            diagnosis = response_body['content'][0]['text']
        elif 'usage' in response_body and len(response_body['usage']) > 0:
            diagnosis = response_body['usage'][0]['text']
        else:
            diagnosis = "Unable to extract response from the model."

        # Enhanced response with additional metadata
        return jsonify({
            "diagnosis": diagnosis,
            "language": languages[lang],
            "status": "success",
            "image_processed": True,
            "analysis_type": "plant_disease_classification",
            "confidence": "AI-generated analysis - verify with local experts"
        })

    except Exception as e:
        print(f"Error in classify_plant_disease endpoint: {str(e)}")

        # Enhanced error response
        return jsonify({
            "error": str(e),
            "language": languages[lang],
            "status": "error",
            "image_processed": False,
            "analysis_type": "plant_disease_classification",
            "troubleshooting": "Check image format (JPEG/PNG), size (<10MB), and network connection"
        }), 500

@app.route('/cultivation_tips', methods=['POST'])
def cultivation_tips():
    """Endpoint to get cultivation tips based on location and crops"""
    data = request.json
    
    location = data.get('location', {})
    state = location.get('state', '')
    district = location.get('district', '')
    crops = data.get('crops', [])
    lang = data.get('language', 'en')  # Default to English
    
    if not state or not district or not crops:
        return jsonify({"error": "Missing location (state, district) or crops information"}), 400
        
    if lang not in languages:
        return jsonify({"error": f"Unsupported language code. Supported codes are: {', '.join(languages.keys())}"}), 400
    
    # Build a prompt for the LLM to generate cultivation tips
    prompt = f"""
    As an agricultural expert, provide detailed cultivation tips for the following:
    
    Location: {state}, {district}
    Crops: {', '.join(crops)}
    
    For each crop, provide the following information:
    1. Optimal sowing/planting time specific to this region
    2. Recommended varieties that perform well in this region
    3. Soil preparation steps
    4. Irrigation requirements and schedule
    5. Fertilizer application recommendations (organic and chemical)
    6. Pest and disease management strategies
    7. Weed control methods
    8. Harvest timing indicators
    9. Post-harvest handling tips
    
    Format your response as a structured JSON object as follows:
    
    {{
      "tips": [
        {{
          "crop_name": "Crop Name",
          "best_season": "Optimal planting season",
          "varieties": ["Variety 1", "Variety 2", "Variety 3"],
          "soil_preparation": ["Step 1", "Step 2", "Step 3"],
          "irrigation": "Details about irrigation needs and schedule",
          "fertilizer": ["Application 1", "Application 2"],
          "pest_management": ["Strategy 1", "Strategy 2"],
          "weed_control": ["Method 1", "Method 2"],
          "harvest_indicators": ["Indicator 1", "Indicator 2"],
          "post_harvest": ["Tip 1", "Tip 2"],
          "expected_yield": "Estimated yield range per hectare"
        }},
        ... more crops ...
      ]
    }}
    
    IMPORTANT:
    - Provide ONLY the JSON response with no additional text
    - Base your cultivation tips on known agricultural practices in {state}, particularly in {district}
    - Consider regional factors like climate, soil type, and traditional farming practices
    - Be specific and accurate about cultivation methods in this region
    - Focus on practical advice that farmers can implement
    - Include at least one tip for each category
    - Tailor your recommendations to local conditions
    
    Remember, your output must be valid JSON that can be parsed by a JavaScript application.
    """
    
    # Get system prompt with appropriate language
    system_prompt = f"""
    You are an expert agricultural advisor specializing in crop cultivation practices across different regions of India.
    
    ## Core Expertise
    - **Regional Cultivation Knowledge**: Deep understanding of farming practices in different Indian states
    - **Crop-Specific Methods**: Specialized knowledge of cultivation requirements for major Indian crops
    - **Seasonal Adaptations**: Expertise in adjusting farming practices according to seasonal variations
    - **Local Variety Recommendations**: Knowledge of region-specific crop varieties and their benefits
    - **Sustainable Practices**: Integration of traditional and modern sustainable farming methods
    
    ## Response Guidelines
    - Generate structured JSON data only, with no explanatory text
    - Base cultivation tips on established agricultural practices for specific regions
    - Provide specific, actionable information that farmers can implement
    - Include variety recommendations suitable for the specific region
    - Tailor tips to the specific district and state provided
    
    ## Response Language
    Provide the structured JSON in {languages[lang]}, but maintain proper JSON format.
    """
    
    try:
        # Try using Groq API for response
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
            
            # Call Groq API
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.3,  # Lower temperature for more factual responses
                max_tokens=3000,
                stream=False
            )
            
            # Extract and parse JSON response
            ai_response = completion.choices[0].message.content
            
            # Clean and parse the JSON response
            json_str = ai_response.strip()
            
            # Handle code blocks in the response
            if '```json' in json_str:
                start_idx = json_str.find('```json') + 7
                end_idx = json_str.rfind('```')
                if start_idx > 7 and end_idx > start_idx:
                    json_str = json_str[start_idx:end_idx].strip()
            elif '```' in json_str:
                start_idx = json_str.find('```') + 3
                end_idx = json_str.rfind('```')
                if start_idx > 3 and end_idx > start_idx:
                    json_str = json_str[start_idx:end_idx].strip()
                    
            # Print the processed JSON string for debugging
            print(f"Processed JSON string (first 100 chars): {json_str[:min(100, len(json_str))]}...")
            
            try:
                response_data = json.loads(json_str)
            except json.JSONDecodeError as json_err:
                print(f"JSON decode error: {json_err}")
                # Create a fallback response with manually constructed JSON
                fallback_tips = generate_fallback_tips(state, district, crops)
                response_data = {"tips": fallback_tips}
            
            return jsonify(response_data)
            
        except Exception as groq_error:
            print(f"Groq API error in cultivation_tips: {str(groq_error)}")
            print("Falling back to AWS Bedrock...")
            
            # Fallback to AWS Bedrock if Groq fails
            if not bedrock_runtime:
                raise Exception("AWS Bedrock client not initialized")

            # Prepare request for Claude model
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 3000,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3
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
            
            # Extract the main content
            if 'content' in response_body and len(response_body['content']) > 0:
                ai_response = response_body['content'][0]['text']
            elif 'usage' in response_body and len(response_body['usage']) > 0:
                ai_response = response_body['usage'][0]['text']
            else:
                ai_response = "Unable to extract response from the model."
            
            # Clean and parse the JSON response
            json_str = ai_response.strip()
            
            # Handle code blocks in the response
            if '```json' in json_str:
                start_idx = json_str.find('```json') + 7
                end_idx = json_str.rfind('```')
                if start_idx > 7 and end_idx > start_idx:
                    json_str = json_str[start_idx:end_idx].strip()
            elif '```' in json_str:
                start_idx = json_str.find('```') + 3
                end_idx = json_str.rfind('```')
                if start_idx > 3 and end_idx > start_idx:
                    json_str = json_str[start_idx:end_idx].strip()
                
            try:
                response_data = json.loads(json_str)
            except json.JSONDecodeError:
                # Create a fallback response with manually constructed JSON
                fallback_tips = generate_fallback_tips(state, district, crops)
                response_data = {"tips": fallback_tips}
            
            return jsonify(response_data)
    
    except Exception as e:
        print(f"Error in cultivation_tips endpoint: {str(e)}")
        
        # Create a fallback response with some realistic data
        fallback_tips = generate_fallback_tips(state, district, crops)
        
        fallback_response = {
            "status": "success",
            "message": "Generated using fallback data due to API error",
            "tips": fallback_tips
        }
        
        return jsonify(fallback_response), 200

# Helper function to generate fallback cultivation tips when the API fails
def generate_fallback_tips(state, district, crops):
    """Generate fallback cultivation tips based on common crop knowledge"""
    fallback_tips = []
    
    # Common crop cultivation tips
    common_tips = {
        "Rice": {
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
            "expected_yield": "5.0-6.5 tonnes/hectare"
        },
        "Wheat": {
            "crop_name": "Wheat",
            "best_season": "Rabi (November-December sowing)",
            "varieties": ["HD-2967", "HD-3086", "DBW-17", "PBW-550"],
            "soil_preparation": [
                "Deep ploughing once followed by 2-3 harrowings",
                "Planking after each harrowing for fine tilth",
                "Apply 10-15 tonnes/ha of FYM during land preparation"
            ],
            "irrigation": "First irrigation at 20-25 days after sowing (CRI stage), followed by irrigation at tillering, jointing, flowering, and grain filling stages.",
            "fertilizer": [
                "Apply NPK @ 120:60:40 kg/ha",
                "Apply full P, K and half of N as basal dose",
                "Top dress remaining N in two equal splits at CRI and tillering stages"
            ],
            "pest_management": [
                "Monitor for aphids and terminate regularly",
                "For aphids, spray Imidacloprid 17.8% SL @ 100 ml/acre",
                "For termites, apply Fipronil 0.3% GR @ 8-10 kg/ha"
            ],
            "weed_control": [
                "Apply Sulfosulfuron 75% WG @ 13.5 g/acre at 25-30 days after sowing",
                "One hand weeding at 35-40 days after sowing if needed"
            ],
            "harvest_indicators": [
                "When grains become hard and cannot be dented with thumbnail",
                "Straw turns golden yellow and dry"
            ],
            "post_harvest": [
                "Dry the grains properly to reduce moisture content to 12%",
                "Store in clean, dry gunny bags away from moisture"
            ],
            "expected_yield": "4.5-5.5 tonnes/hectare"
        },
        "Potato": {
            "crop_name": "Potato",
            "best_season": "Rabi (October-November planting)",
            "varieties": ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Surya", "Kufri Chipsona-1"],
            "soil_preparation": [
                "Deep ploughing followed by 2-3 harrowings to obtain good tilth",
                "Form ridges at 60 cm spacing",
                "Apply 25-30 tonnes/ha well decomposed FYM during field preparation"
            ],
            "irrigation": "Light irrigation after planting, followed by irrigation at 7-10 days interval depending on soil type and weather conditions.",
            "fertilizer": [
                "Apply NPK @ 150:100:120 kg/ha",
                "Apply full P, K and half of N at planting",
                "Apply remaining N at earthing up (30-35 days after planting)"
            ],
            "pest_management": [
                "Monitor for late blight and early blight diseases",
                "Spray Mancozeb 75% WP @ 2.5 g/liter as preventive measure",
                "For potato tuber moth, apply Chlorpyrifos 20% EC @ 2.5 ml/liter"
            ],
            "weed_control": [
                "Apply Metribuzin 70% WP @ 350 g/ha as pre-emergence herbicide",
                "Earthing up at 30-35 days after planting effectively controls weeds"
            ],
            "harvest_indicators": [
                "When plant leaves turn yellowish and start drying",
                "When skin of tubers is firm and doesn't peel off easily",
                "Usually 80-90 days after planting"
            ],
            "post_harvest": [
                "Cure potatoes in shade for 10-15 days before storage",
                "Store in cool, dark place with good ventilation"
            ],
            "expected_yield": "25-30 tonnes/hectare"
        }
    }
    
    # Add cultivation tips for each crop
    for crop in crops:
        found = False
        for known_crop, tips in common_tips.items():
            if crop.lower() == known_crop.lower():
                # Add tips for this known crop
                crop_tips = tips.copy()
                # Customize for the region
                crop_tips["region_note"] = f"These tips are adapted for {district}, {state} conditions."
                fallback_tips.append(crop_tips)
                found = True
                break
                
        if not found:
            # Add generic tips for unknown crop
            fallback_tips.append({
                "crop_name": crop,
                "best_season": "Depends on local climate (consult local agriculture office)",
                "varieties": ["Local varieties adapted to the region", "Improved varieties as recommended by KVK"],
                "soil_preparation": [
                    "Deep ploughing to improve soil aeration",
                    "Add organic matter for soil health",
                    "Test soil and adjust pH if necessary"
                ],
                "irrigation": "Irrigate as per crop requirement, typically more during flowering and fruit development stages.",
                "fertilizer": [
                    "Apply balanced NPK as per soil test recommendation",
                    "Include organic manures for soil health",
                    "Apply micronutrients as needed"
                ],
                "pest_management": [
                    "Regular monitoring of pests and diseases",
                    "Use integrated pest management (IPM) techniques",
                    "Consider biological control methods first"
                ],
                "weed_control": [
                    "Timely weeding during initial crop growth",
                    "Use mulching to suppress weeds",
                    "Consider appropriate herbicides if necessary"
                ],
                "harvest_indicators": [
                    "Crop-specific indicators of maturity",
                    "Harvest during dry weather conditions when possible"
                ],
                "post_harvest": [
                    "Proper drying of harvested crop",
                    "Clean storage area before storing",
                    "Regular monitoring during storage"
                ],
                "expected_yield": "Varies by variety and management practices",
                "region_note": f"These are general tips for {crop} cultivation in {district}, {state}. Consult your local agricultural extension center for specific recommendations."
            })
    
    return fallback_tips

@app.route('/disease_alerts', methods=['POST'])
def disease_alerts():
    """Endpoint to get disease alerts based on location and crops"""
    data = request.json
    
    location = data.get('location', {})
    state = location.get('state', '')
    district = location.get('district', '')
    crops = data.get('crops', [])
    lang = data.get('language', 'en')  # Default to English
    
    if not state or not district or not crops:
        return jsonify({"error": "Missing location (state, district) or crops information"}), 400
        
    if lang not in languages:
        return jsonify({"error": f"Unsupported language code. Supported codes are: {', '.join(languages.keys())}"}), 400
    
    # Build a prompt for the LLM to generate disease alerts
    prompt = f"""
    As an agricultural disease expert, generate potential disease alerts for the following:
    
    Location: {state}, {district}
    Crops: {', '.join(crops)}
    
    For each crop, provide the following information:
    1. Top potential disease threats based on the region and current season
    2. Severity level (High, Medium, Low)
    3. Probability of occurrence (as a percentage)
    4. Brief description of each disease
    5. Key symptoms to watch for
    6. Preventive measures farmers should take
    7. Treatment options if infection is detected
    8. Affected regions within the state
    9. Expected duration of disease risk
    
    Format your response as a structured JSON object as follows:
    
    {{
      "alerts": [
        {{
          "disease_name": "Disease Name",
          "crop_type": "Affected Crop",
          "severity": "High|Medium|Low",
          "probability": 85,
          "description": "Brief description of the disease",
          "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
          "prevention_steps": ["Prevention step 1", "Prevention step 2"],
          "treatment_options": ["Treatment 1", "Treatment 2"],
          "affected_regions": ["Region 1", "Region 2"],
          "expected_duration": "Duration (e.g., '2-3 weeks')"
        }},
        ... more alerts ...
      ]
    }}
    
    IMPORTANT:
    - Provide ONLY the JSON response with no additional text
    - Base your disease predictions on known patterns in {state}, particularly in {district}
    - Consider seasonal factors, current weather conditions, and historical disease patterns
    - Be specific and accurate about crop diseases in this region
    - Focus on the most likely diseases for the given crops in this specific region
    - Include at least one alert per crop, but no more than 3 alerts per crop
    - If a crop is unlikely to have any disease issues in the current conditions, note this with a low probability (< 30%)
    
    Remember, your output must be valid JSON that can be parsed by a JavaScript application.
    """
    
    # Get system prompt with appropriate language
    system_prompt = f"""
    You are an expert agricultural plant pathologist specializing in crop disease forecasting and early warning systems in India. 
    
    ## Core Expertise
    - **Disease Prediction**: Forecasting potential disease outbreaks based on location, season, and crop type
    - **Regional Knowledge**: Comprehensive understanding of India's agroclimatic zones and disease patterns
    - **Crop-Specific Expertise**: Deep knowledge of major diseases affecting Indian crops
    - **Prevention Protocols**: Expert advice on preventive measures tailored to specific regions
    - **Risk Assessment**: Ability to estimate disease probability based on environmental factors
    
    ## Response Guidelines
    - Generate structured JSON data only, with no explanatory text
    - Base predictions on factual relationships between crops, locations, and known disease patterns
    - Provide specific, actionable information that farmers can implement
    - Include numerical probability estimates based on regional disease patterns
    - Tailor alerts to the specific district and state provided
    
    ## Response Language
    Provide the structured JSON in {languages[lang]}, but maintain proper JSON format.
    """
    
    try:
        # Try using Groq API for response
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
            
            # Call Groq API
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.3,  # Lower temperature for more factual responses
                max_tokens=3000,
                stream=False
            )
            
            # Extract and parse JSON response
            ai_response = completion.choices[0].message.content
            
            # Clean and parse the JSON response
            json_str = ai_response.strip()
            
            # Handle code blocks in the response
            if '```json' in json_str:
                start_idx = json_str.find('```json') + 7
                end_idx = json_str.rfind('```')
                if start_idx > 7 and end_idx > start_idx:
                    json_str = json_str[start_idx:end_idx].strip()
            elif '```' in json_str:
                start_idx = json_str.find('```') + 3
                end_idx = json_str.rfind('```')
                if start_idx > 3 and end_idx > start_idx:
                    json_str = json_str[start_idx:end_idx].strip()
                    
            # Print the processed JSON string for debugging
            print(f"Processed JSON string (first 100 chars): {json_str[:min(100, len(json_str))]}...")
            
            try:
                response_data = json.loads(json_str)
            except json.JSONDecodeError as json_err:
                print(f"JSON decode error: {json_err}")
                # Create a fallback response with manually constructed JSON
                fallback_alerts = generate_fallback_alerts(state, district, crops)
                response_data = {"alerts": fallback_alerts}
            
            return jsonify(response_data)
            
        except Exception as groq_error:
            print(f"Groq API error in disease_alerts: {str(groq_error)}")
            print("Falling back to AWS Bedrock...")
            
            # Fallback to AWS Bedrock if Groq fails
            if not bedrock_runtime:
                raise Exception("AWS Bedrock client not initialized")

            # Prepare request for Claude model
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 516,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3
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
            
            # Extract the main content
            if 'content' in response_body and len(response_body['content']) > 0:
                ai_response = response_body['content'][0]['text']
            elif 'usage' in response_body and len(response_body['usage']) > 0:
                ai_response = response_body['usage'][0]['text']
            else:
                ai_response = "Unable to extract response from the model."
            
            # Clean and parse the JSON response
            json_str = ai_response.strip()
            if json_str.startswith('```json'):
                json_str = json_str[7:]
            if json_str.endswith('```'):
                json_str = json_str[:-3]
                
            json_str = json_str.strip()
            response_data = json.loads(json_str)
            
            return jsonify(response_data)
    
    except Exception as e:
        print(f"Error in disease_alerts endpoint: {str(e)}")
        
        # Create a fallback response with some realistic data
        fallback_alerts = generate_fallback_alerts(state, district, crops)
        
        fallback_response = {
            "status": "success",
            "message": "Generated using fallback data due to API error",
            "alerts": fallback_alerts
        }
        
        return jsonify(fallback_response), 200

# Helper function to generate fallback alerts when the API fails
def generate_fallback_alerts(state, district, crops):
    """Generate fallback alerts based on common crop diseases"""
    fallback_alerts = []
    
    # Common crop disease patterns
    common_diseases = {
        "Rice": [
            {
                "disease_name": "Rice Blast",
                "severity": "Medium",
                "probability": 65,
                "description": "A fungal disease that affects rice leaves, stems, and panicles, causing lesions and reducing yield.",
                "symptoms": ["Diamond-shaped lesions on leaves with gray centers and brown borders", 
                             "Black/brown spots on panicles", 
                             "Withered and broken panicles"],
                "prevention_steps": ["Use resistant rice varieties", 
                                     "Apply balanced fertilizers", 
                                     "Maintain proper field drainage"],
                "treatment_options": ["Apply fungicides like Tricyclazole or Isoprothiolane", 
                                     "Adjust nitrogen application timing", 
                                     "Improve field aeration"],
                "expected_duration": "4-6 weeks during monsoon season"
            },
            {
                "disease_name": "Bacterial Leaf Blight",
                "severity": "High",
                "probability": 75,
                "description": "A bacterial disease causing wilting of seedlings and yellowing and drying of leaves.",
                "symptoms": ["Water-soaked lesions on leaf edges", 
                             "Yellowing of leaves", 
                             "Wilting of seedlings"],
                "prevention_steps": ["Use disease-free seeds", 
                                     "Balanced use of fertilizers", 
                                     "Proper field drainage"],
                "treatment_options": ["Apply copper-based bactericides", 
                                     "Drain the field", 
                                     "Remove infected plants"],
                "expected_duration": "3-5 weeks"
            }
        ],
        "Wheat": [
            {
                "disease_name": "Wheat Rust",
                "severity": "High",
                "probability": 70,
                "description": "Fungal disease causing rust-colored pustules on leaves, reducing photosynthesis and grain production.",
                "symptoms": ["Reddish-brown pustules on leaves and stems", 
                             "Reduced vigor", 
                             "Shriveled grains"],
                "prevention_steps": ["Plant resistant varieties", 
                                     "Early sowing", 
                                     "Proper spacing"],
                "treatment_options": ["Apply fungicides like propiconazole", 
                                     "Proper timing of fungicide application", 
                                     "Follow recommended dose"],
                "expected_duration": "Throughout the growing season if not controlled"
            }
        ],
        "Potato": [
            {
                "disease_name": "Late Blight",
                "severity": "High",
                "probability": 85,
                "description": "A devastating fungal disease affecting potato leaves and tubers, causing rapid decay especially in humid conditions.",
                "symptoms": ["Dark green to black water-soaked spots on leaves", 
                             "White fuzzy growth on leaf undersides", 
                             "Brown lesions on tubers"],
                "prevention_steps": ["Plant certified disease-free seed potatoes", 
                                     "Implement crop rotation", 
                                     "Ensure good drainage and airflow"],
                "treatment_options": ["Apply copper-based fungicides preventively", 
                                     "Use systemic fungicides like Mancozeb plus Metalaxyl", 
                                     "Remove and destroy infected plants"],
                "expected_duration": "2-3 weeks if untreated, can destroy entire crop"
            }
        ],
        "Tomato": [
            {
                "disease_name": "Early Blight",
                "severity": "Medium",
                "probability": 60,
                "description": "Fungal disease causing dark spots on lower leaves and stems, reducing yield and fruit quality.",
                "symptoms": ["Dark brown spots with concentric rings on leaves", 
                             "Yellowing around lesions", 
                             "Stem lesions"],
                "prevention_steps": ["Crop rotation", 
                                     "Proper plant spacing", 
                                     "Mulching"],
                "treatment_options": ["Apply copper-based fungicides", 
                                     "Prune affected leaves", 
                                     "Improve air circulation"],
                "expected_duration": "Throughout growing season if not managed"
            }
        ]
    }
    
    # Add generic crops for any crop not in our common diseases list
    for crop in crops:
        found = False
        for known_crop, diseases in common_diseases.items():
            if crop.lower() == known_crop.lower():
                # Add diseases for this known crop
                for disease in diseases:
                    alert = disease.copy()
                    alert["crop_type"] = crop
                    alert["affected_regions"] = [district, f"Other parts of {state}"]
                    fallback_alerts.append(alert)
                found = True
                break
                
        if not found:
            # Add generic disease for unknown crop
            fallback_alerts.append({
                "disease_name": f"Fungal Leaf Spot",
                "crop_type": crop,
                "severity": "Medium",
                "probability": 50,
                "description": f"Common fungal disease affecting {crop} leaves causing spots and reduced photosynthesis.",
                "symptoms": ["Circular spots on leaves", "Yellowing around spots", "Premature leaf drop"],
                "prevention_steps": ["Crop rotation", "Proper plant spacing", "Balanced fertilization"],
                "treatment_options": ["Apply appropriate fungicides", "Remove affected leaves", "Improve air circulation"],
                "affected_regions": [district, f"Other parts of {state}"],
                "expected_duration": "2-4 weeks depending on weather conditions"
            })
    
    return fallback_alerts

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_query = data.get('query')
    lang = data.get('language', 'en')  # Default to English if no language specified

    if not user_query:
        return jsonify({"error": "Query is required"}), 400

    if lang not in languages:
        return jsonify({"error": f"Unsupported language code. Supported codes are: {', '.join(languages.keys())}"}), 400

    # Get system prompt
    system_prompt = get_system_prompt(lang)

    try:
        # Prepare the user query with language instruction
        full_query = f"{user_query}\n\nPlease respond in {languages.get(lang, 'English')}."
        
        # Using Groq API for faster responses
        try:
            # Prepare messages with system prompt and user query
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_query}
            ]
            
            # Call Groq API
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.34,
                max_tokens=1024,
                stream=False
            )
            
            # Extract response
            ai_response = completion.choices[0].message.content
            
            return jsonify({
                "response": ai_response,
                "language": languages[lang],
                "status": "success",
                "model": "groq:" + GROQ_MODEL
            })
            
        except Exception as groq_error:
            print(f"Groq API error: {str(groq_error)}")
            print("Falling back to AWS Bedrock...")
            
            # Fallback to AWS Bedrock if Groq fails
            if not bedrock_runtime:
                raise Exception("AWS Bedrock client not initialized")

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

        # Return error response
        return jsonify({
            "error": str(e),
            "language": languages[lang],
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
