# Architecture

The platform is a React/Vite single-page cockpit backed by an Express REST API. The backend reads the committed CSV demo dataset through `dataLoader`, detects unfilled 90-day inventory through `vacancyEngine`, ranks customers through `scoringEngine`, and produces factual pitches through `pitchEngine`.

`intelligenceEngine` adds deterministic Vacancy Radar and Revenue War Room calculations. It is explicitly rule-based: the same CSV data, reference date, and strategy produce the same result.

The frontend uses `src/services/api.js` for request timeout, one retry for transient failures, API errors, and its configurable `VITE_API_BASE_URL`.
