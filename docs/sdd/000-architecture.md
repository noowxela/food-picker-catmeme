# Architecture

- **Repo:** `o000o_active/food-picker-catmeme` (GitHub: [noowxela/food-picker-catmeme](https://github.com/noowxela/food-picker-catmeme))
- **Status:** `draft`
- **Date:** 2026-09-22

## What this app is

A lunch picker. Locally the browser is an Express static site. In production the UI is static files on GitHub Pages. The API is a separate Express app using Mongoose.

## Runtime

| Piece | Local | Production |
| --- | --- | --- |
| Frontend | `frontend/` `npm start` on port 3100 | GitHub Pages: https://noowxela.github.io/food-picker-catmeme/ |
| Backend | `backend/` `npm run dev` on port 3000 | Render: https://food-picker-api.onrender.com |
| Database | Atlas `project-appxplore` | Same Atlas cluster |

Home, Restaurants, and History are separate HTML pages. `frontend/assets/js/foodPicker.js` runs only on Home. It calls `restaurants/randomRestaurants` and The Cat API, then paints `#catList` and `#restaurantTotal`.

Client config comes from `assets/js/config.js` (`window.API_BASE`, `window.CAT_API_KEY`). Locally Express generates that route from `.env`. On Pages, GitHub Actions writes the file from Secrets.

## Data

`project-appxplore` holds `restaurants`, `bookings`, `users`, and `tokens`. Cat photos are not stored. They come from `https://api.thecatapi.com/v1/images/search`.

Deploy steps: [`docs/deploy.md`](../deploy.md).  
Expanded architecture: [`docs/architecture.md`](../architecture.md).

Expanded overview (diagrams, API table, data model): [`docs/architecture.md`](../architecture.md).
