# 🏥 MyHealthMate - Diabetes Prediction Website

Website dự đoán tiểu đường sử dụng Machine Learning, giúp người dùng đánh giá nguy cơ mắc bệnh tiểu đường dựa trên các chỉ số sức khỏe.

## 📋 Mục lục
- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)

---

## 🎯 Tổng quan

**MyHealthMate** là một hệ thống web full-stack giúp:
- ✅ Dự đoán nguy cơ tiểu đường dựa trên Machine Learning
- ✅ Quản lý hồ sơ sức khỏe người dùng
- ✅ Lưu trữ lịch sử dự đoán
- ✅ Quản trị hệ thống (Admin Dashboard)
- ✅ Cung cấp bài viết sức khỏe

---

## 🏗️ Kiến trúc hệ thống

Hệ thống được chia thành **3 phần chính**:

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│              (React + Vite + TailwindCSS)              │
│                    Port: 3000                           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│           (Node.js + Express + MongoDB)                │
│                    Port: 8017                           │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             │ Store Data            │ ML Prediction API
             ▼                       ▼
   ┌──────────────────┐    ┌─────────────────────┐
   │    MongoDB       │    │   ML SERVICE        │
   │  Cloud Atlas     │    │  (Flask + Sklearn)  │
   │                  │    │    Port: 5001       │
   └──────────────────┘    └─────────────────────┘
```

### 1️⃣ **Frontend** (React Application)
- **Framework**: React 18.3 với Vite
- **UI Library**: Radix UI + TailwindCSS + Shadcn/ui
- **Routing**: React Router DOM
- **State Management**: Context API
- **Charts**: Recharts
- **Notifications**: Sonner

### 2️⃣ **Backend** (REST API Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: Express Session + bcrypt
- **Validation**: Joi
- **File Upload**: Multer + Cloudinary
- **Email**: Brevo (SendInBlue)

### 3️⃣ **ML Service** (Machine Learning API)
- **Framework**: Flask (Python)
- **ML Library**: Scikit-learn
- **Model**: Logistic Regression
- **Data Processing**: Pandas, NumPy

---

## 💻 Công nghệ sử dụng

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",           // Web framework
    "mongodb": "^6.9.0",             // Database driver
    "bcryptjs": "^2.4.3",            // Password hashing
    "express-session": "^1.17.3",    // Session management
    "connect-mongo": "^5.0.0",       // Session store
    "joi": "^17.11.0",               // Validation
    "cloudinary": "^2.8.0",          // Image upload
    "multer": "^2.0.2",              // File handling
    "axios": "^1.13.1",              // HTTP client
    "cors": "^2.8.5",                // CORS handling
    "dotenv": "^16.3.1",             // Environment variables
    "http-status-codes": "^2.3.0",   // Status codes
    "uuid": "^9.0.1"                 // Unique ID generator
  },
  "devDependencies": {
    "@babel/core": "^7.22.10",       // ES6+ transpiler
    "nodemon": "^3.0.1",             // Auto-restart
    "eslint": "^9.36.0"              // Code linting
  }
}
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "*",
    "@radix-ui/*": "...",            // 20+ UI components
    "lucide-react": "^0.487.0",      // Icons
    "recharts": "^2.15.2",           // Charts
    "sonner": "^2.0.3",              // Toast notifications
    "tailwind-merge": "*",           // TailwindCSS utilities
    "class-variance-authority": "^0.7.1"
  }
}
```

### ML Service Dependencies
```
# Core ML Libraries
Flask>=3.0.0
flask-cors>=4.0.0
numpy>=1.26.0
pandas>=2.1.0
scikit-learn>=1.3.0
joblib>=1.3.0
python-dotenv>=1.0.0
requests>=2.31.0

# Advanced ML Models (Optional)
xgboost>=2.0.0
lightgbm>=4.0.0
catboost>=1.2.0

# Imbalanced Learning
imbalanced-learn>=0.11.0

# Hyperparameter Optimization
optuna>=3.4.0

# Data Visualization
matplotlib>=3.8.0
seaborn>=0.13.0
plotly>=5.18.0

# Additional utilities
scipy>=1.11.0
```

---

## 🤖 Machine Learning Models

MyHealthMate sử dụng một **pipeline ML toàn diện** với **15+ thuật toán** khác nhau để dự đoán bệnh tiểu đường:

### 📊 Model Categories

