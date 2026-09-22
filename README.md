# Food Picker Catmeme

Lunch picker for deciding where to eat. Hover a cat card to see a restaurant, choose lunch, manage the restaurant list, and browse history.

Built from the Appxplore interview brief (`instructions.md`).

## Stack

| Piece | Tech |
| --- | --- |
| Frontend | HTML, jQuery, Bootstrap 5, Express static server (local) |
| Backend | Express, Mongoose |
| Database | MongoDB Atlas |
| Cat photos | [The Cat API](https://thecatapi.com/) |

## Live demo

| Piece | URL |
| --- | --- |
| UI | https://noowxela.github.io/food-picker-catmeme/ |
| API | https://food-picker-api.onrender.com |

Render free tier sleeps when idle; the first API request after sleep can be slow.

## Repo layout

```text
frontend/     UI (pages, assets, local Express app)
backend/      REST API under /v1
docs/         Deploy notes and SDDs
render.yaml   Render blueprint for the API
.github/      GitHub Pages deploy workflow
```

## Run locally

Needs Node 24 LTS for the backend.

### 1. Backend

```bash
cd backend
cp .env.example .env   # if you do not already have .env
# Set NODE_ENV=development, PORT=3000, MONGODB_URL, JWT_* fields
npm install
npm run dev
```

API: http://localhost:3000/v1/

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # if you do not already have .env
# PORT=3100
# API_BASE=http://localhost:3000/v1/
# CAT_API_KEY=<your key>
npm install
npm start
```

UI: http://localhost:3100

| Page | Path |
| --- | --- |
| Home (random picker) | `/` or `/home` |
| Restaurants | `/restaurants` |
| History | `/history` |

## Features

- Random restaurants with cat images; last draw kept in `sessionStorage` when you leave Home
- Refresh cats (max 3 clicks per rolling 20 seconds)
- Choose lunch → detail modal with Google Maps embed + history booking
- Restaurant CRUD, filters, centered pagination top and bottom
- Dark theme only

## Deploy

Full steps: [`docs/deploy.md`](docs/deploy.md)

- **API:** Render Web Service (`food-picker-api`), Node 24 LTS, Atlas `project-appxplore` (MongoDB 8.0)
- **UI:** GitHub Pages via `.github/workflows/pages.yml`  
  Repository secrets: `API_BASE`, `CAT_API_KEY`  
  Pages source: GitHub Actions

```bash
# Local static build (same as CI)
cd frontend
API_BASE=https://food-picker-api.onrender.com/v1/ CAT_API_KEY=xxx npm run build:static
```

## Design notes

- Architecture overview: [`docs/architecture.md`](docs/architecture.md)
- Product change write-ups: [`docs/sdd/`](docs/sdd/)
- Deploy: [`docs/deploy.md`](docs/deploy.md)