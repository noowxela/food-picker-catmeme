# SDD: Backend dependency and Node upgrade

- **Repo:** `o000o_active/food-picker-catmeme`
- **Status:** `approved`
- **Date:** 2026-09-23
- **Related:** `docs/sdd/000-architecture.md`, `docs/architecture.md`, Render service `food-picker-api`

## 1. Context / current architecture

[`backend/package.json`](../../backend/package.json) is an old Express boilerplate:

| Item | Today | Latest (npm / nodejs.org, 2026-09-23) |
| --- | --- | --- |
| Node (engines / `.node-version`) | `20.x` / `20.18.1` | Current **26.10.0**, LTS **24.21.0** |
| mongoose | `^5.7.7` | **9.10.1** |
| express | `^4.17.1` | **5.2.1** |
| jsonwebtoken | `^8.5.1` | newer majors available |
| Connect options | `useCreateIndex`, `useNewUrlParser`, `useUnifiedTopology` | Removed in modern mongoose |

Atlas already runs a modern free cluster (`Cluster0`, MongoDB 8.x). Cat-card JWT crash on Render previously happened on **Node 26** with the **old** `buffer-equal-constant-time` / `jwa` stack; upgrading packages is required before moving past Node 20.

Lunch UI only needs `/v1/restaurants*` (unauthenticated). Auth/user routes are unused by the frontend but still in the tree.

## 2. Problem and non-goals

**Problem:** Dependencies and Node are years behind; user wants packages, Node, and Mongo-related stack on latest.

**Non-goals:** Rewriting to TypeScript, dropping the boilerplate auth routes, changing API paths for the UI, migrating off Atlas.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Node **26 Current** or **24 LTS**? (26 is “latest”; 24 is safer on Render) | **24 LTS** |
| Upgrade **Atlas cluster** MongoDB version in the Atlas UI too, or only Node `mongoose`/driver? | **Both** |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach (after answers):**

1. Set Node via `.node-version`, `engines.node`, Render `NODE_VERSION`, and Dockerfile base image to the chosen major.
2. Bump runtime deps to current majors with `npm install pkg@latest` (express, mongoose, jwt, passport, joi, helmet, etc.) and refresh `package-lock.json`.
3. Fix mongoose connect: drop deprecated options in `src/config/config.js`; adjust plugins/models if mongoose 8/9 APIs require it (`SchemaTypes`, pagination plugin, toJSON).
4. Fix any Express 5 / middleware breaks if Express 5 is included.
5. Replace or remove dead packages that block Node 26 (e.g. outdated jwt helpers). Prefer dropping `xss-clean` if unmaintained and use a maintained alternative or helmet-only if needed.
6. Smoke-test locally: `npm run dev`, `GET /v1/restaurants`, random + chooseVisit.
7. Push; redeploy Render; confirm production `/v1/restaurants`.
8. If Atlas server upgrade was requested: document/click Atlas major upgrade separately (not an npm change).

**Pros:** Security patches; Node 26 compatible after JWT stack refresh; matches “latest” ask.

**Cons / risks:**

- mongoose 5 → 9 and express 4 → 5 are large; tests/`paginate` plugin may break.
- Render cold start + free plan still apply.
- Atlas major upgrade can require downtime / compatibility checks.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Only bump patch versions | Does not meet “latest” or fix Node 26 |
| Stay on mongoose 5 + Node 20 | Blocks the request |

## 5. Acceptance criteria and verification

- [ ] `backend/package.json` + lockfile use current majors for core deps (express, mongoose, jwt stack at minimum).
- [ ] Node pin matches the chosen major in `.node-version`, `engines`, Render env / docs.
- [ ] Deprecated mongoose connect flags removed; app boots against Atlas.
- [ ] Local: `GET /v1/restaurants` and Home random/choose flows work.
- [ ] Render: deploy green; `GET https://food-picker-api.onrender.com/v1/restaurants` returns JSON.
- [ ] If Atlas upgrade in scope: cluster MongoDB version is current supported major (verified in Atlas UI).

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-09-23 | draft | Waiting on Node Current vs LTS and Atlas UI upgrade scope. |
| 2026-09-23 | approved | Node 24 LTS; mongoose + Atlas cluster both. |