#### 1. Linear Models (4 models)
- **Logistic Regression** ⭐ **(Production Model)**
  - ROC-AUC: 0.844 (CV), 0.810 (Test)
  - Accuracy: 70.1%
  - Nhanh, ổn định, dễ giải thích
- **Ridge Classifier** - L2 regularization
- **Linear Discriminant Analysis (LDA)**
- **Quadratic Discriminant Analysis (QDA)**

#### 2. Tree-based Models (3 models)
- **Random Forest** - Ensemble of decision trees
- **Extra Trees** - Extremely randomized trees
- **Decision Tree** - Single tree classifier

#### 3. Boosting Models (2-5 models)
- **Gradient Boosting** - Sequential ensemble
- **AdaBoost** - Adaptive boosting
- **XGBoost** 🚀 - Extreme gradient boosting (optional)
- **LightGBM** 🚀 - Light gradient boosting (optional)
- **CatBoost** 🚀 - Categorical boosting (optional)

#### 4. Other Models (4 models)
- **Support Vector Machine (SVM)** - Kernel methods
- **K-Nearest Neighbors (KNN)** - Instance-based
- **Naive Bayes** - Probabilistic classifier
- **Neural Network (MLP)** - Multi-layer perceptron

### 🎯 Model Selection Process

1. **Data Preprocessing**
   - Handle zero values (median imputation)
   - Feature scaling (StandardScaler)
   - Optional class balancing (SMOTE/ADASYN)

2. **Cross-Validation**
   - 5-fold StratifiedKFold
   - Metrics: Accuracy, Precision, Recall, F1, ROC-AUC

3. **Hyperparameter Tuning**
   - RandomizedSearchCV (100 iterations)
   - Optimize by ROC-AUC score

4. **Model Export**
   - Best model saved as `.joblib`
   - Scaler saved for preprocessing
   - Metadata saved as JSON

### 📁 ML Files Structure
```
ml-service/
├── models/
│   ├── diabetes_ml_pipeline.py              # Training pipeline
│   ├── model_config.py                      # Models configuration
│   ├── diabetes_model_*.joblib              # Trained model
│   ├── scaler_*.joblib                      # Feature scaler
│   ├── diabetes_predictor_*.py              # Production code
│   └── model_metadata_*.json                # Model info & metrics
├── data/
│   └── pima_clean.csv                       # Cleaned dataset
├── notebooks/
│   └── diabetes_model_training.ipynb        # Training notebook
├── MODELS_DOCUMENTATION.md                  # Detailed ML docs
└── app.py                                   # Flask API

```


---

## 🚀 Cài đặt

### Yêu cầu hệ thống
- **Node.js**: >= 18.0.0
- **Python**: >= 3.9.0
- **npm** hoặc **yarn**
- **MongoDB Atlas Account** (hoặc MongoDB local)
- **Cloudinary Account** (cho upload ảnh)

### 1. Clone Repository
```bash
git clone https://github.com/nghuy0701/Website-MyHealthMate-.git
cd Website-MyHealthMate-
```

### 2. Cài đặt Backend
```bash
cd Backend

yarn install
yarn add --dev cross-env nodemon @babel/node
yarn add dotenv
```

**Backend sẽ tự động cài đặt:**
- Express và các middleware (cors, session, etc.)
- MongoDB driver
- Babel transpiler cho ES6+
- Validation library (Joi)
- Authentication (bcryptjs)
- File upload (Multer, Cloudinary)
- Development tools (Nodemon, ESLint)

### 3. Cài đặt Frontend
```bash
cd ../Frontend

# Cài đặt dependencies
npm install

```

**Frontend sẽ tự động cài đặt:**
- React 18 và React Router
- Vite build tool
- TailwindCSS và Radix UI components
- Chart libraries (Recharts)
- Icons và utilities

### 4. Cài đặt ML Service
```bash
cd ../ml-service

# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

**ML Service sẽ cài đặt:**
- Flask web framework
- NumPy, Pandas (data processing)
- Scikit-learn (ML models)
- Joblib (model serialization)

---

## ▶️ Chạy ứng dụng

### 1. Khởi động Backend
```bash
cd Backend

# Development mode (auto-reload)
yarn dev
```
✅ Backend sẽ chạy tại: **http://localhost:8017**

### 2. Khởi động Frontend
```bash
cd Frontend

# Development mode
npm run dev
```
✅ Frontend sẽ chạy tại: **http://localhost:3000**

### 3. Khởi động ML Service
```bash
cd ml-service

