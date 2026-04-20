"use client";

import { FormEvent, useMemo, useState } from "react";

type Pollutant = {
  name: string;
  aqi: number;
  concentration: number;
};

type AQIResponse = {
  city: string;
  overall_aqi: number | null;
  category: string;
  description: string;
  pollutants: Pollutant[];
};

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const CITY_SUGGESTIONS = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Bhopal",
  "Chandigarh",
  "Amritsar",
  "Patna",
  "Ranchi",
  "Bhubaneswar",
  "Guwahati",
  "Srinagar",
  "Dehradun",
  "Noida",
  "Gurugram",
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "San Francisco",
  "Toronto",
  "Vancouver",
  "London",
  "Paris",
  "Berlin",
  "Madrid",
  "Rome",
  "Dubai",
  "Singapore",
  "Tokyo",
  "Seoul",
  "Sydney",
  "Melbourne",
];

export default function AQIChatbot() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AQIResponse | null>(null);
  const matchingCities = useMemo(() => {
    const query = city.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }
    return CITY_SUGGESTIONS.filter((cityName) => cityName.toLowerCase().includes(query)).slice(0, 8);
  }, [city]);

  const chartData = useMemo(() => {
    if (!result) {
      return [];
    }
    const pollutants = result.pollutants.filter((item) => item.aqi > 0).slice(0, 6);
    if (pollutants.length > 0) {
      return pollutants;
    }
    if (result.overall_aqi && result.overall_aqi > 0) {
      return [{ name: "Overall AQI", aqi: result.overall_aqi, concentration: 0 }];
    }
    return [];
  }, [result]);

  const totalAqi = chartData.reduce((sum, item) => sum + item.aqi, 0);
  const pieGradient = useMemo(() => {
    if (chartData.length === 0 || totalAqi <= 0) {
      return "conic-gradient(#e2e8f0 0% 100%)";
    }

    let cursor = 0;
    const colorStops = chartData.map((item, index) => {
      const color = PIE_COLORS[index % PIE_COLORS.length];
      const start = cursor;
      const end = cursor + (item.aqi / totalAqi) * 100;
      cursor = end;
      return `${color} ${start}% ${end}%`;
    });

    return `conic-gradient(${colorStops.join(", ")})`;
  }, [chartData, totalAqi]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setError("Please enter a city name.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/aqi?city=${encodeURIComponent(trimmedCity)}`);
      const payload = (await response.json()) as AQIResponse | { error?: string };

      if (!response.ok) {
        const message = "error" in payload && payload.error ? payload.error : "Unable to fetch AQI data.";
        throw new Error(message);
      }

      setResult(payload as AQIResponse);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Air Quality Assistant</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter a city to get a text explanation of the air quality and a pie-chart breakdown.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            list="city-suggestions"
            autoComplete="off"
            placeholder="Enter city name (e.g. Delhi)"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <datalist id="city-suggestions">
            {matchingCities.map((cityName) => (
              <option key={cityName} value={cityName} />
            ))}
          </datalist>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Checking..." : "Check AQI"}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">Type at least 2 characters to see city suggestions.</p>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        {result ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xl font-semibold text-slate-900">{result.city}</h3>
              <p className="mt-2 text-sm text-slate-700">
                Overall AQI:{" "}
                <span className="font-semibold">
                  {result.overall_aqi !== null ? `${result.overall_aqi}` : "Unavailable"}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Category: <span className="font-semibold">{result.category}</span>
              </p>
              <p className="mt-3 text-sm text-slate-600">{result.description}</p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">Pollutant AQI Pie Chart</h3>
              <div className="mt-4 flex items-center gap-5">
                <div
                  className="h-40 w-40 rounded-full border border-slate-200"
                  style={{ background: pieGradient }}
                  aria-label="AQI pollutant pie chart"
                />
                <ul className="space-y-2 text-xs text-slate-700">
                  {chartData.map((item, index) => {
                    const percentage = totalAqi > 0 ? ((item.aqi / totalAqi) * 100).toFixed(1) : "0.0";
                    return (
                      <li key={item.name} className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span>
                          {item.name}: {item.aqi} AQI ({percentage}%)
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
