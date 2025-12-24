"""
ML Models Configuration
Cấu hình tập trung cho tất cả các ML models trong dự án
"""

# Model availability flags (sẽ được set runtime)
XGBOOST_AVAILABLE = False
LIGHTGBM_AVAILABLE = False
CATBOOST_AVAILABLE = False
IMBLEARN_AVAILABLE = False
OPTUNA_AVAILABLE = False

# Model categories và descriptions
MODEL_CATEGORIES = {
    'linear': {
        'description': 'Linear classification models',
        'models': [
            'Logistic_Regression',
            'Ridge_Classifier',
            'Linear_Discriminant',
            'Quadratic_Discriminant'
        ]
    },
    'tree_based': {
        'description': 'Decision tree based models',
        'models': [
            'Decision_Tree',
            'Random_Forest',
            'Extra_Trees'
        ]
    },
    'boosting': {
        'description': 'Gradient boosting models',
        'models': [
            'Gradient_Boosting',
            'AdaBoost',
            'XGBoost',      # Optional
            'LightGBM',     # Optional
            'CatBoost'      # Optional
        ]
    },
    'instance_based': {
        'description': 'Instance-based learning',
        'models': [
            'K_Nearest_Neighbors'
        ]
    },
    'kernel': {
        'description': 'Kernel methods',
        'models': [
            'Support_Vector_Machine'
        ]
    },
    'probabilistic': {
        'description': 'Probabilistic models',
        'models': [
            'Naive_Bayes'
        ]
    },
    'neural': {
        'description': 'Neural network models',
        'models': [
            'Neural_Network'
        ]
    }
}

# Default hyperparameters cho từng model
DEFAULT_HYPERPARAMETERS = {
    'Logistic_Regression': {
        'random_state': 42,
        'max_iter': 1000,
        'solver': 'lbfgs'
    },
    'Ridge_Classifier': {
        'random_state': 42,
        'alpha': 1.0
    },
    'Linear_Discriminant': {
        'solver': 'svd'
    },
    'Quadratic_Discriminant': {
        'reg_param': 0.0
    },
    'Decision_Tree': {
        'random_state': 42,
        'max_depth': None,
        'min_samples_split': 2
    },
    'Random_Forest': {
        'random_state': 42,
        'n_estimators': 100,
        'n_jobs': -1,
        'max_depth': None
    },
    'Extra_Trees': {
        'random_state': 42,
        'n_estimators': 100,
        'n_jobs': -1,
        'max_depth': None
    },
    'Gradient_Boosting': {
        'random_state': 42,
        'n_estimators': 100,
        'learning_rate': 0.1
    },
    'AdaBoost': {
        'random_state': 42,
        'n_estimators': 50,
        'learning_rate': 1.0
    },
    'XGBoost': {
        'random_state': 42,
        'n_estimators': 100,
        'eval_metric': 'logloss',
        'verbosity': 0,
        'use_label_encoder': False
    },
    'LightGBM': {
        'random_state': 42,
        'n_estimators': 100,
        'verbosity': -1
    },
    'CatBoost': {
        'random_state': 42,
        'iterations': 100,
        'verbose': False
    },
    'K_Nearest_Neighbors': {
        'n_neighbors': 5,
        'weights': 'uniform',
        'metric': 'minkowski'
    },
    'Support_Vector_Machine': {
        'random_state': 42,
        'kernel': 'rbf',
        'probability': True,
        'C': 1.0
    },
    'Naive_Bayes': {
        'var_smoothing': 1e-9
    },
    'Neural_Network': {
        'random_state': 42,
        'hidden_layer_sizes': (100,),
        'max_iter': 500,
        'early_stopping': True
    }
}

# Hyperparameter search spaces cho optimization
HYPERPARAMETER_SEARCH_SPACES = {
    'Logistic_Regression': {
        'C': [0.01, 0.1, 1, 10, 100],
        'penalty': ['l1', 'l2'],
        'solver': ['liblinear', 'saga']
    },
    'Random_Forest': {
        'n_estimators': [100, 200, 300],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'max_features': ['sqrt', 'log2']
    },
    'Gradient_Boosting': {
        'n_estimators': [100, 200, 300],
        'learning_rate': [0.01, 0.1, 0.2],
        'max_depth': [3, 5, 7],
        'subsample': [0.8, 0.9, 1.0]
    },
    'Support_Vector_Machine': {
        'C': [0.1, 1, 10, 100],
        'gamma': ['scale', 'auto', 0.001, 0.01, 0.1, 1],
        'kernel': ['rbf', 'linear', 'poly']
    },
    'Neural_Network': {
        'hidden_layer_sizes': [(50,), (100,), (100, 50), (200,), (100, 100)],
        'alpha': [0.0001, 0.001, 0.01],
        'learning_rate_init': [0.001, 0.01, 0.1]
    },
    'XGBoost': {
        'n_estimators': [100, 200, 300],
        'learning_rate': [0.01, 0.1, 0.2],
        'max_depth': [3, 5, 7],
        'subsample': [0.8, 0.9, 1.0],
        'colsample_bytree': [0.8, 0.9, 1.0]
    },
    'LightGBM': {
        'n_estimators': [100, 200, 300],
        'learning_rate': [0.01, 0.1, 0.2],
        'max_depth': [3, 5, 7],
        'subsample': [0.8, 0.9, 1.0],
        'colsample_bytree': [0.8, 0.9, 1.0]
    },
    'CatBoost': {
        'iterations': [100, 200, 300],
        'learning_rate': [0.01, 0.1, 0.2],
        'depth': [4, 6, 8],
        'l2_leaf_reg': [1, 3, 5]
    }
}

