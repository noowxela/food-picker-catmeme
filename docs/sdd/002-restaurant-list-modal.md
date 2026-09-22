# SDD: Restaurant list info modal

- **Repo:** `aaa_interview/alex-woon-jun-rong`
- **Status:** `implemented`
- **Date:** 2026-09-22
- **Related:** `docs/sdd/000-architecture.md`

## 1. Context / current architecture

The Restaurants page (`frontend/pages/restaurants.html`, `frontend/assets/js/restaurantPage.js`) renders a table of name, address, category, and a Delete button. The only modal on that page for a saved restaurant is confirm-delete. `#staticBackdrop` is the add-restaurant form.

Home already opens a view-only popup from “Choose This as lunch” (`#lunchPickModal` in `frontend/pages/index.html`, `showLunchModal` in `frontend/assets/js/foodPicker.js`). It shows name, address, category, and a Google Maps embed. That modal sits outside the scrolling page so `position: fixed` is not clipped.

## 2. Problem and non-goals

**Problem:** From Restaurant List, there is no way to open a restaurant’s info popup.

**Non-goals:** Editing a restaurant, choosing it as lunch, or changing Home’s lunch modal.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Click the row (not Delete) to open it, or add a separate Info button? | Both. A row click and an Info button open the same popup. |
| View-only name, address, category, and map, matching Home? | Yes. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:** Clicking Name, Address, or Category on a row opens a view-only modal with that row’s name, address, category, and the same Google Maps embed Home uses. The close button, backdrop, and Escape close it. Clicking the same row while it is open closes it. Delete still opens confirm-delete and does not open the info modal. The modal markup sits outside the scrolling `div.d-flex.flex-column.h-100`, same as Home.

**Pros:**

- Uses data already on the row, so the list does not need another API call.
- Matches the popup people already see on Home.
- Delete stays a separate action.

**Cons / risks:**

- A row click and a Delete click must not both fire.
- The map iframe loads only when the modal opens. A weak address still produces a weak map, as on Home.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Reuse the add-restaurant form as the popup | That form creates a restaurant. It is not a read-only info view. |
| Navigate to a new detail page | The request is a popup on the list. |

## 5. Acceptance criteria and verification

- [x] On `/restaurants`, clicking a restaurant’s name, address, or category opens a modal with that name, address, category, and a map iframe when an address exists.
- [x] Closing with the close button hides the modal. Backdrop and Escape use the same Bootstrap modal dismiss.
- [x] Clicking the same row while the modal is open closes it. The Info button opens it again.
- [x] Delete still opens confirm-delete and does not open the info modal.
- [x] Verified in the browser on SushiMentai: row open, row close, Info open, close button, Delete left the info modal closed.

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-09-22 | draft | Waiting on the two questions in section 3. |
| 2026-09-22 | implemented | Row click and Info both open the view-only map popup. |
