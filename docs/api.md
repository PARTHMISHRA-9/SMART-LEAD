# API

`GET /api/health` reports service health.

`GET /api/metrics`, `GET /api/vacancies?strategy=BALANCED`, and `GET /api/timeline` support the core cockpit.

`GET /api/war-room` returns deterministic executive metrics and ranked risk records. `GET /api/vacancy-radar` includes a predictive risk score and next best action for every vacancy.

`POST /api/pitch/generate` accepts `siteId`, `customerId`, `channel`, and `tone`. `POST /api/config/reference-date` accepts a `YYYY-MM-DD` `date`.