# Cross-validation configuration
CV_CONFIG = {
    'n_splits': 5,
    'shuffle': True,
    'random_state': 42
}

# Scoring metrics để evaluate models
SCORING_METRICS = [
    'accuracy',
    'precision',
    'recall',
    'f1',
    'roc_auc'
]

# Primary metric cho model selection
PRIMARY_METRIC = 'roc_auc'

# Feature names cho Pima Indians Diabetes Dataset
DIABETES_FEATURES = [
    'Pregnancies',
    'Glucose',
    'BloodPressure',
    'SkinThickness',
    'Insulin',
    'BMI',
    'DiabetesPedigreeFunction',
    'Age'
]

# Features có thể có giá trị 0 (missing values)
ZERO_REPLACEABLE_FEATURES = [
    'Glucose',
    'BloodPressure',
    'SkinThickness',
    'Insulin',
    'BMI'
]

# Scaling methods available
SCALING_METHODS = {
    'standard': 'StandardScaler - Standardize features by removing mean and scaling to unit variance',
    'robust': 'RobustScaler - Scale features using statistics robust to outliers',
    'minmax': 'MinMaxScaler - Scale features to a given range (default 0-1)'
}

# Class balancing methods
BALANCING_METHODS = {
    'smote': 'SMOTE - Synthetic Minority Over-sampling Technique',
    'adasyn': 'ADASYN - Adaptive Synthetic Sampling',
    'undersample': 'Random Under-sampling',
    'smoteenn': 'SMOTEENN - SMOTE + Edited Nearest Neighbors'
}

# Model training configuration
TRAINING_CONFIG = {
    'test_size': 0.2,
    'random_state': 42,
    'stratify': True,
    'handle_zeros': True,
    'scaling_method': 'standard',
    'balance_method': None,  # None or one of BALANCING_METHODS
    'cv_folds': 5
}

# Hyperparameter optimization configuration
OPTIMIZATION_CONFIG = {
    'method': 'random',  # 'grid' or 'random'
    'n_iter': 100,       # For RandomizedSearchCV
    'cv_folds': 5,
    'n_jobs': -1,
    'verbose': 1,
    'scoring': PRIMARY_METRIC
}

# Model export configuration
EXPORT_CONFIG = {
    'models_dir': '../models',
    'include_timestamp': True,
    'save_metadata': True,
    'save_scaler': True,
    'save_production_code': True
}

# Visualization configuration
VIZ_CONFIG = {
    'figure_size': (12, 8),
    'dpi': 300,
    'style': 'seaborn-v0_8',
    'color_palette': 'husl',
    'save_plots': True,
    'plots_dir': '../plots'
}

def get_model_info(model_name):
    """Lấy thông tin về một model cụ thể"""
    for category, info in MODEL_CATEGORIES.items():
        if model_name in info['models']:
            return {
                'name': model_name,
                'category': category,
                'description': info['description'],
                'default_params': DEFAULT_HYPERPARAMETERS.get(model_name, {}),
                'search_space': HYPERPARAMETER_SEARCH_SPACES.get(model_name, {})
            }
    return None

def get_available_models():
    """Lấy danh sách các models có thể sử dụng (dựa trên availability)"""
    available = []
    
    for category, info in MODEL_CATEGORIES.items():
        for model_name in info['models']:
            # Check if advanced models are available
            if model_name == 'XGBoost' and not XGBOOST_AVAILABLE:
                continue
            if model_name == 'LightGBM' and not LIGHTGBM_AVAILABLE:
                continue
            if model_name == 'CatBoost' and not CATBOOST_AVAILABLE:
                continue
            
            available.append(model_name)
    
    return available

def print_config_summary():
    """In ra tóm tắt configuration"""
    print("="*60)
    print("🔧 ML MODELS CONFIGURATION SUMMARY")
    print("="*60)
    
    print(f"\n📊 Model Categories: {len(MODEL_CATEGORIES)}")
    for category, info in MODEL_CATEGORIES.items():
        print(f"  • {category}: {len(info['models'])} models")
    
    print(f"\n🎯 Primary Metric: {PRIMARY_METRIC}")
    print(f"📈 Scoring Metrics: {', '.join(SCORING_METRICS)}")
    
    print(f"\n⚖️ Scaling Methods: {len(SCALING_METHODS)}")
    for method in SCALING_METHODS.keys():
        print(f"  • {method}")
    
    print(f"\n🔄 Balancing Methods: {len(BALANCING_METHODS)}")
    for method in BALANCING_METHODS.keys():
        print(f"  • {method}")
    
    print(f"\n🎲 Default Training Config:")
    for key, value in TRAINING_CONFIG.items():
        print(f"  • {key}: {value}")
    
    print("="*60)

if __name__ == '__main__':
    print_config_summary()
    print(f"\n📋 Available Models:")
    for i, model in enumerate(get_available_models(), 1):
        print(f"{i:2d}. {model}")
