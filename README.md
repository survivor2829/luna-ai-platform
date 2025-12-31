# Luna AI Platform

A full-stack AI platform built with FastAPI and React.

## Tech Stack

- **Backend**: Python FastAPI + SQLite
- **Frontend**: React + Tailwind CSS + Vite

## Project Structure

```
luna-ai-platform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI application
│   │   ├── database.py     # SQLite configuration
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── routers/        # API routes
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
