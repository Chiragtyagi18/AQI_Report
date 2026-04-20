import os
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

load_dotenv()

API_URL = os.getenv("api_url", "").strip('"')
API_KEY = os.getenv("api_key", "").strip('"')
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

app = FastAPI(title="AQI Backend API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

AQI_BANDS: list[tuple[int, str, str]] = [
    (50, "Good", "Air quality is healthy for most people."),
    (100, "Moderate", "Air quality is acceptable, but sensitive people may notice mild effects."),
    (
        150,
        "Unhealthy for Sensitive Groups",
        "Children, older adults, and people with respiratory issues should limit prolonged outdoor activity.",
    ),
    (200, "Unhealthy", "Everyone may begin to experience health effects with longer exposure."),
    (300, "Very Unhealthy", "Health alert: the risk of health effects is increased for everyone."),
    (500, "Hazardous", "Emergency conditions: avoid outdoor exposure if possible."),
]


def aqi_feedback(aqi: int | None) -> tuple[str, str]:
    if aqi is None:
        return ("Unknown", "AQI data is unavailable for this city at the moment.")
    for max_value, category, message in AQI_BANDS:
        if aqi <= max_value:
            return (category, message)
    return ("Hazardous", "Emergency conditions: avoid outdoor exposure if possible.")


def as_number(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    return None


def extract_pollutants(api_payload: dict[str, Any]) -> list[dict[str, float | str]]:
    pollutants: list[dict[str, float | str]] = []
    for pollutant_name, pollutant_data in api_payload.items():
        if not isinstance(pollutant_data, dict):
            continue

        pollutant_aqi = as_number(pollutant_data.get("aqi"))
        pollutant_concentration = as_number(pollutant_data.get("concentration"))

        if pollutant_aqi is None:
            continue

        pollutants.append(
            {
                "name": pollutant_name.upper(),
                "aqi": round(pollutant_aqi, 2),
                "concentration": round(pollutant_concentration, 4) if pollutant_concentration is not None else 0.0,
            }
        )

    pollutants.sort(key=lambda pollutant: float(pollutant["aqi"]), reverse=True)
    return pollutants


def get_air_quality(city: str, api_key: str, api_url: str) -> dict[str, Any]:
    if not api_key or not api_url:
        raise ValueError("API credentials are missing in backend/.env")

    response = requests.get(
        api_url,
        params={"city": city},
        headers={"X-Api-Key": api_key},
        timeout=20,
    )

    if response.status_code != 200:
        raise RuntimeError(f"AQI provider error: {response.status_code} - {response.text}")

    payload = response.json()
    if not isinstance(payload, dict):
        raise RuntimeError("Unexpected AQI provider response format.")

    pollutants = extract_pollutants(payload)
    overall_value = as_number(payload.get("overall_aqi"))
    overall_aqi = int(round(overall_value)) if overall_value is not None else None

    if overall_aqi is None and pollutants:
        overall_aqi = int(round(float(pollutants[0]["aqi"])))

    category, description = aqi_feedback(overall_aqi)

    return {
        "city": city,
        "overall_aqi": overall_aqi,
        "category": category,
        "description": description,
        "pollutants": pollutants,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/aqi")
def aqi(city: str = Query(..., description="City name to fetch AQI for")) -> dict[str, Any]:
    normalized_city = city.strip()
    if not normalized_city:
        raise HTTPException(status_code=400, detail="Query parameter 'city' is required.")

    try:
        return get_air_quality(normalized_city, API_KEY, API_URL)
    except ValueError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except requests.RequestException as error:
        raise HTTPException(status_code=502, detail=f"Could not reach AQI provider: {error}") from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


def main() -> None:
    uvicorn.run("main:app", host=HOST, port=PORT, reload=False, workers=1)


if __name__ == "__main__":
    main()
