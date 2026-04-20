# AQI Report (Frontend + Backend)

Full-stack AQI chatbot project that takes a **city name** and returns:

- Air quality summary (AQI value, category, health description)
- Pollutant-wise AQI breakdown
- Pie-chart style visualization in the frontend

## Project structure

```text
AQI/
  backend/   # FastAPI + Uvicorn AQI API
  frontend/  # Next.js UI
```

## Backend setup

1. Go to backend folder:
   ```bash
   cd backend
   ```
2. Ensure `.env` has:
   ```env
   api_url=https://api.api-ninjas.com/v1/airquality
   api_key=YOUR_API_KEY
   HOST=127.0.0.1
   PORT=8000
   CORS_ORIGINS=https://aqi-report.vercel.app,http://localhost:3000,http://127.0.0.1:3000
   ```
3. Install dependencies:
   ```bash
   .\venv\Scripts\python.exe -m pip install -r requirements.txt
   ```
4. Run backend:
   ```bash
   .\venv\Scripts\python.exe main.py
   ```

   or with uvicorn directly:
   ```bash
   .\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```

API endpoints:

- `GET /health`
- `GET /aqi?city=Delhi`

## Frontend setup

1. Go to frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) set backend URL in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
   ```
4. Run frontend:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## Render deployment (backend)

Use this start command:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Do **not** point Render to `backend.main:main` unless using `--factory`.

Set Render environment variable:

```env
CORS_ORIGINS=https://aqi-report.vercel.app
```
