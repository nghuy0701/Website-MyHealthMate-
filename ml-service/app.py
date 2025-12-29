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

# Import custom modules
from config import Config
from utils import (
    create_response, create_error_response, 
    validate_request_data, format_prediction_result,
    log_prediction_request
)

# Setup logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format=Config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Configure CORS with advanced settings
CORS(app, resources={
    r"/*": {
        "origins": Config.get_allowed_origins(),
        "methods": Config.ALLOWED_METHODS,
        "allow_headers": Config.ALLOWED_HEADERS,
        "expose_headers": Config.EXPOSED_HEADERS,
        "supports_credentials": Config.SUPPORTS_CREDENTIALS,
        "max_age": Config.MAX_AGE
    }
})
allowed_origins = Config.get_allowed_origins()
logger.info(f"✅ CORS configured - Origins: {allowed_origins[:3]}{'...' if len(allowed_origins) > 3 else ''}")


# ==================== Model Loading ====================

def load_ml_artifacts():
    """Load ML model, scaler, and metadata"""
    try:
        model_path = Config.get_model_path()
        scaler_path = Config.get_scaler_path()
        metadata_path = Config.get_metadata_path()
        
        logger.info(f"Loading model from: {model_path}")
        model = joblib.load(model_path)
        
        logger.info(f"Loading scaler from: {scaler_path}")
        scaler = joblib.load(scaler_path)
        
        # Load metadata if available
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            logger.info("✅ Model metadata loaded")
        else:
            metadata = {
                "model_name": "Logistic Regression",
                "model_version": Config.MODEL_VERSION,
                "training_date": "2025-10-23"
            }
            logger.warning("⚠️  Metadata file not found, using defaults")
        
        logger.info("✅ ML artifacts loaded successfully!")
        return model, scaler, metadata
        
    except Exception as e:
        logger.error(f"❌ Error loading ML artifacts: {e}")
        return None, None, {}


# Initialize ML components
model, scaler, metadata = load_ml_artifacts()


# ==================== Helper Functions ====================

def preprocess_input(data):
    """
    Preprocess input data to match training format
    
    Args:
        data: dict with feature values
        
    Returns:
        numpy array ready for prediction
    """
    # Map backend field names to model field names
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
    
    # Standardize field names
    standardized_data = {}
    for key, value in data.items():
        standard_key = field_mapping.get(key, key)
        standardized_data[standard_key] = value
    
    # Validate using Config
    is_valid, errors = Config.validate_all_features(standardized_data)
    if not is_valid:
        raise ValueError(f"Validation failed: {'; '.join(errors)}")
    
    # Create DataFrame with correct feature order
    df = pd.DataFrame([standardized_data])[Config.FEATURE_NAMES]
    
    # Convert to float and scale
    df = df.astype(float)
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


# ==================== API Routes ====================

@app.route('/', methods=['GET'])
def home():
    """Home endpoint - API information"""
    return create_response(
        success=True,
        data={
            'name': 'Diabetes Prediction ML API',
            'version': '1.0.0',
            'status': 'running',
            'model': metadata.get('model_name', 'Unknown'),
            'model_version': Config.MODEL_VERSION,
            'endpoints': {
                'predict': '/predict [POST]',
                'health': '/health [GET]',
                'info': '/info [GET]'
            },
            'description': 'ML API for diabetes risk prediction'
        }
    )


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    is_healthy = model is not None and scaler is not None
    
    return create_response(
        success=is_healthy,
        data={
            'status': 'healthy' if is_healthy else 'unhealthy',
            'service': 'Diabetes Prediction ML Service',
            'model_loaded': model is not None,
            'scaler_loaded': scaler is not None,
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        },
        status_code=200 if is_healthy else 503
    )


