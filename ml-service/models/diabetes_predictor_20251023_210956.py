
import joblib
import numpy as np
import pandas as pd
from typing import Union, List, Dict

class DiabetesPredictor:
    """
    Production-ready diabetes prediction model.

    Features expected (in order):
    ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
    """

    def __init__(self, model_path: str, scaler_path: str):
        """Initialize the predictor with model and scaler paths."""
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_names = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

    def predict(self, data: Union[Dict, List[Dict], pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Predict diabetes probability.

        Args:
            data: Input features as dict, list of dicts, DataFrame, or numpy array

        Returns:
            numpy array of predictions (0 or 1)
        """
        processed_data = self._preprocess_input(data)
        return self.model.predict(processed_data)

    def predict_proba(self, data: Union[Dict, List[Dict], pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Predict diabetes probabilities.

        Args:
            data: Input features as dict, list of dicts, DataFrame, or numpy array

        Returns:
            numpy array of probabilities [prob_no_diabetes, prob_diabetes]
        """
        processed_data = self._preprocess_input(data)
        if hasattr(self.model, 'predict_proba'):
            return self.model.predict_proba(processed_data)
        else:
            # Fallback for models without predict_proba
            pred = self.model.predict(processed_data)
            return np.column_stack([1-pred, pred])

    def _preprocess_input(self, data: Union[Dict, List[Dict], pd.DataFrame, np.ndarray]) -> np.ndarray:
        """Preprocess input data to match training format."""
        if isinstance(data, dict):
            data = [data]

        if isinstance(data, list):
            df = pd.DataFrame(data)
        elif isinstance(data, pd.DataFrame):
            df = data.copy()
        elif isinstance(data, np.ndarray):
            df = pd.DataFrame(data, columns=self.feature_names)
        else:
            raise ValueError("Unsupported data type")

        # Ensure all required features are present
        for feature in self.feature_names:
            if feature not in df.columns:
                raise ValueError(f"Missing required feature: {feature}")

        # Select and order features correctly
        df = df[self.feature_names]

        # Scale the features
        scaled_data = self.scaler.transform(df)

        return scaled_data

# Example usage:
# predictor = DiabetesPredictor('path/to/model.joblib', 'path/to/scaler.joblib')
# result = predictor.predict({"Pregnancies": 1, "Glucose": 120, "BloodPressure": 70, ...})
# probabilities = predictor.predict_proba({"Pregnancies": 1, "Glucose": 120, ...})
