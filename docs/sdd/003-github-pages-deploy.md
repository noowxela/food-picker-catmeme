# SDD: GitHub Pages + Render deploy

- **Repo:** `o000o_active/food-picker-catmeme`
- **Status:** `implemented`
- **Date:** 2026-09-22
- **Related:** `docs/sdd/000-architecture.md`, approved plan GH Pages hosting

## 1. Context / current architecture

The UI is an Express static site (`frontend/app.js`, port 3100) with no bundler. Client scripts hardcode `http://localhost:3000/v1/`. The Cat API key is injected by `GET /assets/js/config.js`. The API is Express + Mongoose on port 3000 and needs Atlas. Git remotes currently point at GitLab. GitHub Pages is static-only.

## 2. Problem and non-goals

**Problem:** Publish a public demo. GitHub Pages cannot run Node or Mongo.

**Non-goals:** Moving to React/Vite, serverless API rewrite, custom domain, paid always-on hosting.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Host layout? | GitHub Pages (UI) + Render free Web Service (API) + existing Atlas |
| Accept Render free cold starts? | Yes (plan default) |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:**

1. Generate `window.API_BASE` and `window.CAT_API_KEY` from `config.js` (local Express or CI).
2. Use root-relative-free asset and nav paths so a flat static publish works under `/food-picker-catmeme/`.
3. Add a static site build script and GitHub Actions workflow that writes `config.js` from Secrets and deploys to Pages.
4. Add `render.yaml` and a production start command; deploy the API to Render with Atlas env vars.

**Pros:** Matches the ask; free tiers; Atlas already holds data.

**Cons / risks:** Render free sleeps; Cat API key remains public in the browser; project-page base path must stay correct.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Pages only | No API or Mongo |
| Vercel/Netlify for both as primary | Plan chose Pages + Render |

## 5. Acceptance criteria and verification

- [x] No hardcoded `localhost:3000` as the only base; `API_BASE` comes from config (localhost is fallback only).
- [x] Local Express still serves Home / Restaurants / History and `config.js`.
- [x] Static build produces a folder suitable for project Pages (`index.html`, `restaurants.html`, `history.html`, `assets/`).
- [x] GitHub Action builds and deploys that folder; Secrets supply `CAT_API_KEY` and `API_BASE`.
- [x] Render blueprint / start path runs `NODE_ENV=production` against Atlas; smoke-test after service is live.
- [x] Architecture doc lists production hosts.

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-09-22 | approved | User approved the GH Pages + Render plan; implement next. |
| 2026-09-22 | implemented | Static build, Pages workflow, render.yaml, deploy docs. |
