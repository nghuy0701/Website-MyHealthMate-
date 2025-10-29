# Website MyHealthMate - Diabetes Prediction System

Full-stack web application for diabetes risk prediction using Machine Learning.

## Tech Stack

### Backend
- Node.js + Express
- MongoDB
- Session-based Authentication

### ML Service
- Python + Flask
- scikit-learn (Logistic Regression)
- Model accuracy: ~77%

## Quick Start

### 1. Backend
```bash
cd Website-MyHealthMate/Backend
npm install
npm run dev
```

### 2. ML Service
```bash
cd Website-MyHealthMate/ml-service
pip install -r requirements.txt
python app.py
```

## API Endpoints

### Backend (Port 5000)
- `/v1/users/*` - User management
- `/v1/patients/*` - Patient records
- `/v1/predictions/*` - Diabetes predictions
- `/v1/ml/*` - ML service integration

### ML Service (Port 5001)
- `GET /health` - Health check
- `GET /info` - Model info
- `POST /predict` - Make prediction

## Project Structure

```
Website-MyHealthMate/
├── Backend/          # Node.js API server
└── ml-service/       # Python Flask ML service
```

## License

MIT