# Chạy Flask server
python app.py
```
✅ ML Service sẽ chạy tại: **http://localhost:5001**

---

## 📁 Cấu trúc thư mục

```
Website-MyHealthMate/
│
├── Backend/                    # Node.js Backend
│   ├── src/
│   │   ├── configs/           # Cấu hình (DB, CORS, Session)
│   │   ├── controllers/       # Business logic
│   │   ├── middlewares/       # Auth, Upload, Error handling
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Service layer
│   │   ├── validations/       # Input validation
│   │   ├── providers/         # External services (Cloudinary, Brevo)
│   │   └── utils/             # Helpers, constants
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js
│
├── Frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   └── admin/        # Admin dashboard components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Context, API client, utilities
│   │   └── styles/           # CSS files
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── ml-service/                # Python ML Service
│   ├── models/               # Trained ML models
│   ├── data/                 # Training datasets
│   ├── notebooks/            # Jupyter notebooks
│   ├── app.py               # Flask application
│   ├── requirements.txt
│   └── .env
│
└── README.md                 # This file
```

---

## 🔑 Tính năng chính

### User Features
- 📝 Đăng ký/Đăng nhập
- 👤 Quản lý profile (avatar, thông tin cá nhân)
- 🔮 Thực hiện test dự đoán tiểu đường
- 📊 Xem lịch sử dự đoán
- 📚 Đọc bài viết sức khỏe
- 💬 Bình luận bài viết

### Admin Features
- 👥 Quản lý người dùng
- 📄 Quản lý bài viết
- ❓ Quản lý câu hỏi khảo sát
- 📈 Dashboard thống kê
- 🔐 Xác thực email admin

---

## 🛠️ Scripts hữu ích

### Backend
```bash
yarn dev
```

### Frontend
```bash
npm run dev
```

### ML Service
```bash
python app.py                              # Chạy Flask server
python models/diabetes_ml_pipeline.py      # Train model mới
python models/model_config.py              # Xem cấu hình models
```

**Training Models:**
```python
# Sử dụng pipeline để train models
from models.diabetes_ml_pipeline import DiabetesPredictionPipeline

pipeline = DiabetesPredictionPipeline()
pipeline.load_data('data/pima_clean.csv')
pipeline.preprocess_data()
pipeline.define_models()
pipeline.train_and_evaluate_models()
pipeline.optimize_best_model()
pipeline.save_best_model()
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/v1/users/register` - Đăng ký user
- `POST /api/v1/users/login` - Đăng nhập user
- `POST /api/v1/users/logout` - Đăng xuất
- `POST /api/v1/admin/login` - Đăng nhập admin

### Users
- `GET /api/v1/users/me` - Lấy thông tin user hiện tại
- `PUT /api/v1/users/me` - Cập nhật profile
- `POST /api/v1/users/me/avatar` - Upload avatar
- `PUT /api/v1/users/me/change-password` - Đổi mật khẩu

### Predictions
- `POST /api/v1/predictions` - Tạo dự đoán mới
- `GET /api/v1/predictions/user/:userId` - Lấy lịch sử dự đoán
- `GET /api/v1/predictions/:id` - Lấy chi tiết dự đoán

### Articles
- `GET /api/v1/articles` - Lấy danh sách bài viết
- `GET /api/v1/articles/:id` - Lấy chi tiết bài viết
- `POST /api/v1/articles` - Tạo bài viết (Admin)
- `PUT /api/v1/articles/:id` - Cập nhật bài viết (Admin)
- `DELETE /api/v1/articles/:id` - Xóa bài viết (Admin)

### Questions
- `GET /api/v1/questions` - Lấy danh sách câu hỏi
- `POST /api/v1/questions` - Tạo câu hỏi (Admin)
- `PUT /api/v1/questions/:id` - Cập nhật câu hỏi (Admin)
- `DELETE /api/v1/questions/:id` - Xóa câu hỏi (Admin)

---

## 👥 Team

**MyHealthMate Team**

---

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

## 🤝 Contributing

Mọi đóng góp đều được chào đón! Vui lòng tạo pull request hoặc mở issue.

---

## 📞 Liên hệ

- GitHub: [@nghuy0701](https://github.com/nghuy0701)
- Email: nguyentnhuy2k5@gmail.com

---

**Lưu ý**: Đảm bảo cấu hình đúng các biến môi trường và có kết nối internet để kết nối MongoDB Atlas và Cloudinary.
