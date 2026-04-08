# Standup Board

Standup Board is a lightweight team status tracker with a Flask API and a vanilla JavaScript frontend. Team members can post daily updates, browse standups by date, filter by member or keyword, and quickly identify blockers.

## Setup

1. Install Python dependencies:
   - `pip install flask flask-cors`
2. Install Node dev dependencies:
   - `npm install`
3. Start frontend + backend together:
   - `npm run dev`
4. Open the frontend at:
   - `http://127.0.0.1:3000`

Backend runs on `http://localhost:5000`.

## Branch Ownership (Example Team Split)

1. `feature/alice-backend-api`
   - `backend/app.py`
2. `feature/bob-backend-models-data`
   - `backend/models.py`
   - `backend/data.json`
3. `feature/carol-form-module`
   - `frontend/form.html`
   - `frontend/form.js`
4. `feature/dave-display-module`
   - `frontend/display.js`
   - `frontend/display.html`
5. `feature/eva-filters-calendar`
   - `frontend/filters.js`
   - `frontend/calendar.js`
6. `feature/frank-shell-styles-docs`
   - `frontend/index.html`
   - `frontend/styles.css`
   - `package.json`
   - `README.md`

## API Contract

### `POST /api/update`
- Request body JSON:
  - `{ "name": string, "did": string, "willdo": string, "blockers": string, "date": "YYYY-MM-DD" }`
- Behavior:
  - Appends a new record to `backend/data.json`
- Response:
  - `{ "success": true }`

### `GET /api/updates?date=YYYY-MM-DD`
- Query parameter:
  - `date` optional, defaults to today's date
- Response:
  - Array of updates for that date

### `GET /api/dates`
- Response:
  - Array of unique dates that have at least one standup entry

### `GET /api/updates/all`
- Response:
  - Array of all updates sorted by date descending

## Custom Events (Frontend Module Communication)

- `standupSubmitted`
  - Dispatched by `form.js` when a standup is posted successfully
  - Listened to by `display.js` and `calendar.js`
- `filterChange`
  - Dispatched by `filters.js` with detail:
  - `{ member, keyword, blockersOnly }`
  - Listened to by `display.js`
- `dateSelect`
  - Dispatched by `calendar.js` with detail:
  - `{ date: "YYYY-MM-DD" }`
  - Listened to by `display.js`
