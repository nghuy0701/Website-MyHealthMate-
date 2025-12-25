"""
Utility Functions for ML Service
Provides helper functions for validation, formatting, and common operations
"""

import numpy as np
from typing import Dict, Any, Union
from flask import jsonify, Response
import logging

logger = logging.getLogger(__name__)


def create_response(
    success: bool, 
    data: Any = None, 
    message: str = None, 
    status_code: int = 200
) -> tuple[Response, int]:
    """
    Create standardized JSON response
    
    Args:
        success: Whether operation was successful
        data: Response data
        message: Optional message
        status_code: HTTP status code
        
    Returns:
        Tuple of (Response, status_code)
    """
    response = {
        'success': success,
        'timestamp': np.datetime64('now').astype(str)
    }
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    return jsonify(response), status_code


def create_error_response(
    error: str, 
    details: Any = None, 
    status_code: int = 400
) -> tuple[Response, int]:
    """
    Create standardized error response
    
    Args:
        error: Error message
        details: Optional error details
        status_code: HTTP status code
        
    Returns:
        Tuple of (Response, status_code)
    """
    response = {
        'success': False,
        'error': error,
        'timestamp': np.datetime64('now').astype(str)
    }
    
    if details:
        response['details'] = details
    
    return jsonify(response), status_code


def validate_request_data(data: Dict[str, Any], required_fields: list) -> tuple[bool, str]:
    """
    Validate request data contains required fields
    
    Args:
        data: Request data dictionary
        required_fields: List of required field names
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not data:
        return False, "No data provided in request"
    
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, ""


def safe_float_conversion(value: Any, field_name: str = "value") -> Union[float, None]:
    """
    Safely convert value to float
    
    Args:
        value: Value to convert
        field_name: Name of field for error messages
        
    Returns:
        Float value or None if conversion fails
    """
    try:
        return float(value)
    except (ValueError, TypeError) as e:
        logger.warning(f"Failed to convert {field_name} to float: {value}")
        return None


def format_prediction_result(
    prediction: int, 
    probability: float, 
    features: Dict[str, float]
) -> Dict[str, Any]:
    """
    Format prediction result into standardized structure
    
    Args:
        prediction: Binary prediction (0 or 1)
        probability: Prediction probability
        features: Input features dictionary
        
    Returns:
        Formatted prediction result
    """
    return {
        'prediction': int(prediction),
        'prediction_label': 'Diabetic' if prediction == 1 else 'Non-Diabetic',
        'confidence': round(float(probability) * 100, 2),
        'risk_level': _calculate_risk_level(probability),
        'input_features': features
    }


def _calculate_risk_level(probability: float) -> str:
    """
    Calculate risk level based on prediction probability
    
    Args:
        probability: Prediction probability (0-1)
        
    Returns:
        Risk level string
    """
    if probability < 0.3:
        return 'Low'
    elif probability < 0.6:
        return 'Moderate'
    elif probability < 0.8:
        return 'High'
    else:
        return 'Very High'


def log_prediction_request(features: Dict[str, float], ip_address: str = None):
    """
    Log prediction request for monitoring
    
    Args:
        features: Input features
        ip_address: Client IP address
    """
    logger.info(
        f"Prediction request from {ip_address or 'unknown'} - "
        f"Glucose: {features.get('Glucose')}, BMI: {features.get('BMI')}, Age: {features.get('Age')}"
    )
