# MyHealthMate - Quick Start Guide

## 📁 Project Structure
```
Website-MyHealthMate/
├── .env                    # ✅ SHARED environment variables (DO NOT COMMIT)
├── .env.example           # Template for .env
├── Backend/               # Node.js + Express API
├── Frontend/              # React + Vite
├── ml-service/           # Python Flask ML API
└── README.md
```

## 🚀 Quick Start

### 1️⃣ Environment Setup

Copy the example env file and configure:
```bash
cp .env.example .env
```

Then edit `.env` and fill in your values:
- MongoDB connection string
- Session secret
- Other API keys (optional)

**Note**: All services (Backend, Frontend, ML) will use this **single .env file** from root.

### 2️⃣ Install Dependencies

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd Frontend
npm install
```

**ML Service:**
```bash
cd ml-service
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3️⃣ Run Services

Open **3 separate terminals**:

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
```
✅ Running on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```
✅ Running on: http://localhost:3000 (or next available port)

**Terminal 3 - ML Service:**
```bash
cd ml-service
# Activate venv first
python app.py
```
✅ Running on: http://localhost:5001

### 4️⃣ Access Application

🌐 **Frontend**: http://localhost:3000  
📡 **Backend API**: http://localhost:5000/api/v1  
🤖 **ML Service**: http://localhost:5001

## 📝 Environment Variables Explained

### Backend Variables
- `MONGODB_URI`: MongoDB Atlas connection string
- `DATABASE_NAME`: Database name
- `SESSION_SECRET`: Secret key for session encryption
- `APP_PORT`: Backend server port (default: 5000)
- `ML_SERVICE_URL`: ML service endpoint

### Frontend Variables
- `VITE_API_URL`: Backend API URL (with /api/v1)
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Version number

### ML Service Variables
- `ML_PORT`: ML server port (default: 5001)
- `ML_MODEL_PATH`: Path to trained model file

## 🔐 Create Admin Account

After Backend is running, create admin via:

**Method 1: Script**
```bash
cd Backend
node scripts/create-admin.js
```

**Method 2: API (Postman)**
```
POST http://localhost:5000/api/v1/admin/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123456",
  "userName": "admin_master",
  "displayName": "Administrator"
}
```

**Method 3: Frontend UI**
Go to: http://localhost:3000/admin/register

## 📚 API Documentation

Import Postman collection from:
```
Backend/postman/MyHealthMate-API.postman_collection.json
```

## 🛠️ Development Commands

**Backend:**
- `npm start` - Start server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm test` - Run tests

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## 📖 Architecture

```
Frontend (React + Vite)
    ↓ HTTP requests with cookies
Backend (Node.js + Express)
    ↓ Session-based auth
MongoDB Atlas (Database)
    
Backend → ML Service (Python Flask)
    ↓ Diabetes prediction
Trained ML Model
```

## ⚠️ Important Notes

1. **Never commit `.env` file** - It contains sensitive data
2. All 3 services must be running for full functionality
3. MongoDB Atlas connection required
4. Default ports: Backend=5000, Frontend=3000, ML=5001
5. CORS is configured to allow Frontend-Backend communication

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Find process using port
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process_id> /F
```

**CORS errors:**
- Check `WEBSITE_DOMAIN_DEV` in `.env` matches Frontend URL
- Ensure Backend CORS config allows Frontend origin

**Session not persisting:**
- Check cookies in browser DevTools
- Verify `credentials: 'include'` in Frontend API calls

## 👥 Team

**Author**: MyHealthMate Team  
**Repository**: https://github.com/nghuy0701/Website-MyHealthMate-

## 📄 License

MIT License