@app.route('/info', methods=['GET'])
def get_info():
    """Get detailed model information"""
    return create_response(
        success=True,
        data={
            'model_info': {
                'name': metadata.get('model_name', 'Unknown'),
                'type': metadata.get('model_type', 'Unknown'),
                'version': Config.MODEL_VERSION,
                'training_date': metadata.get('training_date', 'Unknown')
            },
            'performance_metrics': metadata.get('performance_metrics', {}),
            'features': Config.FEATURE_NAMES,
            'feature_ranges': Config.FEATURE_RANGES,
            'input_format': {
                'pregnancies': 'Number of pregnancies (0-20)',
                'glucose': 'Plasma glucose concentration (0-300 mg/dL)',
                'blood_pressure': 'Diastolic blood pressure (0-200 mm Hg)',
                'skin_thickness': 'Triceps skin fold thickness (0-100 mm)',
                'insulin': '2-Hour serum insulin (0-900 mu U/ml)',
                'bmi': 'Body mass index (0-70 kg/m²)',
                'diabetes_pedigree_function': 'Diabetes pedigree function (0-3)',
                'age': 'Age (18-120 years)'
            }
        }
    )


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
    """
    try:
        # Check if model is loaded
        if model is None or scaler is None:
            return create_error_response(
                error='Model not loaded properly',
                status_code=503
            )
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return create_error_response(error="No data provided in request", status_code=400)
        
        # Map frontend field names (camelCase/snake_case) to model field names (PascalCase)
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
        
        # Convert to PascalCase (model format)
        normalized_data = {}
        for key, value in data.items():
            normalized_key = field_mapping.get(key, key)
            normalized_data[normalized_key] = value
        
        # Validate normalized data
        is_valid, error_msg = validate_request_data(normalized_data, Config.FEATURE_NAMES)
        
        if not is_valid:
            return create_error_response(error=error_msg, status_code=400)
        
        # Use normalized data for preprocessing
        data = normalized_data
        
        # Log request
        log_prediction_request(data, request.remote_addr)
        
        # Preprocess input
        try:
            processed_data = preprocess_input(data)
        except ValueError as e:
            return create_error_response(error=str(e), status_code=400)
        
        # Make prediction
        prediction = int(model.predict(processed_data)[0])
        probabilities = model.predict_proba(processed_data)[0]
        
        prob_no_diabetes = float(probabilities[0])
        prob_diabetes = float(probabilities[1])
        
        # Determine risk level
        risk_level = determine_risk_level(prob_diabetes)
        
        # Prepare response
        result = {
            'prediction': prediction,
            'prediction_label': 'Diabetic' if prediction == 1 else 'Non-Diabetic',
            'probability': prob_diabetes,
            'probability_no_diabetes': prob_no_diabetes,
            'probability_diabetes': prob_diabetes,
            'probabilities': {
                'no_diabetes': prob_no_diabetes,
                'diabetes': prob_diabetes
            },
            'confidence': round(max(prob_no_diabetes, prob_diabetes) * 100, 2),
            'risk_level': risk_level,
            'model_used': metadata.get('model_name', 'Logistic Regression'),
            'model_version': Config.MODEL_VERSION,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"✅ Prediction: {prediction} | Probability: {prob_diabetes:.3f} | Risk: {risk_level}")
        
        return create_response(success=True, data=result)
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {str(e)}", exc_info=True)
        return create_error_response(
            error='Internal server error',
            details=str(e) if Config.DEBUG else None,
            status_code=500
        )


# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return create_error_response(
        error='Endpoint not found',
        details={
            'available_endpoints': {
                'home': '/',
                'health': '/health',
                'info': '/info',
                'predict': '/predict'
            }
        },
        status_code=404
    )


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return create_error_response(
        error='Internal server error',
        status_code=500
    )


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return create_error_response(
        error='Method not allowed',
        details={'allowed_methods': ['GET', 'POST', 'OPTIONS']},
        status_code=405
    )


# ==================== Application Entry Point ====================

if __name__ == '__main__':
    allowed_origins = Config.get_allowed_origins()
    origins_display = ', '.join(allowed_origins)
    
    print(f"""
                                                              
         🤖  DIABETES PREDICTION ML SERVICE  🤖              
                                                              
Status          : ✅ Running                                
Host            : {Config.HOST:<44}                           
Port            : {str(Config.PORT):<44}                     
Debug           : {str(Config.DEBUG):<44}                   
                                                               
Model           : {metadata.get('model_name', 'Unknown'):<44} 
Version         : {Config.MODEL_VERSION:<44}                  
Trained         : {metadata.get('training_date', 'N/A'):<44}
                                                               
📡 Endpoints:                                                 
GET    /              →  API Information                  
GET    /health        →  Health Check                     
GET    /info          →  Model Details                    
POST   /predict       →  Make Prediction                  
                                                                
🔒 CORS Origins : {origins_display:<44}
                                                                


🚀 Server    : http://{Config.HOST}:{Config.PORT}
    """)
    
    # Run the Flask app
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
