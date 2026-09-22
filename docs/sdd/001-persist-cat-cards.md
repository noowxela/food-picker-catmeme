# SDD: Keep the last cat cards across Home

- **Repo:** `aaa_interview/alex-woon-jun-rong`
- **Status:** `implemented`
- **Date:** 2026-09-22
- **Related:** `docs/sdd/000-architecture.md`

## 1. Context / current architecture

Home (`frontend/pages/index.html`) and `frontend/assets/js/foodPicker.js` draw a random restaurant set and pair each restaurant with a cat photo. `init()` always calls `getRandomRestaurantData` and `fetchCatImages`. Navigating to Restaurants and back is a full page load, so that run starts over: the "Showing N matched random Restaurant" line and the cat cards are new.

History (`#history-list`) is loaded separately and should keep updating.

## 2. Problem and non-goals

**Problem:** After Home → Restaurants → Home, the last matched set and its cat photos should still be on screen. A new cat photo set should happen only when the user asks, and that ask is limited.

**Non-goals:**

- Do not persist cards across a new browser session or another browser tab group after the tab is closed.
- Do not change the restaurant API or store cat URLs in MongoDB.
- Do not rate-limit FindFood or Reset.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| What does "20s interval, maximum 3 times" mean? | A rolling 20-second window allows at most 3 clicks of the new refresh button. The 4th click in that window does nothing except show that the button is unavailable. This limit is assumed from the request and is part of this draft. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:**

Save the last Home result in `sessionStorage`: restaurant rows, cat image URLs, and the total used for "Showing N matched random Restaurant".

On Home load, if that snapshot exists, paint the cards and the sentence from storage. Do not call `randomRestaurants` or The Cat API.

Add a **Refresh cats** button next to FindFood. It requests new cat photos for the restaurants already on screen. It does not draw a new restaurant set. Each click time is stored with the snapshot. If 3 clicks already happened in the last 20 seconds, the button stays disabled and shows the seconds left until one click ages out.

FindFood and Reset still draw a new restaurant set and new cats, then replace the snapshot. Those clicks do not count toward the 3.

**Pros:**

- Matches a full page navigation without a server change.
- The limit survives the trip to Restaurants, because it lives in the same snapshot.

**Cons / risks:**

- A long address or a missing cat URL in storage can paint a broken card. Skip a card only when its image URL is missing, and fall back to a fresh fetch when the snapshot cannot be parsed.
- The Cat API key is still visible in the browser. This change does not alter that.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| `localStorage` | Would keep yesterday's cats after the browser restarts. |
| Re-fetch restaurants but reuse old image URLs | The matched set would change while the sentence and photos looked stale. |
| One click, then a hard 20-second lock | The request allows three uses inside the interval, not one. |

## 5. Acceptance criteria and verification

- [x] FindFood, leave to Restaurants, return to Home: the same "Showing N matched random Restaurant" text and the same cat image URLs are on screen, with no Cat API request on that return.
- [x] Refresh cats replaces only the photos. Restaurant names on the card backs stay the same.
- [x] A 4th Refresh cats click inside 20 seconds does not call The Cat API. The button shows it is unavailable.
- [ ] After the oldest of those three clicks is more than 20 seconds old, Refresh cats works again.
- [x] FindFood and Reset still load a new restaurant set and new cats.
- [x] Verify in the browser: Home → Restaurants → Home, then four rapid refresh clicks, then the network panel.

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-09-22 | draft | Waiting for approval before code changes. |
| 2026-09-22 | implemented | Home restores the last cards. Refresh cats allows 3 calls per 20 seconds. |
