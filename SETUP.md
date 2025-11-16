# 🚀 Hướng dẫn Setup Project - MyHealthMate

## ⚠️ QUAN TRỌNG: Sau khi clone về máy mới

### Bước 1: Clone Repository
```bash
git clone https://github.com/nghuy0701/Website-MyHealthMate-.git
cd Website-MyHealthMate-
```

### Bước 2: Cấu hình Environment Variables

#### Backend
```bash
cd Backend
cp .env.example .env
```
Sau đó **BẮT BUỘC** sửa file `.env` với thông tin thực tế:
- `MONGODB_URI`: Connection string MongoDB Atlas của bạn
- `SESSION_SECRET`: Một chuỗi bí mật ngẫu nhiên
- `CLOUDINARY_URL`: URL Cloudinary (nếu cần upload ảnh)
- `ADMIN_SECRET_KEY`: Key bí mật cho admin

#### Frontend
```bash
cd ../Frontend
cp .env.example .env
```
File `.env` mặc định đã đủ cho development.

#### ML Service
```bash
cd ../ml-service
cp .env.example .env
```
File `.env` mặc định đã đủ.

### Bước 3: Cài đặt Dependencies

#### Backend (Node.js)
```bash
cd Backend
yarn install
```

#### Frontend (React)
```bash
cd ../Frontend
npm install
```

#### ML Service (Python)
```bash
cd ../ml-service

# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Cài đặt packages
pip install -r requirements.txt
```

### Bước 4: Chạy ứng dụng

**Mở 3 terminal riêng biệt:**

#### Terminal 1 - Backend
```bash
cd Backend
yarn dev
```
✅ Backend chạy tại: http://localhost:8017

#### Terminal 2 - Frontend
```bash
cd Frontend
npm run dev
```
✅ Frontend chạy tại: http://localhost:3000

#### Terminal 3 - ML Service
```bash
cd ml-service
# Activate venv trước (nếu chưa activate)
venv\Scripts\activate
python app.py
```
✅ ML Service chạy tại: http://localhost:5001

### Bước 5: Kiểm tra

1. Truy cập http://localhost:3000
2. Đăng ký tài khoản mới
3. Thử chức năng dự đoán

## ❌ Xử lý lỗi thường gặp

### Lỗi: "Cannot find module"
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
yarn install
```

### Lỗi: "MongoDB connection failed"
- Kiểm tra `MONGODB_URI` trong file `.env`
- Đảm bảo IP máy bạn được whitelist trong MongoDB Atlas
- Kiểm tra username/password đúng chưa

### Lỗi: "Cloudinary upload failed"
- Kiểm tra `CLOUDINARY_URL` trong file `.env`
- Format phải là: `cloudinary://api_key:api_secret@cloud_name`

### Lỗi: "ML Service unavailable"
- Đảm bảo ML Service đang chạy (python app.py)
- Kiểm tra port 5001 không bị chiếm bởi app khác
- Backend sẽ tự động dùng fallback prediction nếu ML Service down

### Lỗi: Port đã được sử dụng
```bash
# Windows
netstat -ano | findstr :8017
taskkill /F /PID <PID>

# Mac/Linux
lsof -ti:8017 | xargs kill -9
```

## 📦 Cấu trúc Project sau khi setup

```
Website-MyHealthMate/
├── Backend/
│   ├── node_modules/     ✅ Tự động tạo sau yarn install
│   ├── .env              ✅ Tự tạo từ .env.example
│   └── ...
├── Frontend/
│   ├── node_modules/     ✅ Tự động tạo sau npm install
│   ├── .env              ✅ Tự tạo từ .env.example
│   └── ...
└── ml-service/
    ├── venv/             ✅ Tự tạo virtual environment
    ├── .env              ✅ Tự tạo từ .env.example
    └── ...
```

## 🔧 Scripts hữu ích

### Backend
- `yarn dev` - Chạy development mode (auto-reload)
- `yarn build` - Build production
- `yarn start` - Chạy production build
- `yarn lint` - Check code style

### Frontend
- `npm run dev` - Chạy development server

### ML Service
- `python app.py` - Chạy Flask server
- `python models/diabetes_ml_pipeline.py` - Train lại model

## 📞 Cần trợ giúp?

- Kiểm tra file `README.md` để biết thêm chi tiết
- Mở issue trên GitHub nếu gặp lỗi
- Email: jwyy2005@gmail.com

---

**Lưu ý:** File `.env` chứa thông tin nhạy cảm, **KHÔNG BAO GIỜ** commit lên GitHub!
