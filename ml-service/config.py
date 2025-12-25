"""
Configuration Module for ML Service
Centralizes all configuration settings and environment variables
"""

import os
from typing import List


class Config:
    """Application configuration class"""
    
    # Flask Configuration
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    TESTING = os.getenv('FLASK_TESTING', 'False').lower() == 'true'
    
    # Server Configuration
    HOST = os.getenv('ML_HOST', '0.0.0.0')
    PORT = int(os.getenv('ML_PORT', 5001))
    
    # CORS Configuration
    @classmethod
    def get_allowed_origins(cls) -> List[str]:
        """Get and validate allowed origins from environment"""
        origins_str = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:8017')
        origins = [origin.strip() for origin in origins_str.split(',') if origin.strip()]
        
        # Add wildcard for development mode
        if cls.DEBUG and '*' not in origins:
            origins.append('*')  # Allow all in development
        
        return origins
    
    ALLOWED_ORIGINS = property(lambda self: Config.get_allowed_origins())
    ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    ALLOWED_HEADERS = [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ]
    EXPOSED_HEADERS = ['Content-Length', 'X-Request-Id']
    SUPPORTS_CREDENTIALS = True
    MAX_AGE = 3600  # 1 hour for preflight cache
    
    # Model Configuration
    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
    MODEL_VERSION = os.getenv('MODEL_VERSION', '20251023_210956')
    MODEL_TYPE = 'logistic_regression'
    
    # Feature Configuration
    FEATURE_NAMES = [
        'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
        'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
    ]
    
    # Validation Ranges (based on medical standards)
    FEATURE_RANGES = {
        'Pregnancies': (0, 20),
        'Glucose': (0, 300),
        'BloodPressure': (0, 200),
        'SkinThickness': (0, 100),
        'Insulin': (0, 900),
        'BMI': (0, 70),
        'DiabetesPedigreeFunction': (0, 3),
        'Age': (18, 120)
    }
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    @classmethod
    def get_model_path(cls) -> str:
        """Get full path to model file"""
        return os.path.join(
            cls.MODEL_DIR, 
            f'diabetes_model_{cls.MODEL_TYPE}_{cls.MODEL_VERSION}.joblib'
        )
    
    @classmethod
    def get_scaler_path(cls) -> str:
        """Get full path to scaler file"""
        return os.path.join(cls.MODEL_DIR, f'scaler_{cls.MODEL_VERSION}.joblib')
    
    @classmethod
    def get_metadata_path(cls) -> str:
        """Get full path to metadata file"""
        return os.path.join(cls.MODEL_DIR, f'model_metadata_{cls.MODEL_VERSION}.json')
    
    @classmethod
    def validate_feature_value(cls, feature_name: str, value: float) -> bool:
        """Validate if feature value is within acceptable range"""
        if feature_name not in cls.FEATURE_RANGES:
            return True  # Unknown feature, skip validation
        
        min_val, max_val = cls.FEATURE_RANGES[feature_name]
        return min_val <= value <= max_val
    
    @classmethod
    def validate_all_features(cls, features: dict) -> tuple[bool, List[str]]:
        """
        Validate all feature values
        Returns: (is_valid, list_of_errors)
        """
        errors = []
        
        # Check missing features
        missing = set(cls.FEATURE_NAMES) - set(features.keys())
        if missing:
            errors.append(f"Missing features: {', '.join(missing)}")
        
        # Check extra features
        extra = set(features.keys()) - set(cls.FEATURE_NAMES)
        if extra:
            errors.append(f"Unknown features: {', '.join(extra)}")
        
        # Validate ranges
        for feature_name, value in features.items():
            if feature_name in cls.FEATURE_NAMES:
                if not cls.validate_feature_value(feature_name, value):
                    min_val, max_val = cls.FEATURE_RANGES[feature_name]
                    errors.append(
                        f"{feature_name} value {value} is out of range [{min_val}, {max_val}]"
                    )
        
        return len(errors) == 0, errors
