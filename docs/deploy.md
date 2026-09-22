# Deploy notes

Public demo layout:

| Piece | Host |
| --- | --- |
| UI | GitHub Pages — https://noowxela.github.io/food-picker-catmeme/ |
| API | Render — https://food-picker-api.onrender.com |
| DB | MongoDB Atlas (`project-appxplore`) |

## 1. Backend on Render

1. Open [Render Blueprints](https://dashboard.render.com/blueprints) and connect `noowxela/food-picker-catmeme`, **or** use the live service already created:
   - Dashboard: https://dashboard.render.com/web/srv-dap55e8ae00c73946jtg
   - URL: https://food-picker-api.onrender.com
2. Env already set for Atlas `project-appxplore`. If you recreate the service, set `MONGODB_URL` and `NODE_VERSION=20.18.1`.
3. In Atlas Network Access, allow Render (or `0.0.0.0/0` for a free demo).
4. Confirm `GET https://food-picker-api.onrender.com/v1/restaurants` returns JSON.
5. Free plan sleeps when idle; the first request after sleep is slow.
6. For push-to-deploy: in Render, connect the GitHub app to this repo (logs may say “don't have access” until that is done). Until then, redeploy from the Render dashboard after pushes.

Local production-style start:

```bash
cd backend
NODE_ENV=production yarn start:render
```

## 2. Frontend on GitHub Pages

1. Repo Settings → Pages → Source: **GitHub Actions**.
2. Add Actions secrets:
   - `API_BASE` — `https://food-picker-api.onrender.com/v1/`
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
