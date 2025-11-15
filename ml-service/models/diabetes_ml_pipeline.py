"""
Diabetes Prediction ML Pipeline
Huấn luyện và so sánh các mô hình ML để dự đoán bệnh tiểu đường
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
from datetime import datetime
from pathlib import Path

# Scikit-learn imports
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, classification_report, roc_curve
)

# Advanced ML libraries
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier

# Imbalanced learning
from imblearn.over_sampling import SMOTE, ADASYN
from imblearn.under_sampling import RandomUnderSampler
from imblearn.combine import SMOTEENN

# Hyperparameter optimization
from sklearn.model_selection import RandomizedSearchCV
import optuna

warnings.filterwarnings('ignore')
plt.style.use('seaborn-v0_8')

class DiabetesPredictionPipeline:
    """
    Comprehensive ML pipeline for diabetes prediction
    """
    
    def __init__(self, data_path=None):
        self.data_path = data_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.scalers = {}
        self.models = {}
        self.results = {}
        self.best_model = None
        self.best_model_name = None
        self.feature_names = None
        
    def load_data(self, filepath=None):
        """Load and inspect diabetes dataset"""
        if filepath:
            self.data_path = filepath
            
        if self.data_path is None:
            # Create sample data if no dataset provided
            print("⚠️  Không tìm thấy dataset. Tạo dữ liệu mẫu...")
            self.create_sample_data()
        else:
            print(f"📂 Loading data từ {self.data_path}")
            self.df = pd.read_csv(self.data_path)
            
        print(f"📊 Dataset shape: {self.df.shape}")
        print(f"📋 Features: {list(self.df.columns)}")
        print(f"🎯 Target distribution:")
        print(self.df['Outcome'].value_counts())
        return self
    
    def create_sample_data(self):
        """Tạo dữ liệu mẫu theo chuẩn Pima Indians Diabetes"""
        np.random.seed(42)
        n_samples = 768
        
        # Tạo dữ liệu giống dataset Pima Indians
        data = {
            'Pregnancies': np.random.poisson(3, n_samples),
            'Glucose': np.random.normal(120, 30, n_samples).clip(0, 200),
            'BloodPressure': np.random.normal(70, 15, n_samples).clip(0, 122),
            'SkinThickness': np.random.normal(20, 10, n_samples).clip(0, 99),
            'Insulin': np.random.normal(80, 100, n_samples).clip(0, 846),
            'BMI': np.random.normal(32, 6, n_samples).clip(0, 67),
            'DiabetesPedigreeFunction': np.random.gamma(0.5, 0.5, n_samples).clip(0, 2.42),
            'Age': np.random.gamma(2, 12, n_samples).clip(21, 81)
        }
        
        # Tạo target based on features (simplified logic)
        glucose_risk = (data['Glucose'] > 140).astype(int)
        bmi_risk = (data['BMI'] > 35).astype(int)
        age_risk = (data['Age'] > 45).astype(int)
        
        # Combine risks with some randomness
        risk_score = glucose_risk + bmi_risk + age_risk + np.random.binomial(1, 0.2, n_samples)
        data['Outcome'] = (risk_score >= 2).astype(int)
        
        self.df = pd.DataFrame(data)
        print("✅ Tạo dữ liệu mẫu thành công!")
    
    def explore_data(self):
        """Phân tích dữ liệu khám phá (EDA)"""
        print("\n" + "="*50)
        print("🔍 EXPLORATORY DATA ANALYSIS")
        print("="*50)
        
        # Basic info
        print("\n📈 Dataset Info:")
        print(self.df.info())
        
        print("\n📊 Statistical Summary:")
        print(self.df.describe())
        
        # Check missing values
        print("\n❓ Missing Values:")
        missing = self.df.isnull().sum()
        if missing.sum() == 0:
            print("✅ Không có missing values")
        else:
            print(missing[missing > 0])
            
        # Check for zeros (which might be missing values in medical data)
        print("\n🔍 Zero values (có thể là missing data):")
        zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
        for col in zero_cols:
            if col in self.df.columns:
                zero_count = (self.df[col] == 0).sum()
                if zero_count > 0:
                    print(f"{col}: {zero_count} zeros ({zero_count/len(self.df)*100:.1f}%)")
        
        # Correlation matrix
        plt.figure(figsize=(12, 10))
        correlation_matrix = self.df.corr()
        sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, 
                   square=True, linewidths=0.5)
        plt.title('🔗 Correlation Matrix của Features')
        plt.tight_layout()
        plt.savefig('ML/data/correlation_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Distribution plots
        fig, axes = plt.subplots(3, 3, figsize=(15, 12))
        fig.suptitle('📊 Distribution của Features theo Diabetes Outcome', fontsize=16)
        
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        for i, col in enumerate(numeric_cols):
            if i < 9:  # Only plot first 9 features
                ax = axes[i//3, i%3]
                
                # Plot distributions for both classes
                self.df[self.df['Outcome']==0][col].hist(alpha=0.7, bins=30, 
                                                       label='No Diabetes', ax=ax, color='blue')
                self.df[self.df['Outcome']==1][col].hist(alpha=0.7, bins=30, 
                                                       label='Diabetes', ax=ax, color='red')
                ax.set_title(f'{col}')
                ax.legend()
                
        plt.tight_layout()
        plt.savefig('ML/data/feature_distributions.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        return self
    
    def preprocess_data(self, handle_zeros=True, scaling_method='standard', 
                       balance_method=None, test_size=0.2):
        """
        Tiền xử lý dữ liệu
        
        Parameters:
        - handle_zeros: Xử lý giá trị 0 (có thể là missing values)
        - scaling_method: 'standard', 'robust', 'minmax'
        - balance_method: None, 'smote', 'adasyn', 'undersample', 'smoteenn'
        - test_size: Tỷ lệ test set
        """
        print("\n" + "="*50)
        print("🔧 DATA PREPROCESSING")
        print("="*50)
        
        # Copy data
        df_processed = self.df.copy()
        
        # Handle zero values (treating them as missing values for certain features)
        if handle_zeros:
            print("🔧 Xử lý giá trị 0 (có thể là missing values)...")
            zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
            
            for col in zero_cols:
                if col in df_processed.columns:
                    # Replace 0 with median for that column
                    median_val = df_processed[df_processed[col] != 0][col].median()
                    zero_count = (df_processed[col] == 0).sum()
                    df_processed[col] = df_processed[col].replace(0, median_val)
                    
                    if zero_count > 0:
                        print(f"  - {col}: Thay thế {zero_count} giá trị 0 bằng median ({median_val:.2f})")
        
        # Separate features and target
        feature_cols = [col for col in df_processed.columns if col != 'Outcome']
        X = df_processed[feature_cols]
        y = df_processed['Outcome']
        
        self.feature_names = feature_cols
        
        print(f"📊 Features: {len(feature_cols)}")
        print(f"🎯 Target classes: {y.value_counts().to_dict()}")
        
        # Split data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"📊 Train set: {self.X_train.shape[0]} samples")
        print(f"📊 Test set: {self.X_test.shape[0]} samples")
        
        # Scaling
        print(f"⚖️  Scaling method: {scaling_method}")
        if scaling_method == 'standard':
            scaler = StandardScaler()
        elif scaling_method == 'robust':
            scaler = RobustScaler()
        elif scaling_method == 'minmax':
            scaler = MinMaxScaler()
        else:
            raise ValueError("Scaling method phải là: 'standard', 'robust', hoặc 'minmax'")
            
        self.X_train_scaled = scaler.fit_transform(self.X_train)
        self.X_test_scaled = scaler.transform(self.X_test)
        self.scalers['main'] = scaler
        
        # Handle class imbalance
        if balance_method:
            print(f"⚖️  Balancing method: {balance_method}")
            original_distribution = np.bincount(self.y_train)
            
            if balance_method == 'smote':
                sampler = SMOTE(random_state=42)
            elif balance_method == 'adasyn':
                sampler = ADASYN(random_state=42)
            elif balance_method == 'undersample':
                sampler = RandomUnderSampler(random_state=42)
            elif balance_method == 'smoteenn':
                sampler = SMOTEENN(random_state=42)
            else:
                raise ValueError("Balance method phải là: 'smote', 'adasyn', 'undersample', 'smoteenn'")
                
            self.X_train_scaled, self.y_train = sampler.fit_resample(self.X_train_scaled, self.y_train)
            new_distribution = np.bincount(self.y_train)
            
            print(f"  - Trước balancing: {original_distribution}")
            print(f"  - Sau balancing: {new_distribution}")
        
        print("✅ Preprocessing hoàn thành!")
        return self
    
    def define_models(self):
        """Định nghĩa các mô hình ML để so sánh"""
        print("\n" + "="*50)
        print("🤖 DEFINING ML MODELS")
        print("="*50)
        
        self.models = {
            # Traditional ML Models
            'Logistic_Regression': LogisticRegression(random_state=42, max_iter=1000),
            'Random_Forest': RandomForestClassifier(random_state=42, n_estimators=100),
            'Gradient_Boosting': GradientBoostingClassifier(random_state=42),
            'SVM': SVC(random_state=42, probability=True),
            'KNN': KNeighborsClassifier(),
            'Naive_Bayes': GaussianNB(),
            'Decision_Tree': DecisionTreeClassifier(random_state=42),
            'AdaBoost': AdaBoostClassifier(random_state=42),
            
            # Advanced Models
            'XGBoost': xgb.XGBClassifier(random_state=42, eval_metric='logloss'),
            'LightGBM': lgb.LGBMClassifier(random_state=42, verbose=-1),
            'CatBoost': CatBoostClassifier(random_state=42, verbose=False)
        }
        
        print(f"✅ Đã định nghĩa {len(self.models)} models:")
        for name in self.models.keys():
            print(f"  - {name}")
            
        return self
    
    def train_and_evaluate_models(self, cv_folds=5):
        """Huấn luyện và đánh giá tất cả các mô hình"""
        print("\n" + "="*50)
        print("🎯 TRAINING AND EVALUATION")
        print("="*50)
        
        self.results = {}
        cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
        
        for name, model in self.models.items():
            print(f"\n🔄 Training {name}...")
            
            try:
                # Cross-validation scores
                cv_scores = cross_val_score(model, self.X_train_scaled, self.y_train, 
                                          cv=cv, scoring='roc_auc')
                
                # Train on full training set
                model.fit(self.X_train_scaled, self.y_train)
                
                # Predictions
                y_train_pred = model.predict(self.X_train_scaled)
                y_test_pred = model.predict(self.X_test_scaled)
                y_test_proba = model.predict_proba(self.X_test_scaled)[:, 1]
                
                # Calculate metrics
                metrics = {
                    'CV_ROC_AUC_mean': cv_scores.mean(),
                    'CV_ROC_AUC_std': cv_scores.std(),
                    'Train_Accuracy': accuracy_score(self.y_train, y_train_pred),
                    'Test_Accuracy': accuracy_score(self.y_test, y_test_pred),
                    'Test_Precision': precision_score(self.y_test, y_test_pred),
                    'Test_Recall': recall_score(self.y_test, y_test_pred),
                    'Test_F1': f1_score(self.y_test, y_test_pred),
                    'Test_ROC_AUC': roc_auc_score(self.y_test, y_test_proba),
                    'Model': model
                }
                
                self.results[name] = metrics
                
                print(f"  ✅ CV ROC-AUC: {metrics['CV_ROC_AUC_mean']:.4f} (±{metrics['CV_ROC_AUC_std']:.4f})")
                print(f"  📊 Test Accuracy: {metrics['Test_Accuracy']:.4f}")
                print(f"  🎯 Test ROC-AUC: {metrics['Test_ROC_AUC']:.4f}")
                
            except Exception as e:
                print(f"  ❌ Error training {name}: {str(e)}")
                continue
        
        # Find best model
        best_auc = 0
        for name, metrics in self.results.items():
            if metrics['Test_ROC_AUC'] > best_auc:
                best_auc = metrics['Test_ROC_AUC']
                self.best_model_name = name
                self.best_model = metrics['Model']
        
        print(f"\n🏆 Best Model: {self.best_model_name} (ROC-AUC: {best_auc:.4f})")
        return self
    
    def create_results_summary(self):
        """Tạo bảng tổng kết kết quả các mô hình"""
        print("\n" + "="*50)
        print("📊 RESULTS SUMMARY")
        print("="*50)
        
        # Create results DataFrame
        results_df = pd.DataFrame.from_dict(self.results, orient='index')
        results_df = results_df.drop('Model', axis=1)  # Remove model objects
        results_df = results_df.round(4)
        
        # Sort by Test ROC-AUC
        results_df = results_df.sort_values('Test_ROC_AUC', ascending=False)
        
        print("\n🏆 Model Performance Ranking:")
        print(results_df.to_string())
        
        # Save results
        results_df.to_csv('ML/data/model_comparison_results.csv')
        print("\n💾 Results saved to ML/data/model_comparison_results.csv")
        
        # Plot comparison
        self.plot_model_comparison(results_df)
        
        return results_df
    
    def plot_model_comparison(self, results_df):
        """Vẽ biểu đồ so sánh các mô hình"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('🏆 Model Performance Comparison', fontsize=16)
        
        # ROC-AUC comparison
        ax1 = axes[0, 0]
        results_df['Test_ROC_AUC'].plot(kind='barh', ax=ax1, color='skyblue')
        ax1.set_title('Test ROC-AUC Score')
        ax1.set_xlabel('ROC-AUC')
        
        # Accuracy comparison
        ax2 = axes[0, 1]
        results_df['Test_Accuracy'].plot(kind='barh', ax=ax2, color='lightgreen')
        ax2.set_title('Test Accuracy')
        ax2.set_xlabel('Accuracy')
        
        # F1-Score comparison
        ax3 = axes[1, 0]
        results_df['Test_F1'].plot(kind='barh', ax=ax3, color='orange')
        ax3.set_title('Test F1-Score')
        ax3.set_xlabel('F1-Score')
        
        # Precision vs Recall
        ax4 = axes[1, 1]
        scatter = ax4.scatter(results_df['Test_Precision'], results_df['Test_Recall'], 
                            c=results_df['Test_ROC_AUC'], cmap='viridis', s=100)
        ax4.set_xlabel('Precision')
        ax4.set_ylabel('Recall')
        ax4.set_title('Precision vs Recall (Color = ROC-AUC)')
        plt.colorbar(scatter, ax=ax4)
        
        # Add model names as annotations
        for i, model in enumerate(results_df.index):
            ax4.annotate(model, (results_df['Test_Precision'].iloc[i], 
                               results_df['Test_Recall'].iloc[i]), 
                        xytext=(5, 5), textcoords='offset points', 
                        fontsize=8, alpha=0.7)
        
        plt.tight_layout()
        plt.savefig('ML/data/model_comparison.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def hyperparameter_tuning(self, model_name=None, n_trials=50):
        """Tối ưu hyperparameters cho model tốt nhất hoặc model được chỉ định"""
        if model_name is None:
            model_name = self.best_model_name
            
        print(f"\n🔧 Hyperparameter tuning cho {model_name}...")
        
        def objective(trial):
            if model_name == 'Random_Forest':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                    'max_depth': trial.suggest_int('max_depth', 3, 20),
                    'min_samples_split': trial.suggest_int('min_samples_split', 2, 20),
                    'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 10),
                    'max_features': trial.suggest_categorical('max_features', ['sqrt', 'log2']),
                }
                model = RandomForestClassifier(random_state=42, **params)
                
            elif model_name == 'XGBoost':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                    'max_depth': trial.suggest_int('max_depth', 3, 10),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                    'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
                }
                model = xgb.XGBClassifier(random_state=42, eval_metric='logloss', **params)
                
            elif model_name == 'LightGBM':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                    'max_depth': trial.suggest_int('max_depth', 3, 10),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'num_leaves': trial.suggest_int('num_leaves', 10, 100),
                    'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                }
                model = lgb.LGBMClassifier(random_state=42, verbose=-1, **params)
            else:
                return 0  # Skip tuning for other models
            
            # Cross-validation score
            cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            scores = cross_val_score(model, self.X_train_scaled, self.y_train, 
                                   cv=cv, scoring='roc_auc')
            return scores.mean()
        
        # Run optimization
        study = optuna.create_study(direction='maximize')
        study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
        
        # Get best parameters
        best_params = study.best_params
        best_score = study.best_value
        
        print(f"🏆 Best parameters: {best_params}")
        print(f"📊 Best CV ROC-AUC: {best_score:.4f}")
        
        # Train best model
        if model_name == 'Random_Forest':
            tuned_model = RandomForestClassifier(random_state=42, **best_params)
        elif model_name == 'XGBoost':
            tuned_model = xgb.XGBClassifier(random_state=42, eval_metric='logloss', **best_params)
        elif model_name == 'LightGBM':
            tuned_model = lgb.LGBMClassifier(random_state=42, verbose=-1, **best_params)
            
        tuned_model.fit(self.X_train_scaled, self.y_train)
        self.best_model = tuned_model
        
        return self
    
    def analyze_feature_importance(self):
        """Phân tích độ quan trọng của features"""
        print("\n" + "="*50)
        print("🔍 FEATURE IMPORTANCE ANALYSIS")
        print("="*50)
        
        if hasattr(self.best_model, 'feature_importances_'):
            importance = self.best_model.feature_importances_
            
            # Create feature importance DataFrame
            feature_imp_df = pd.DataFrame({
                'Feature': self.feature_names,
                'Importance': importance
            }).sort_values('Importance', ascending=False)
            
            print("🏆 Top 10 Most Important Features:")
            print(feature_imp_df.head(10).to_string(index=False))
            
            # Plot feature importance
            plt.figure(figsize=(10, 6))
            sns.barplot(data=feature_imp_df, x='Importance', y='Feature', 
                       palette='viridis')
            plt.title(f'Feature Importance - {self.best_model_name}')
            plt.xlabel('Importance Score')
            plt.tight_layout()
            plt.savefig('ML/data/feature_importance.png', dpi=300, bbox_inches='tight')
            plt.show()
            
            return feature_imp_df
        else:
            print("⚠️  Model không hỗ trợ feature importance")
            return None
    
    def generate_final_report(self):
        """Tạo báo cáo tổng kết cuối cùng"""
        print("\n" + "="*80)
        print("📋 FINAL MODEL REPORT")
        print("="*80)
        
        # Best model performance
        y_pred = self.best_model.predict(self.X_test_scaled)
        y_proba = self.best_model.predict_proba(self.X_test_scaled)[:, 1]
        
        print(f"\n🏆 BEST MODEL: {self.best_model_name}")
        print("-" * 40)
        print(f"Test Accuracy: {accuracy_score(self.y_test, y_pred):.4f}")
        print(f"Test Precision: {precision_score(self.y_test, y_pred):.4f}")
        print(f"Test Recall: {recall_score(self.y_test, y_pred):.4f}")
        print(f"Test F1-Score: {f1_score(self.y_test, y_pred):.4f}")
        print(f"Test ROC-AUC: {roc_auc_score(self.y_test, y_proba):.4f}")
        
        # Confusion Matrix
        cm = confusion_matrix(self.y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['No Diabetes', 'Diabetes'],
                   yticklabels=['No Diabetes', 'Diabetes'])
        plt.title(f'Confusion Matrix - {self.best_model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig('ML/data/confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # ROC Curve
        fpr, tpr, _ = roc_curve(self.y_test, y_proba)
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2, 
                label=f'ROC curve (AUC = {roc_auc_score(self.y_test, y_proba):.4f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'ROC Curve - {self.best_model_name}')
        plt.legend(loc="lower right")
        plt.grid(alpha=0.3)
        plt.tight_layout()
        plt.savefig('ML/data/roc_curve.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Classification report
        print("\n📊 CLASSIFICATION REPORT:")
        print("-" * 40)
        print(classification_report(self.y_test, y_pred, 
                                  target_names=['No Diabetes', 'Diabetes']))
        
        return self
    
    def save_model(self, filename=None):
        """Lưu model tốt nhất"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"ML/models/diabetes_model_{self.best_model_name}_{timestamp}.pkl"
        
        # Save model and scaler
        model_data = {
            'model': self.best_model,
            'scaler': self.scalers['main'],
            'feature_names': self.feature_names,
            'model_name': self.best_model_name,
            'timestamp': datetime.now(),
            'performance': {
                'test_accuracy': accuracy_score(self.y_test, 
                                              self.best_model.predict(self.X_test_scaled)),
                'test_roc_auc': roc_auc_score(self.y_test, 
                                            self.best_model.predict_proba(self.X_test_scaled)[:, 1])
            }
        }
        
        joblib.dump(model_data, filename)
        print(f"💾 Model saved: {filename}")
        
        # Also save a simple prediction function
        self.create_prediction_function(filename.replace('.pkl', '_predictor.py'))
        
        return filename
    
    def create_prediction_function(self, filename):
        """Tạo function đơn giản để prediction"""
        code = f'''
"""
Diabetes Prediction Function
Generated automatically from ML pipeline
Model: {self.best_model_name}
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path

class DiabetesPredictor:
    def __init__(self, model_path):
        """Load trained model"""
        self.model_data = joblib.load(model_path)
        self.model = self.model_data['model']
        self.scaler = self.model_data['scaler']
        self.feature_names = self.model_data['feature_names']
        
    def predict(self, input_data):
        """
        Predict diabetes risk
        
        Parameters:
        - input_data: dict hoặc list với 8 features:
          [Pregnancies, Glucose, BloodPressure, SkinThickness, 
           Insulin, BMI, DiabetesPedigreeFunction, Age]
        
        Returns:
        - dict với prediction và probability
        """
        
        # Convert input to numpy array
        if isinstance(input_data, dict):
            # Ensure correct order of features
            features = [input_data[name] for name in self.feature_names]
        else:
            features = list(input_data)
            
        features = np.array(features).reshape(1, -1)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        probability = self.model.predict_proba(features_scaled)[0]
        
        # Determine risk level
        diabetes_prob = probability[1]
        if diabetes_prob < 0.3:
            risk_level = 'low'
        elif diabetes_prob < 0.6:
            risk_level = 'medium'
        else:
            risk_level = 'high'
            
        return {{
            'prediction': int(prediction),
            'probability': {{
                'no_diabetes': float(probability[0]),
                'diabetes': float(probability[1])
            }},
            'risk_level': risk_level,
            'confidence': float(max(probability))
        }}

# Example usage:
if __name__ == "__main__":
    # Load predictor
    predictor = DiabetesPredictor('path/to/model.pkl')
    
    # Example prediction
    sample_input = {{
        'Pregnancies': 2,
        'Glucose': 120,
        'BloodPressure': 70,
        'SkinThickness': 25,
        'Insulin': 100,
        'BMI': 28.5,
        'DiabetesPedigreeFunction': 0.5,
        'Age': 35
    }}
    
    result = predictor.predict(sample_input)
    print("Prediction Result:", result)
'''
        
        Path(filename).parent.mkdir(parents=True, exist_ok=True)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(code)
        
        print(f"📝 Prediction function saved: {filename}")

# Example usage
if __name__ == "__main__":
    print("🏥 DIABETES PREDICTION ML PIPELINE")
    print("=" * 50)
    
    # Initialize pipeline
    pipeline = DiabetesPredictionPipeline()
    
    # Run full pipeline
    (pipeline
     .load_data()  # Load hoặc tạo sample data
     .explore_data()  # EDA
     .preprocess_data(handle_zeros=True, scaling_method='standard', 
                     balance_method='smote')  # Preprocessing
     .define_models()  # Define models
     .train_and_evaluate_models()  # Train & evaluate
     .create_results_summary()  # Results summary
     .hyperparameter_tuning()  # Hyperparameter tuning
     .analyze_feature_importance()  # Feature importance
     .generate_final_report()  # Final report
     .save_model()  # Save best model
    )
    
    print("\n✅ ML Pipeline hoàn thành!")
    print("📁 Check thư mục ML/data/ và ML/models/ để xem kết quả")