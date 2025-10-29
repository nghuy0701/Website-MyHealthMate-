# Diabetes Prediction API - Backend

Backend API cho hệ thống dự đoán bệnh tiểu đường sử dụng Node.js, Express và MongoDB.

## 🚀 Tính năng

- 👤 **Quản lý người dùng**: Đăng ký, đăng nhập, xác thực
- 🔮 **Dự đoán tiểu đường**: Dự đoán nguy cơ tiểu đường dựa trên các chỉ số sức khỏe
- 👨‍⚕️ **Quản lý bệnh nhân**: Bác sĩ có thể quản lý hồ sơ bệnh nhân
- 📊 **Thống kê**: Xem thống kê về các dự đoán
- 🔒 **Phân quyền**: Hỗ trợ 3 vai trò (Patient, Doctor, Admin)

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB >= 4.x
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone repository

```bash
cd Backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
NODE_ENV=development
PORT=5000
HOST=localhost

MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=diabetes_prediction_db

SESSION_SECRET=your-secret-key-here

WEBSITE_DOMAIN_DEVELOPMENT=http://localhost:3000
WEBSITE_DOMAIN_PRODUCTION=https://yourdomain.com

AUTHOR_NAME=Your Name
```

### 4. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy của bạn:

```bash
# Windows (nếu cài dịch vụ)
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 5. Chạy server

#### Development mode (với Babel + nodemon):
```bash
npm run dev
```

#### Production mode:
```bash
# Build project với Babel
npm run build

# Chạy production
npm run production
```

Server sẽ chạy tại `http://localhost:5000`

> **Note**: Project sử dụng Babel để transpile ES6+ code sang CommonJS

## 📚 API Endpoints

### 🔐 Authentication & Users

- `POST /v1/users/register` - Đăng ký người dùng mới
- `POST /v1/users/login` - Đăng nhập
- `POST /v1/users/logout` - Đăng xuất (cần auth)
- `GET /v1/users/me` - Lấy thông tin user hiện tại (cần auth)
- `GET /v1/users` - Lấy danh sách users (Admin only)
- `GET /v1/users/:id` - Lấy thông tin user theo ID (Admin only)
- `PUT /v1/users/:id` - Cập nhật thông tin user (cần auth)
- `DELETE /v1/users/:id` - Xóa user (Admin only)

### 🔮 Predictions

- `POST /v1/predictions` - Tạo dự đoán mới (cần auth)
- `GET /v1/predictions/my-predictions` - Lấy các dự đoán của mình (cần auth)
- `GET /v1/predictions/statistics` - Lấy thống kê (cần auth)
- `GET /v1/predictions/patient/:patientId` - Lấy dự đoán theo bệnh nhân (cần auth)
- `GET /v1/predictions` - Lấy tất cả dự đoán (Admin only)
- `GET /v1/predictions/:id` - Lấy dự đoán theo ID (cần auth)
- `PUT /v1/predictions/:id` - Cập nhật dự đoán (cần auth)
- `DELETE /v1/predictions/:id` - Xóa dự đoán (cần auth)

### 👥 Patients

- `POST /v1/patients` - Tạo bệnh nhân mới (Doctor only)
- `GET /v1/patients/my-patients` - Lấy danh sách bệnh nhân của mình (Doctor only)
- `GET /v1/patients` - Lấy tất cả bệnh nhân (Admin only)
- `GET /v1/patients/:id` - Lấy thông tin bệnh nhân (Doctor/Admin)
- `PUT /v1/patients/:id` - Cập nhật bệnh nhân (Doctor/Admin)
- `DELETE /v1/patients/:id` - Xóa bệnh nhân (Doctor/Admin)

### 💚 Health Check

- `GET /v1/health` - Kiểm tra trạng thái API

## 🏗️ Cấu trúc thư mục

```
Backend/
├── src/
│   ├── configs/          # Cấu hình (DB, CORS, Session)
│   │   ├── cors.js
│   │   ├── environment.js
│   │   ├── mongodb.js
│   │   └── session.js
│   ├── controllers/      # Controllers xử lý request
│   │   ├── index.js
│   │   ├── patientController.js
│   │   ├── predictionController.js
│   │   └── userController.js
│   ├── middlewares/      # Middlewares
│   │   ├── authMiddleware.js
│   │   ├── errorHandlingMiddleware.js
│   │   └── index.js
│   ├── models/           # Models & Database schemas
│   │   ├── index.js
│   │   ├── patientModel.js
│   │   ├── predictionModel.js
│   │   └── userModel.js
│   ├── routes/           # API Routes
│   │   └── v1/
│   │       ├── index.js
│   │       ├── patients.js
│   │       ├── predictions.js
│   │       └── users.js
│   ├── services/         # Business logic
│   │   ├── index.js
│   │   ├── patientService.js
│   │   ├── predictionService.js
│   │   └── userService.js
│   ├── utils/            # Utilities
│   │   ├── ApiError.js
│   │   ├── constants.js
│   │   └── formatter.js
│   └── server.js         # Entry point
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔑 Các vai trò (Roles)

- **patient**: Người dùng thông thường, có thể tạo dự đoán cho chính mình
- **doctor**: Bác sĩ, có thể quản lý bệnh nhân và tạo dự đoán cho bệnh nhân
- **admin**: Quản trị viên, có toàn quyền truy cập

## 📊 Input cho Prediction

Khi tạo dự đoán mới, cần cung cấp các thông tin sau:

```json
{
  "pregnancies": 2,
  "glucose": 120,
  "bloodPressure": 70,
  "skinThickness": 20,
  "insulin": 100,
  "bmi": 25.5,
  "diabetesPedigreeFunction": 0.5,
  "age": 30,
  "patientId": "optional-patient-id"
}
```

## 🧪 Testing API

Bạn có thể test API bằng:

- **Postman**: Import collection từ `/docs/postman` (nếu có)
- **cURL**: Xem examples trong `/docs/examples`
- **Thunder Client**: Extension của VS Code

### Ví dụ đăng ký user:

```bash
curl -X POST http://localhost:5000/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "Test123456",
    "fullName": "Test User",
    "role": "patient"
  }'
```

## 🔧 Scripts

- `npm run dev` - Chạy server ở development mode với Babel + nodemon (auto-reload)
- `npm run build` - Build project với Babel (transpile ES6+ → CommonJS)
- `npm run production` - Build và chạy production mode
- `npm start` - Chạy server từ dist/ (cần build trước)
- `npm run lint` - Kiểm tra code với ESLint

## 📝 License

MIT License

## 👨‍💻 Author

MyHealthMate Team

---

**Happy Coding! 🚀**
