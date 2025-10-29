"""
Flask API Server for Diabetes Prediction ML Service
Provides HTTP endpoints for diabetes prediction using trained ML model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import json
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_VERSION = '20251023_210956'  # Update này theo model mới nhất

# Feature names (must match training data)
FEATURE_NAMES = [
    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
]

# Load model and scaler
try:
    model_path = os.path.join(MODEL_DIR, f'diabetes_model_logistic_regression_{MODEL_VERSION}.joblib')
    scaler_path = os.path.join(MODEL_DIR, f'scaler_{MODEL_VERSION}.joblib')
    metadata_path = os.path.join(MODEL_DIR, f'model_metadata_{MODEL_VERSION}.json')
    
    logger.info(f"Loading model from: {model_path}")
    model = joblib.load(model_path)
    
    logger.info(f"Loading scaler from: {scaler_path}")
    scaler = joblib.load(scaler_path)
    
    # Load metadata if available
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        logger.info("Model metadata loaded successfully")
    else:
        metadata = {
            "model_name": "Logistic Regression",
            "model_version": MODEL_VERSION,
            "training_date": "2025-10-23"
        }
        logger.warning("Metadata file not found, using default metadata")
    
    logger.info("✅ Model and scaler loaded successfully!")
    
except Exception as e:
    logger.error(f"❌ Error loading model: {e}")
    model = None
    scaler = None
    metadata = {}


def preprocess_input(data):
    """
    Preprocess input data to match training format
    
    Args:
        data: dict with feature values
        
    Returns:
        numpy array ready for prediction
    """
    # Map backend field names to model field names (handle both formats)
    field_mapping = {
        'pregnancies': 'Pregnancies',
        'glucose': 'Glucose',
        'blood_pressure': 'BloodPressure',
        'bloodPressure': 'BloodPressure',
        'skin_thickness': 'SkinThickness',
        'skinThickness': 'SkinThickness',
        'insulin': 'Insulin',
        'bmi': 'BMI',
        'diabetes_pedigree_function': 'DiabetesPedigreeFunction',
        'diabetesPedigreeFunction': 'DiabetesPedigreeFunction',
        'age': 'Age'
    }
    
    # Create standardized data dict
    standardized_data = {}
    for key, value in data.items():
        standard_key = field_mapping.get(key, key)
        standardized_data[standard_key] = value
    
    # Create DataFrame with correct feature order
    df = pd.DataFrame([standardized_data])
    
    # Ensure all required features are present
    missing_features = [f for f in FEATURE_NAMES if f not in df.columns]
    if missing_features:
        raise ValueError(f"Missing required features: {missing_features}")
    
    # Select features in correct order
    df = df[FEATURE_NAMES]
    
    # Convert to float
    df = df.astype(float)
    
    # Scale the features
    scaled_data = scaler.transform(df)
    
    return scaled_data


def determine_risk_level(probability):
    """Determine risk level based on diabetes probability"""
    if probability < 0.3:
        return 'Low'
    elif probability < 0.6:
        return 'Medium'
    else:
        return 'High'


@app.route('/', methods=['GET'])
def home():
    """Home endpoint - API information"""
    return jsonify({
        'name': 'Diabetes Prediction ML API',
        'version': '1.0.0',
        'status': 'running',
        'model': metadata.get('model_name', 'Unknown'),
        'model_version': MODEL_VERSION,
        'endpoints': {
            'predict': '/predict [POST]',
            'health': '/health [GET]',
            'info': '/info [GET]'
        },
        'description': 'Machine Learning API for diabetes risk prediction'
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    is_healthy = model is not None and scaler is not None
    
    return jsonify({
        'status': 'healthy' if is_healthy else 'unhealthy',
        'service': 'Diabetes Prediction ML Service',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }), 200 if is_healthy else 503


@app.route('/info', methods=['GET'])
def get_info():
    """Get detailed model information"""
    return jsonify({
        'model_info': {
            'name': metadata.get('model_name', 'Unknown'),
            'type': metadata.get('model_type', 'Unknown'),
            'version': MODEL_VERSION,
            'training_date': metadata.get('training_date', 'Unknown')
        },
        'performance_metrics': metadata.get('performance_metrics', {}),
        'features': FEATURE_NAMES,
        'input_format': {
            'pregnancies': 'Number of pregnancies',
            'glucose': 'Plasma glucose concentration',
            'blood_pressure': 'Diastolic blood pressure (mm Hg)',
            'skin_thickness': 'Triceps skin fold thickness (mm)',
            'insulin': '2-Hour serum insulin (mu U/ml)',
            'bmi': 'Body mass index (weight in kg/(height in m)^2)',
            'diabetes_pedigree_function': 'Diabetes pedigree function',
            'age': 'Age (years)'
        }
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict diabetes risk
    
    Expected JSON body:
    {
        "pregnancies": 2,
        "glucose": 120,
        "blood_pressure": 70,
        "skin_thickness": 20,
        "insulin": 100,
        "bmi": 25.5,
        "diabetes_pedigree_function": 0.5,
        "age": 30
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "prediction": 0,
            "probability": 0.25,
            "probability_no_diabetes": 0.75,
            "probability_diabetes": 0.25,
            "risk_level": "Low",
            "model_used": "Logistic Regression",
            "model_version": "20251023_210956"
        }
    }
    """
    try:
        # Check if model is loaded
        if model is None or scaler is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded properly'
            }), 503
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No input data provided'
            }), 400
        
        logger.info(f"Received prediction request: {data}")
        
        # Preprocess input
        try:
            processed_data = preprocess_input(data)
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
        
        # Make prediction
        prediction = int(model.predict(processed_data)[0])
        probabilities = model.predict_proba(processed_data)[0]
        
        prob_no_diabetes = float(probabilities[0])
        prob_diabetes = float(probabilities[1])
        
        # Determine risk level
        risk_level = determine_risk_level(prob_diabetes)
        
        # Prepare response
        result = {
            'success': True,
            'data': {
                'prediction': prediction,
                'probability': prob_diabetes,
                'probability_no_diabetes': prob_no_diabetes,
                'probability_diabetes': prob_diabetes,
                'probabilities': {
                    'no_diabetes': prob_no_diabetes,
                    'diabetes': prob_diabetes
                },
                'risk_level': risk_level,
                'model_used': metadata.get('model_name', 'Logistic Regression'),
                'model_version': MODEL_VERSION,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        logger.info(f"Prediction result: {prediction} (probability: {prob_diabetes:.3f})")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'available_endpoints': {
            'home': '/',
            'health': '/health',
            'info': '/info',
            'predict': '/predict'
        }
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5001))
    
    print(f"""
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🤖 DIABETES PREDICTION ML SERVICE 🤖                    ║
║                                                            ║
║   Status: ✅ Running                                       ║
║   Port: {port}                                           ║
║   Model: {metadata.get('model_name', 'Unknown'):<44} ║
║   Version: {MODEL_VERSION}                             ║
║                                                            ║
║   Endpoints:                                               ║
║   • GET  /           - API Info                            ║
║   • GET  /health     - Health Check                        ║
║   • GET  /info       - Model Info                          ║
║   • POST /predict    - Make Prediction                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    # Run the app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('DEBUG', 'False').lower() == 'true'
    )
