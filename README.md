# 🏥 MyHealthMate - AI-Powered Diabetes Risk Prediction Platform

<div align="center">

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Automated-success?style=for-the-badge&logo=github-actions)](https://github.com/nghuy0701/Website-MyHealthMate-/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Cloud-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Hệ thống dự đoán nguy cơ tiểu đường thông minh sử dụng Machine Learning & AI**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-tài-liệu) • [🐳 Docker Setup](#-docker-deployment) • [🤖 ML Models](#-machine-learning-models) • [🔧 API Docs](#-api-endpoints)

</div>

---

## 🌟 Highlights

MyHealthMate là một **full-stack healthcare platform** tích hợp Machine Learning để:

- ✅ **Dự đoán nguy cơ tiểu đường** với độ chính xác 70.1% (ROC-AUC: 0.810)
- ✅ **15+ ML algorithms** - Từ Logistic Regression đến Neural Networks
- ✅ **Production-ready** - Docker containerization & CI/CD pipeline
- ✅ **Professional architecture** - Microservices với Redis caching
- ✅ **Real-time monitoring** - Lịch sử dự đoán & health tracking dashboard
- ✅ **Healthcare content** - Bài viết y khoa chuyên sâu
- ✅ **Admin dashboard** - Quản lý người dùng & nội dung toàn diện

---

## 📋 Mục lục

- [🎯 Tổng Quan](#-tổng-quan)
- [🚀 Quick Start](#-quick-start)
- [🐳 Docker Deployment](#-docker-deployment)
- [⚙️ Cài Đặt Thủ Công](#️-cài-đặt-thủ-công)
- [🏗️ Kiến Trúc Hệ Thống](#️-kiến-trúc-hệ-thống)
- [💻 Công Nghệ](#-công-nghệ)
- [🤖 Machine Learning Models](#-machine-learning-models)
- [🔑 Tính Năng](#-tính-năng)
- [📁 Cấu Trúc Project](#-cấu-trúc-project)
- [🔧 API Endpoints](#-api-endpoints)
- [📚 Tài Liệu ML Chi Tiết](#-tài-liệu-ml-chi-tiết)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [👥 Team & License](#-team--license)

---

## 🎯 Tổng Quan

### Giới Thiệu

**MyHealthMate** là nền tảng chăm sóc sức khỏe số hóa với công nghệ AI/ML tiên tiến, giúp:

🏥 **Sàng lọc sớm** - Phát hiện nguy cơ tiểu đường trước khi xuất hiện triệu chứng  
📊 **Đánh giá chính xác** - Sử dụng 15+ thuật toán ML với độ chính xác 70.1%  
📈 **Theo dõi liên tục** - Lưu trữ & phân tích lịch sử dự đoán theo thời gian  
💡 **Tư vấn cá nhân hóa** - Cung cấp nội dung y khoa dựa trên kết quả dự đoán  
🔐 **Bảo mật cao** - Mã hóa dữ liệu & tuân thủ chuẩn bảo mật y tế  

### Thống Kê

- **768** mẫu dữ liệu huấn luyện từ Pima Indians Diabetes Database
- **15+** thuật toán ML được so sánh và tối ưu hóa
- **70.1%** độ chính xác trên test set (ROC-AUC: 0.810)
- **<1s** thời gian response cho mỗi dự đoán
- **100%** containerized với Docker & CI/CD automation

---

## 🚀 Quick Start

### Prerequisites

Đảm bảo bạn đã cài đặt:

- **Docker Desktop** 20.10+ ([Hướng dẫn cài đặt](#cài-đặt-docker))
- **Git** 2.30+
- **MongoDB Atlas Account** (free tier)
- **Cloudinary Account** (free tier)

### One-Command Deployment

```bash
# 1. Clone repository
git clone https://github.com/nghuy0701/Website-MyHealthMate-.git
cd Website-MyHealthMate-

# 2. Create environment file
cp .env.example .env

# 3. Update .env với credentials thực tế
# (Xem phần Environment Configuration bên dưới)

# 4. Start all services
docker-compose up -d --build

# 5. Verify deployment
docker-compose ps
```

**🎉 Done! Truy cập ứng dụng tại:**

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8017
- 🤖 **ML Service**: http://localhost:5001
- 💾 **Redis**: localhost:6379

### Environment Configuration

Tạo file `.env` ở root directory với nội dung sau:

```bash
# ============================================
# 🌍 ENVIRONMENT & DATABASE
# ============================================
NODE_ENV=development

# MongoDB Cloud Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=diabetes_prediction

# ============================================
# 🔥 CACHE & SESSION
# ============================================
REDIS_URL=redis://:redis123@redis:6379
SESSION_SECRET=MyHealthMate_S3ss10n_S3cr3t_K3y_2024!

# ============================================
# 🔐 SECURITY
# ============================================
ADMIN_SECRET_KEY=MyHealthMate_@dmin_S3cr3t!

# ============================================
# 🖥️ APP SERVER
# ============================================
PORT=8017
FRONTEND_URL=http://localhost:3000

# ============================================
# 🔗 INTERNAL SERVICES
# ============================================
ML_SERVICE_URL=http://ml-service:5001

# ============================================
# 🌐 EXTERNAL SERVICES
# ============================================
# Cloudinary (Image hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Brevo (Email service)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# ============================================
# 🎨 FRONTEND
# ============================================
VITE_API_URL=http://localhost:8017

# ============================================
# 📝 METADATA
# ============================================
APP_NAME=MyHealthMate
APP_VERSION=1.0.0
```

### Quick Commands

```bash
# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop & remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose up -d --build backend
```

---

## 🐳 Docker Deployment

### Cài Đặt Docker

#### Windows

1. **Download Docker Desktop**
   - Truy cập: https://www.docker.com/products/docker-desktop/
   - Download phiên bản Windows

2. **Cài đặt**
   ```powershell
   # Chạy file installer
   # Enable WSL 2 nếu được yêu cầu
   
   # Verify installation
   docker --version
   docker-compose --version
   ```

3. **Khởi động Docker Desktop**
   - Mở Docker Desktop từ Start Menu
   - Đợi Docker engine khởi động (icon chuyển xanh)

#### macOS

```bash
# Install via Homebrew
brew install --cask docker

# Or download from:
# https://www.docker.com/products/docker-desktop/

# Verify
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add user to docker group (optional - no sudo required)
sudo usermod -aG docker $USER
newgrp docker
```

### Docker Architecture

```yaml
services:
  # 1. Frontend (React + Nginx)
  frontend:
    build: ./Frontend
    ports: ["3000:80"]
    depends_on: [backend]
    
  # 2. Backend (Node.js + Express)
  backend:
    build: ./Backend
    ports: ["8017:8017"]
    depends_on: [mongodb, redis, ml-service]
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=redis://:redis123@redis:6379
      - ML_SERVICE_URL=http://ml-service:5001
    
  # 3. ML Service (Python + Flask)
  ml-service:
    build: ./ml-service
    ports: ["5001:5001"]
    
  # 4. Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass redis123
    ports: ["6379:6379"]
    volumes: [redis-data:/data]
```

### Docker Features

✅ **Multi-stage builds** - Optimized image sizes  
✅ **Health checks** - Auto-recovery for all services  
✅ **Named volumes** - Persistent data for Redis  
✅ **Bridge network** - Isolated service communication  
✅ **Resource limits** - CPU & memory constraints  
✅ **Security** - Non-root users, read-only filesystems  

### Production Deployment

```bash
# Build for production
docker-compose -f docker-compose.prod.yml up -d --build

# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Monitor resource usage
docker stats

# View service health
docker-compose ps
```

---

## ⚙️ Cài Đặt Thủ Công

Nếu không sử dụng Docker, follow các bước sau:

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
- **npm** (Node Package Manager)
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
cd ml-service

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
npm run dev
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
npm run dev
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

## 🤖 Phần Chi Tiết về Machine Learning

### 0. Giới thiệu

Trong lĩnh vực chăm sóc sức khỏe, việc phát hiện và phòng ngừa sớm đóng vai trò then chốt trong việc kiểm soát các tình trạng mãn tính và cải thiện kết quả của bệnh nhân. **Đái tháo đường hay tiểu đường**[^1] là một nhóm các rối loạn chuyển hóa đặc trưng là tình trạng đường huyết cao kéo dài, đây là một bệnh phổ biến gây những rủi ro đáng kể nếu không được điều trị kịp thời. Trong bối cảnh khoa học phát triển, việc tích hợp các kỹ thuật học máy hứa hẹn sẽ cách mạng hóa các hoạt động chăm sóc sức khỏe, đặc biệt là trong phân tích và dự đoán.

<div align="center">
  <img src="https://img.freepik.com/free-vector/diabetes-abstract-concept-illustration_335657-3895.jpg" alt="Diabetes" width="500"/>
  <p><em>Bệnh tiểu đường là bệnh phổ biến trong xã hội</em></p>
</div>

Bệnh tiểu đường đang là một trong những vấn đề sức khỏe nghiêm trọng trên toàn cầu. Theo **Centers for Disease Control and Prevention (CDC)** công bố ước tính trong năm 2021, có khoảng **38.1 triệu người trưởng thành** từ 18 tuổi trở lên - 14.7% tổng số người trưởng thành ở Hoa Kỳ mắc bệnh tiểu đường. Con số này đã tăng lên theo thời gian. Năm 2010, 29,1 triệu người trưởng thành ở Hoa Kỳ mắc bệnh tiểu đường, tương đương 9,3% dân số trưởng thành[^2].

<div align="center">
  <img src="https://img.freepik.com/free-vector/artificial-intelligence-ai-robot-gives-recommendation-system_1150-48455.jpg" alt="ML Application" width="500"/>
  <p><em>Ứng dụng của trí tuệ nhân tạo vào dự đoán bệnh tiểu đường</em></p>
</div>

Dự án này tập trung vào việc ứng dụng **Machine Learning**[^3] tập trung vào việc phân tích các yếu tố nguy cơ và xây dựng một hệ thống dự đoán khả năng mắc bệnh tiểu đường dựa trên bộ dữ liệu từ **Behavioral Risk Factor Surveillance System (BRFSS)** năm 2021 của CDC cung cấp và được trích xuất từ hơn 300 đặc trưng để tạo ra bộ dữ liệu này.

**Behavioral Risk Factor Surveillance System (BRFSS)** là một cuộc khảo sát qua điện thoại nhằm thu thập dữ liệu về các hành vi rủi ro liên quan đến sức khỏe, tình trạng sức khỏe mãn tính và việc sử dụng các dịch vụ phòng ngừa ở người lớn từ 18 tuổi trở lên cư trú tại Hoa Kỳ. Được thực hiện hàng năm bởi CDC, BRFSS đã cung cấp những hiểu biết sâu sắc có giá trị về tình trạng sức khỏe và hành vi của người trưởng thành ở Hoa Kỳ kể từ khi thành lập vào năm 1984.

<div align="center">
  <img src="https://www.cdc.gov/brfss/images/brfss-logo.png" alt="BRFSS" width="400"/>
  <p><em>Behavioral Risk Factor Surveillance System (BRFSS)</em></p>
</div>

---

### 1. Dữ liệu

Đối với tập dữ liệu này, đây là các file CSV của tập dữ liệu BRFSS 2021 có trên Kaggle đã được sử dụng. Tập dữ liệu gốc chứa phản hồi từ **438.693 cá nhân** và có **303 đặc điểm**. Các feature này là các câu hỏi được đặt ra trực tiếp cho người tham gia hoặc các biến được tính toán dựa trên phản hồi của từng người tham gia. 

Bộ dữ liệu này sẽ gồm có 3 file:

1. **`diabetes_012_health_indicators_BRFSS2021.csv`** - Tập dữ liệu rõ ràng gồm **236.378 câu trả lời** khảo sát theo BRFSS2021 của CDC. Có sự mất cân bằng giữa các lớp trong tập dữ liệu này. Tập dữ liệu này có **21 features**. Biến mục tiêu `Diabetes_012` có 3 class:
   - `0`: Không mắc bệnh tiểu đường
   - `1`: Tiền tiểu đường
   - `2`: Bệnh tiểu đường

2. **`diabetes_binary_5050split_health_indicators_BRFSS2021.csv`** - Tập dữ liệu sạch gồm **67.136 câu trả lời** khảo sát cho BRFSS2021 của CDC. Tỷ lệ người trả lời không mắc bệnh tiểu đường và mắc tiểu đường là 50-50. Tập dữ liệu này có **21 biến đặc trưng** và được cân bằng sẵn. Biến mục tiêu `Diabetes_binary` có 2 class:
   - `0`: Không mắc bệnh tiểu đường
   - `1`: Tiền tiểu đường hoặc tiểu đường

3. **`diabetes_binary_health_indicators_BRFSS2021.csv`** - Tập dữ liệu rõ ràng gồm **236.378 câu trả lời** khảo sát theo BRFSS2021 của CDC. Tập dữ liệu này có **21 biến đặc trưng** và không cân bằng. Biến mục tiêu `Diabetes_binary` có 2 class:
   - `0`: Không mắc bệnh tiểu đường
   - `1`: Tiền tiểu đường hoặc tiểu đường

Trong dự án này, chúng ta sử dụng bộ dữ liệu **Pima Indians Diabetes Database** từ Kaggle với các thông tin sau:

- **Tên tệp**: `pima_clean.csv`
- **Số lượng mẫu**: 768 bệnh nhân
- **Số lượng cột**: 9 (8 features + 1 target)
- **Mục tiêu**: Cột `Outcome` (0: Không bị tiểu đường, 1: Bị tiểu đường)
- **Các cột đặc trưng**: Bao gồm các chỉ số y tế như số lần mang thai, nồng độ glucose, huyết áp, độ dày da, insulin, BMI, chức năng tiểu đường di truyền và tuổi tác.

#### Bảng mô tả ý nghĩa các cột

| Tên cột | Mô tả |
|---------|-------|
| `Pregnancies` | Số lần mang thai |
| `Glucose` | Nồng độ glucose trong máu (mg/dL) |
| `BloodPressure` | Huyết áp tâm trương (mm Hg) |
| `SkinThickness` | Độ dày da vùng cánh tay sau (mm) |
| `Insulin` | Nồng độ insulin trong máu (μU/mL) |
| `BMI` | Chỉ số khối cơ thể (kg/m²) |
| `DiabetesPedigreeFunction` | Chức năng tiểu đường di truyền |
| `Age` | Tuổi (năm) |
| `Outcome` | Kết quả (0: Không mắc tiểu đường, 1: Mắc tiểu đường) |

#### Phân phối dữ liệu

<div align="center">
  <img src="ml-service/readme_images/03_outcome_distribution.png" alt="Outcome Distribution" width="700"/>
  <p><em>Phân phối kết quả trong tập dữ liệu Pima</em></p>
</div>

<div align="center">
  <img src="ml-service/readme_images/02_correlation_heatmap.png" alt="Correlation Heatmap" width="600"/>
  <p><em>Ma trận tương quan giữa các đặc trưng</em></p>
</div>

---

### 2. Mục tiêu dự án

#### 2.1. Tiền xử lý và Phân tích dữ liệu

- **Làm sạch và xử lý dữ liệu ban đầu**
  - Xử lý giá trị 0 bất thường (không hợp lý về mặt y tế) trong các cột như Glucose, BloodPressure, SkinThickness, Insulin, BMI
  - Thay thế giá trị 0 bằng giá trị trung vị (median) của từng cột
  
- **Phân tích khám phá dữ liệu (EDA)**
  - Phân tích phân phối của các biến
  - Xác định outliers và các mẫu bất thường
  - Phân tích tương quan giữa các biến
  - Trực quan hóa mối quan hệ giữa các features và target

- **Feature Engineering**
  - Chuẩn hóa dữ liệu bằng StandardScaler
  - Đánh giá tầm quan trọng của các features

#### 2.2. Cân bằng dữ liệu

Do tập dữ liệu có sự mất cân bằng giữa các lớp, pipeline hỗ trợ nhiều phương pháp cân bằng:

- **SMOTE** (Synthetic Minority Over-sampling Technique) - Tạo mẫu tổng hợp cho lớp thiểu số
- **ADASYN** (Adaptive Synthetic Sampling) - Tạo mẫu thích ứng dựa trên mật độ
- **Random Under-sampling** - Giảm mẫu lớp đa số
- **SMOTEENN** - Kết hợp SMOTE và Edited Nearest Neighbours

#### 2.3. Xây dựng và huấn luyện mô hình

Pipeline thử nghiệm **15+ thuật toán Machine Learning** được chia thành 4 nhóm:

**Linear Models** (4 models):
- Logistic Regression ⭐ **(Production Model)**
- Ridge Classifier
- Linear Discriminant Analysis (LDA)
- Quadratic Discriminant Analysis (QDA)

**Tree-based Models** (3 models):
- Random Forest Classifier
- Extra Trees Classifier
- Decision Tree Classifier

**Boosting Models** (2-5 models):
- Gradient Boosting
- AdaBoost
- XGBoost 🚀 (optional)
- LightGBM 🚀 (optional)
- CatBoost 🚀 (optional)

**Other Models** (4 models):
- Support Vector Machine (SVM)
- K-Nearest Neighbors (KNN)
- Naive Bayes
- Multi-layer Perceptron (Neural Network)

#### 2.4. Tối ưu hóa hyperparameter

- Sử dụng **RandomizedSearchCV** với 100 iterations
- Cross-validation với **StratifiedKFold** (5 folds)
- Tối ưu hóa theo ROC-AUC score

#### 2.5. Đánh giá mô hình

Sử dụng các metrics đánh giá toàn diện:

- **Accuracy**: Độ chính xác tổng thể
- **Precision**: Độ chính xác của dự đoán positive
- **Recall**: Khả năng phát hiện cases positive
- **F1-score**: Trung bình điều hòa của Precision và Recall
- **ROC-AUC**: Diện tích dưới đường cong ROC

Dự án nhằm mục đích xây dựng một hệ thống dự đoán nguy cơ mắc bệnh tiểu đường dựa trên các chỉ số sức khỏe, giúp phát hiện sớm và có biện pháp phòng ngừa kịp thời.

---

### 3. Công cụ và thư viện sử dụng

#### Ngôn ngữ lập trình
- **Python** 3.9+

#### Thư viện xử lý dữ liệu
- **pandas** - Data manipulation and analysis
- **numpy** - Numerical computing

#### Thư viện trực quan hóa
- **matplotlib** - Basic plotting
- **seaborn** - Statistical data visualization
- **plotly** - Interactive visualizations

#### Thư viện Machine Learning
- **scikit-learn** - ML algorithms và utilities
- **imbalanced-learn** - Xử lý dữ liệu mất cân bằng
- **XGBoost** - Extreme Gradient Boosting (optional)
- **LightGBM** - Light Gradient Boosting (optional)
- **CatBoost** - Categorical Boosting (optional)

#### Thư viện tối ưu hóa
- **optuna** - Hyperparameter optimization (optional)

#### Công cụ lưu trữ mô hình
- **joblib** - Model serialization
- **json** - Metadata storage

---

### 4. Kết quả đạt được

#### 4.1. Cải thiện chất lượng dữ liệu

- ✅ Xử lý thành công các giá trị 0 bất thường (không hợp lý về mặt y tế)
- ✅ Thay thế bằng giá trị median phù hợp với phân phối dữ liệu
- ✅ Chuẩn hóa dữ liệu để các features có cùng scale

#### 4.2. So sánh các thuật toán Machine Learning

Pipeline đã huấn luyện và đánh giá **15+ mô hình** với các kết quả tiêu biểu:

| Model | Accuracy (CV) | ROC-AUC (CV) | Accuracy (Test) | ROC-AUC (Test) |
|-------|---------------|--------------|-----------------|----------------|
| **Logistic Regression** ⭐ | **76.5%** | **0.844** | **70.1%** | **0.810** |
| Random Forest | 75.2% | 0.830 | 68.8% | 0.795 |
| Gradient Boosting | 74.8% | 0.825 | 69.2% | 0.800 |
| SVM (RBF kernel) | 73.5% | 0.815 | 67.5% | 0.785 |
| Neural Network (MLP) | 72.8% | 0.810 | 66.9% | 0.775 |

<div align="center">
  <img src="ml-service/readme_images/05_model_comparison.png" alt="Model Comparison" width="800"/>
  <p><em>Biểu đồ so sánh hiệu suất các mô hình Machine Learning</em></p>
</div>

#### 4.3. Mô hình tốt nhất

**Logistic Regression** được chọn làm mô hình production vì:

✅ **Hiệu suất cao nhất**: 
- Cross-validation ROC-AUC: 0.844
- Test ROC-AUC: 0.810
- Test Accuracy: 70.1%

✅ **Ưu điểm vượt trội**:
- Nhanh và hiệu quả
- Dễ giải thích kết quả
- Ổn định trên nhiều bộ dữ liệu
- Không bị overfitting
- Phù hợp cho production environment

#### 4.4. Đường cong ROC cho mô hình tốt nhất

<div align="center">
  <img src="ml-service/readme_images/06_roc_curve.png" alt="ROC Curve" width="600"/>
  <p><em>Đường cong ROC của mô hình Logistic Regression (AUC = 0.810)</em></p>
</div>

<div align="center">
  <img src="ml-service/readme_images/09_metrics_comparison.png" alt="Metrics Comparison" width="800"/>
  <p><em>Các chỉ số đánh giá mô hình Logistic Regression</em></p>
</div>

<div align="center">
  <img src="ml-service/readme_images/07_confusion_matrix.png" alt="Confusion Matrix" width="500"/>
  <p><em>Ma trận nhầm lẫn (Confusion Matrix)</em></p>
</div>

#### 4.5. Feature Importance

Các yếu tố quan trọng nhất ảnh hưởng đến dự đoán:

1. **Glucose** (Nồng độ đường huyết) - Quan trọng nhất
2. **BMI** (Chỉ số khối cơ thể)
3. **Age** (Tuổi)
4. **DiabetesPedigreeFunction** (Yếu tố di truyền)
5. **Pregnancies** (Số lần mang thai)

<div align="center">
  <img src="ml-service/readme_images/08_feature_importance.png" alt="Feature Importance" width="700"/>
  <p><em>Tầm quan trọng của các đặc trưng trong mô hình</em></p>
</div>

---

### 5. Ý nghĩa thực tiễn

#### 5.1. Ứng dụng trong y tế

- 🏥 **Sàng lọc sớm**: Hỗ trợ bác sĩ phát hiện sớm nguy cơ tiểu đường
- 📊 **Đánh giá rủi ro**: Xác định mức độ nguy cơ dựa trên các chỉ số sức khỏe
- 💊 **Phòng ngừa chủ động**: Đưa ra khuyến nghị lối sống để giảm nguy cơ
- 📈 **Theo dõi diễn biến**: Lưu trữ lịch sử dự đoán theo thời gian

#### 5.2. Tính khả thi

- ✅ Sử dụng các chỉ số y tế phổ biến, dễ thu thập
- ✅ Mô hình đơn giản, dễ triển khai
- ✅ Thời gian dự đoán nhanh (< 1 giây)
- ✅ Độ chính xác chấp nhận được (70.1%)
- ✅ Có thể tích hợp vào hệ thống y tế hiện có

#### 5.3. Giới hạn và cải thiện

**Giới hạn hiện tại**:
- Dữ liệu huấn luyện giới hạn (768 mẫu)
- Chỉ sử dụng 8 features cơ bản
- Độ chính xác chưa đạt mức tối ưu (70.1%)

**Hướng cải thiện**:
- Thu thập thêm dữ liệu từ nhiều nguồn
- Thêm features phức tạp hơn (xét nghiệm máu chi tiết, yếu tố sinh hoạt)
- Thử nghiệm ensemble methods
- Tích hợp Deep Learning models

---

### 6. Mở rộng trong tương lai

#### 6.1. Nâng cấp mô hình

- 🧠 **Deep Learning**: Thử nghiệm mạng Neural Network sâu hơn
- 🔀 **Ensemble Methods**: Kết hợp nhiều mô hình để cải thiện độ chính xác
- 📊 **AutoML**: Tự động hóa việc tối ưu hyperparameter
- 🎯 **Multi-output Models**: Dự đoán đồng thời nhiều bệnh lý liên quan

#### 6.2. Mở rộng dữ liệu

- 📈 **Time Series**: Tích hợp dữ liệu theo thời gian để dự đoán xu hướng
- 🏥 **Multi-source Data**: Kết hợp dữ liệu từ nhiều bệnh viện
- 🧬 **Genetic Data**: Thêm thông tin di truyền chi tiết
- 📱 **Wearable Data**: Tích hợp dữ liệu từ thiết bị đeo

#### 6.3. Tính năng mới

- ✅ **Real-time Monitoring**: Giám sát real-time từ IoT devices
- ✅ **Explainable AI**: Giải thích chi tiết lý do dự đoán
- ✅ **Personalized Recommendations**: Khuyến nghị cá nhân hóa
- ✅ **Risk Tracking Dashboard**: Dashboard theo dõi rủi ro theo thời gian
- ✅ **Integration with EHR**: Tích hợp với hệ thống bệnh án điện tử

---

## 📚 Tài liệu tham khảo

[^1]: Bệnh viện Đa khoa Tâm Anh, "Đái tháo đường: Nguyên nhân, dấu hiệu, chẩn đoán, cách phân loại", Tam Anh Hospital, 07/06/2021, available: https://tamanhhospital.vn/dai-thao-duong/

[^2]: U.S. Centers for Disease Control and Prevention (CDC), "National Diabetes Statistics Report", Centers for Disease Control and Prevention, 15/05/2024, available: https://www.cdc.gov/diabetes/data/statistics-report/

[^3]: GeeksforGeeks, "What is Machine Learning?", GeeksforGeeks, 26/5/2024, available: https://www.geeksforgeeks.org/ml-machine-learning/

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
