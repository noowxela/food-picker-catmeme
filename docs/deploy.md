# Deploy notes

Public demo layout:

| Piece | Host |
| --- | --- |
| UI | GitHub Pages — https://noowxela.github.io/food-picker-catmeme/ |
| API | Render Web Service from [`render.yaml`](../render.yaml) |
| DB | MongoDB Atlas (`project-appxplore`) |

## 1. Backend on Render

1. Open [Render Blueprints](https://dashboard.render.com/blueprints) and connect `noowxela/food-picker-catmeme`.
2. Apply [`render.yaml`](../render.yaml). Set `MONGODB_URL` to the Atlas connection string for `project-appxplore`.
3. In Atlas Network Access, allow Render (or `0.0.0.0/0` for a free demo).
4. After deploy, confirm `GET https://<service>.onrender.com/v1/restaurants` returns JSON.
5. Free plan sleeps when idle; the first request after sleep is slow.

Local production-style start:

```bash
cd backend
NODE_ENV=production yarn start:render
```

## 2. Frontend on GitHub Pages

1. Repo Settings → Pages → Source: **GitHub Actions**.
2. Add Actions secrets:
   - `API_BASE` — e.g. `https://food-picker-catmeme-api.onrender.com/v1/`
   - `CAT_API_KEY` — The Cat API key
3. Push to `main` (or run the **Deploy GitHub Pages** workflow).
4. Site URL: https://noowxela.github.io/food-picker-catmeme/

Local static build:

```bash
cd frontend
API_BASE=https://YOUR-API.onrender.com/v1/ CAT_API_KEY=xxx npm run build:static
```

## 3. Local Express UI (optional)

```bash
cd frontend
# .env: PORT=3100, API_BASE=http://localhost:3000/v1/, CAT_API_KEY=...
npm start
```
