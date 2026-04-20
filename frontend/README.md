# AQI Chat Bot (Frontend)

Next.js frontend for an AQI chatbot. Enter a city and the UI shows:

- Overall AQI value
- AQI category and health description
- Pollutant contribution in pie-chart form

## Run frontend

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Backend connection

Frontend calls `http://127.0.0.1:8000/aqi` by default.  
To change it, set:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```
