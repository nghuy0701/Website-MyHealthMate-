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
- ✅ **Professional architecture** - Microservices với MongoDB Atlas cloud database
- ✅ **Real-time monitoring** - Lịch sử dự đoán & health tracking dashboard
- ✅ **Healthcare content** - Bài viết y khoa chuyên sâu
- ✅ **Admin dashboard** - Quản lý người dùng & nội dung toàn diện

---

## 📋 Mục lục

- [🎯 Tổng Quan](#-tổng-quan)
- [🚀 Quick Start](#-quick-start)
- [🤖 Machine Learning Models](#-machine-learning-models)
- [🔑 Tính Năng](#-tính-năng)
- [📁 Cấu Trúc Project](#-cấu-trúc-project)
- [🏗️ System & Socket Architecture (Realtime Chat)](#-system--socket-architecture-realtime-chat)
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

### Yêu Cầu Hệ Thống

- **Docker Desktop** 20.10+ ([Download](https://docker.com/)) - **BẮT BUỘC**
- **Git** ([Download](https://git-scm.com/))

### 🐳 3 Bước Chạy Ứng Dụng

#### **Bước 1: Clone Repository**

```bash
git clone https://github.com/nghuy0701/Website-MyHealthMate-.git
cd Website-MyHealthMate-
```

#### **Bước 2: Tạo File .env**

Tạo file `.env` ở thư mục root

#### **Bước 3: Chạy Docker**

```bash
# Khởi động tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Kiểm tra trạng thái
docker-compose ps
```

### 🌐 Truy Cập Ứng Dụng



### 🛑 Dừng Ứng Dụng

```bash
# Dừng tất cả services
docker-compose down

# Xóa cả dữ liệu (reset toàn bộ)
docker-compose down -v
```

### 🔧 Các Lệnh Hữu Ích

```bash
# Xem logs của 1 service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml-service

# Restart 1 service
docker-compose restart backend

# Rebuild khi sửa code
docker-compose up -d --build
```

---

## 🤖 Machine Learning Models

MyHealthMate sử dụng một **pipeline ML toàn diện** với **15+ thuật toán** khác nhau để dự đoán bệnh tiểu đường:

### 📊 Các Nhóm Mô Hình

#### 1. Mô Hình Tuyến Tính (4 mô hình)
- **Logistic Regression** ⭐ **(Mô hình Production)**
  - ROC-AUC: 0.844 (CV), 0.810 (Test)
  - Độ chính xác: 70.1%
  - Nhanh, ổn định, dễ giải thích
- **Ridge Classifier** - Hồi quy Ridge với chuẩn hóa L2
- **Linear Discriminant Analysis (LDA)** - Phân tích biệt thức tuyến tính
- **Quadratic Discriminant Analysis (QDA)** - Phân tích biệt thức bậc hai

#### 2. Mô Hình Cây Quyết Định (3 mô hình)
- **Random Forest** - Rừng cây quyết định ngẫu nhiên
- **Extra Trees** - Cây ngẫu nhiên cực đại
- **Decision Tree** - Cây quyết định đơn

#### 3. Mô Hình Boosting (2-5 mô hình)
- **Gradient Boosting** - Tăng cường gradient tuần tự
- **AdaBoost** - Tăng cường thích ứng
- **XGBoost** 🚀 - Tăng cường gradient cực đại (tùy chọn)
- **LightGBM** 🚀 - Tăng cường gradient nhẹ (tùy chọn)
- **CatBoost** 🚀 - Tăng cường phân loại (tùy chọn)

#### 4. Các Mô Hình Khác (4 mô hình)
- **Support Vector Machine (SVM)** - Máy vector hỗ trợ
- **K-Nearest Neighbors (KNN)** - K láng giềng gần nhất
- **Naive Bayes** - Phân loại xác suất Bayes
- **Neural Network (MLP)** - Mạng nơ-ron đa lớp

### 🎯 Quy Trình Lựa Chọn Mô Hình

1. **Tiền Xử Lý Dữ Liệu**
   - Xử lý giá trị 0 (thay thế bằng trung vị)
   - Chuẩn hóa đặc trưng (StandardScaler)
   - Cân bằng lớp dữ liệu (SMOTE/ADASYN - tùy chọn)

2. **Kiểm Định Chéo**
   - Chia 5 fold phân tầng (StratifiedKFold)
   - Các chỉ số: Độ chính xác, Precision, Recall, F1, ROC-AUC

3. **Tối Ưu Siêu Tham Số**
   - RandomizedSearchCV (100 lần lặp)
   - Tối ưu hóa theo điểm ROC-AUC

4. **Xuất Mô Hình**
   - Lưu mô hình tốt nhất dạng `.joblib`
   - Lưu scaler để tiền xử lý
   - Lưu metadata dạng JSON

### 📁 Cấu Trúc Thư Mục ML
```
ml-service/
├── models/
│   ├── diabetes_ml_pipeline.py              # Pipeline huấn luyện
│   ├── model_config.py                      # Cấu hình các mô hình
│   ├── diabetes_model_*.joblib              # Mô hình đã huấn luyện
│   ├── scaler_*.joblib                      # Scaler chuẩn hóa
│   ├── diabetes_predictor_*.py              # Mã nguồn production
│   └── model_metadata_*.json                # Thông tin & metrics mô hình
├── data/
│   └── pima_clean.csv                       # Dữ liệu đã làm sạch
├── notebooks/
│   ├── diabetes_model_training.ipynb        # Notebook huấn luyện
│   └── catboost_info/                       # CatBoost training info
├── readme_images/                           # Hình ảnh cho documentation
├── app.py                                   # API Flask
├── config.py                                # Cấu hình ML Service
├── utils.py                                 # Utility functions
└── requirements.txt                         # Python dependencies
```

---

## 📁 Cấu Trúc Project

```
Website-MyHealthMate-/
│
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       └── ci-cd.yml
│
├── .gitignore
├── .env                        # Local environment (not stored in repo)
├── docker-compose.yml          # Docker Compose orchestration
├── package-lock.json
├── SYSTEM_ARCHITECTURE.md      # Additional architecture documentation
├── Backend/                    # Backend Node.js (Express)
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── .babelrc
│   ├── .eslintrc.cjs
│   ├── .dockerignore
│   ├── postman/                # Postman collections & environments
│   └── src/
│       ├── configs/           # Configuration (DB, CORS, Session, Env)
│       ├── controllers/       # Controllers (admin, user, chat, etc.)
│       ├── middlewares/       # Middlewares (auth, rate-limit, upload)
│       ├── models/            # Mongoose models
│       ├── providers/         # External providers (MongoDB, Cloudinary)
│       ├── routes/            # API routes (v1)
│       ├── services/          # Business logic services
│       ├── utils/             # Utility helpers
│       ├── validations/       # Input validation schemas
│       ├── seedAssignDoctor.js
│       ├── seedDoctorAccount.js
│       └── server.js          # Entry point (Socket.IO init lives under src/configs)
│
├── Frontend/                   # Frontend React + Vite
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── nginx.conf
│   ├── vite.config.js
│   └── src/
│       ├── components/        # React components (ui, chat, pages...)
│       ├── pages/
│       ├── lib/               # api.js, auth context, socket hooks
│       └── styles/
│
├── ml-service/                # ML Service (Flask)
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── models/
│   ├── data/
│   └── notebooks/
│
└── README.md                  # Project documentation
```
---
## 🏗️ System & Socket Architecture (Realtime Chat)

### 1. Tổng quan Kiến trúc Hệ thống

**MyHealthMate** sử dụng kiến trúc microservices với 3 thành phần chính:

- **Frontend**: React + Vite, giao tiếp qua REST API và Socket.IO.
- **Backend**: Node.js (Express), cung cấp API RESTful, xác thực JWT, quản lý dữ liệu và Socket.IO cho realtime.
- **ML Service**: Python Flask, phục vụ dự đoán AI qua REST API.

Các thành phần được container hóa (Docker), giao tiếp qua mạng nội bộ Docker Compose.

### 2. Kiến trúc Realtime Chat & Socket.IO

#### a. Mô hình Socket.IO

- **Socket Server**: Khởi tạo tại `Backend/src/configs/socket.js`.
- **Rooms**: Mỗi user và mỗi cuộc trò chuyện (conversation/group) là một room riêng biệt.
- **Sự kiện chính**:
  - `message:new`: Gửi/nhận tin nhắn realtime.
  - `conversation:update`: Cập nhật thông tin nhóm, thành viên.
  - `user:online` / `user:offline`: Theo dõi trạng thái online của user.
  - `group:join` / `group:leave`: Quản lý thành viên nhóm.

#### b. Quy trình hoạt động

1. **Kết nối**: User đăng nhập, socket kết nối và join vào room cá nhân + các room nhóm.
2. **Gửi tin nhắn**: Emit `message:new` tới room conversation, tất cả thành viên nhận realtime.
3. **Cập nhật nhóm**: Khi có thay đổi (thêm/xóa thành viên, đổi tên), emit `conversation:update` tới room nhóm.
4. **Theo dõi online**: Khi user online/offline, emit tới tất cả room liên quan để cập nhật trạng thái.
5. **Quản lý nhóm**: Khi user rời nhóm, emit `group:leave` và cập nhật lại danh sách thành viên.

#### c. Đảm bảo ổn định & không mất dữ liệu

- Mỗi sự kiện chỉ emit tới đúng room (conversation hoặc user), tránh spam socket.
- Dữ liệu conversation và participant luôn được enrich (trả về đầy đủ thông tin user, avatar, role).
- Trạng thái online được cập nhật realtime qua Set onlineUsers trên frontend.
- UI cập nhật tức thì khi có sự kiện socket, không cần reload.

### 3. Mô hình dữ liệu & quản lý nhóm

- **Conversation**: Có thể là 1-1 hoặc group, lưu danh sách participant (userId, role, ...).
- **User**: Lưu thông tin cá nhân, trạng thái online/offline, avatar.
- **Message**: Lưu nội dung, sender, conversationId, timestamp.

### 4. Luồng realtime tiêu biểu

1. User đăng nhập → socket join các room liên quan.
2. Gửi tin nhắn → backend lưu DB, emit tới room → frontend nhận và update UI.
3. Thay đổi nhóm (thêm/xóa thành viên, đổi tên) → backend emit tới room → frontend update GroupInfoPanel.
4. User online/offline → backend emit tới các room → frontend update trạng thái online.

### 5. Ưu điểm kiến trúc

- **Realtime ổn định**: Không mất tin nhắn, không trùng lặp, không spam socket.
- **Mở rộng dễ dàng**: Thêm loại nhóm, phân quyền, hoặc các loại sự kiện mới.
- **Tách biệt rõ ràng**: Backend chỉ emit tới đúng room, frontend chỉ lắng nghe sự kiện cần thiết.
- **Dễ bảo trì**: Mỗi thành phần (socket, API, UI) tách biệt, dễ debug và mở rộng.

---

## 🔑 Tính Năng Chính

### Tính Năng Người Dùng
- 📝 **Đăng ký/Đăng nhập** - Xác thực tài khoản an toàn
- 👤 **Quản lý hồ sơ** - Cập nhật avatar, thông tin cá nhân
- 🔮 **Dự đoán tiểu đường** - Thực hiện test với 8 chỉ số sức khỏe
- 📊 **Lịch sử dự đoán** - Xem và theo dõi các kết quả trước đó
- 📚 **Đọc bài viết** - Truy cập kho bài viết y khoa chuyên sâu
- 💬 **Tương tác** - Bình luận và thảo luận về bài viết

### Tính Năng Quản Trị Viên
- 👥 **Quản lý người dùng** - Xem, sửa, xóa tài khoản người dùng
- 📄 **Quản lý bài viết** - Tạo, chỉnh sửa, xóa bài viết y tế
- ❓ **Quản lý câu hỏi** - Cập nhật bộ câu hỏi khảo sát
- 📈 **Dashboard thống kê** - Theo dõi số liệu hệ thống
- 🔐 **Xác thực nâng cao** - Đăng nhập qua email xác thực

---

**Huấn Luyện Mô Hình:**
```python
# Sử dụng pipeline để huấn luyện mô hình
from models.diabetes_ml_pipeline import DiabetesPredictionPipeline

# Khởi tạo pipeline
pipeline = DiabetesPredictionPipeline()

# Các bước huấn luyện
pipeline.load_data('data/pima_clean.csv')     # Tải dữ liệu
pipeline.preprocess_data()                     # Tiền xử lý
pipeline.define_models()                       # Định nghĩa mô hình
pipeline.train_and_evaluate_models()           # Huấn luyện & đánh giá
pipeline.optimize_best_model()                 # Tối ưu hóa
pipeline.save_best_model()                     # Lưu mô hình tốt nhất
```

---

## 📝 API Endpoints

### Xác Thực (Authentication)
- `POST /api/v1/users/register` - Đăng ký tài khoản người dùng mới
- `POST /api/v1/users/login` - Đăng nhập người dùng
- `POST /api/v1/users/logout` - Đăng xuất khỏi hệ thống
- `POST /api/v1/admin/login` - Đăng nhập quản trị viên

### Người Dùng (Users)
- `GET /api/v1/users/me` - Lấy thông tin người dùng hiện tại
- `PUT /api/v1/users/me` - Cập nhật thông tin cá nhân
- `POST /api/v1/users/me/avatar` - Tải lên ảnh đại diện
- `PUT /api/v1/users/me/change-password` - Thay đổi mật khẩu

### Dự Đoán (Predictions)
- `POST /api/v1/predictions` - Tạo dự đoán tiểu đường mới
- `GET /api/v1/predictions/user/:userId` - Xem lịch sử dự đoán của người dùng
- `GET /api/v1/predictions/:id` - Lấy thông tin chi tiết một dự đoán

### Bài Viết (Articles)
- `GET /api/v1/articles` - Lấy danh sách tất cả bài viết
- `GET /api/v1/articles/:id` - Xem chi tiết một bài viết
- `POST /api/v1/articles` - Tạo bài viết mới (Chỉ Admin)
- `PUT /api/v1/articles/:id` - Chỉnh sửa bài viết (Chỉ Admin)
- `DELETE /api/v1/articles/:id` - Xóa bài viết (Chỉ Admin)

### Câu Hỏi (Questions)
- `GET /api/v1/questions` - Lấy danh sách câu hỏi khảo sát
- `POST /api/v1/questions` - Tạo câu hỏi mới (Chỉ Admin)
- `PUT /api/v1/questions/:id` - Cập nhật câu hỏi (Chỉ Admin)
- `DELETE /api/v1/questions/:id` - Xóa câu hỏi (Chỉ Admin)

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
  <img src="https://lh3.googleusercontent.com/gg-dl/ABS2GSmQ88aHQjRZ9zgz6cWntNDuigrzr5VQZ3pQpD6QIAKew2QIF31-h5gae4l71PAtnDgmj_x1F3BbOKN5dlowzaYpYHJnqttHFFPb_EPuy4SAtnth8rOdEElAgyxUhPcroEC6Aa-1lncHlF-P5bx9WUYkwIOjY4fbUDGD4_FQ-aGlEm_QEw=s1024-rj?authuser=3" alt="BRFSS" width="400"/>
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
