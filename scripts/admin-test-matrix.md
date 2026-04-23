# Admin (Phase 4B) — Manual Test Matrix

Spec: [ILIA-TASKS.md §6.7 + §11](../ILIA-TASKS.md). Run after `docker compose up -d postgres`, `db:migrate`, `db:seed`, and both dev servers (`npm run dev -w web` + `npm run dev -w api`).

The automated contract slice is in [smoke-admin.sh](smoke-admin.sh) — run it first; it covers everything below the dashed line.

## Browser matrix (sign in fresh in each row)

| #   | Account                                                    | Action                                 | Expected                                                                                |
| --- | ---------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | `admin@guide-foodie.test / Admin2026!`                     | Login → wait                           | Lands on `/admin/dashboard`, 4 KPI cards populated, footer row "Points en circulation". |
| 2   | DINER `dev-ilia@guide-foodie.test / Dev2026!`              | Login → type `/admin/dashboard` in URL | Proxy 307 → `/`. Diner UI shows.                                                        |
| 3   | STAFF `staff-arpege@demo.guidefoodie.app / DemoStaff2026!` | Login → type `/admin/dashboard`        | Proxy 307 → `/portal/menu`.                                                             |
| 4   | Logged-out                                                 | type `/admin/dashboard`                | Proxy 307 → `/login?next=%2Fadmin%2Fdashboard`.                                         |

## /admin/dashboard

| #   | Action                  | Expected                                                                                                             |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 5   | Hard reload             | `loading.tsx` skeleton flashes, then 4 cards + "Points en circulation" footer.                                       |
| 6   | Stop the API and reload | `error.tsx` renders "Impossible de charger les statistiques" + "Réessayer". Restart API and click button → recovers. |

## /admin/restaurants — list + filters + CRUD

| #   | Action                                                 | Expected                                                                                                                                                                                                   |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7   | Land on page                                           | Table populated; filter bar shows city input, 4 star chips (Bib / ★ / ★★ / ★★★), "Inclure les désactivés" checked.                                                                                         |
| 8   | Type `paris` in city filter                            | Rows filter to those whose city contains "paris" (case-insensitive).                                                                                                                                       |
| 9   | Click `★★★` chip                                       | Only 3-star rows remain; chip is `aria-pressed="true"`. Click again → released.                                                                                                                            |
| 10  | Uncheck "Inclure les désactivés"                       | Rows with `disabledAt` disappear.                                                                                                                                                                          |
| 11  | Click "Ajouter un restaurant"                          | Dialog opens, fields empty, focus trapped (Tab cycles inside).                                                                                                                                             |
| 12  | Type a name                                            | Slug field auto-fills slugified version (only in create mode).                                                                                                                                             |
| 13  | Click "Auto" next to slug                              | Slug regenerates from current name.                                                                                                                                                                        |
| 14  | Submit empty form                                      | Per-field error messages render (red text under each field).                                                                                                                                               |
| 15  | Submit valid create                                    | Toast "Restaurant « X » créé"; dialog closes; new row appears at top of table.                                                                                                                             |
| 16  | Click "Modifier" on a row                              | Dialog opens prefilled. Slug "Auto" still works. Submit → toast "mis à jour"; row refreshes inline.                                                                                                        |
| 17  | Click "Désactiver"                                     | ConfirmDialog "Désactiver ce restaurant ?" with restaurant name + warning copy. Cancel → no change. Confirm → toast, row goes to opacity 0.65, badge "Désactivé le …", action button flips to "Réactiver". |
| 18  | Click "Réactiver" on a disabled row                    | Toast, row returns to active state, badge "Actif".                                                                                                                                                         |
| 19  | Disable a restaurant then load Wilson's `/restaurants` | The disabled restaurant is **not** in the diner list (server-side filter, D-08).                                                                                                                           |

## /admin/restaurants/[id] — menu manager

| #   | Action                                         | Expected                                                                                    |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 20  | Click a restaurant name                        | Land on detail page; banner shows stars · city · cuisine · address; "Carte (N)" header.     |
| 21  | Hard reload                                    | `loading.tsx` skeleton renders.                                                             |
| 22  | Hit a non-existent id `/admin/restaurants/xyz` | `not-found.tsx` renders with "Restaurant introuvable" + back link.                          |
| 23  | Click "Ajouter un plat"                        | Dialog opens; required: name + priceEuros (UI is in €, server stores cents).                |
| 24  | Submit `priceEuros=12.5`                       | Sent as `priceCents=1250`; toast "Plat ajouté"; row appears in list sorted by `sortOrder`.  |
| 25  | Click ↑ on the second row                      | Two PATCH calls swap sortOrders; rows reorder. ↑ on first row + ↓ on last row are disabled. |
| 26  | Click "Modifier"                               | Dialog prefilled (price shown in €). Edit → toast, row updates.                             |
| 27  | Click "Supprimer"                              | ConfirmDialog. Confirm → DELETE → toast, row removed.                                       |

## /admin/users — list + role/disable

| #   | Action                          | Expected                                                                                                       |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 28  | Land on page                    | Table populated; filter bar: search input + 3 role chips (Dîneur / Staff / Admin).                             |
| 29  | Type "ilia"                     | Rows filter on name OR email containing "ilia".                                                                |
| 30  | Click "Staff" chip              | Only RESTAURANT_STAFF rows remain.                                                                             |
| 31  | Find your own row               | Marked "(vous)"; "Modifier" button is `disabled` with title "Vous ne pouvez pas modifier votre propre compte." |
| 32  | Click "Modifier" on a DINER row | Dialog opens with role select + "Compte désactivé" checkbox.                                                   |
| 33  | Change role to STAFF, submit    | Toast "mis à jour"; row reflects new role. Sign in as that user → next login goes to `/portal/menu`.           |
| 34  | Tick "Compte désactivé", submit | Toast; row dims to opacity 0.65, status "Désactivé". Try logging in as that user → 401 account_disabled.       |
| 35  | Re-open, untick, submit         | Account re-enabled.                                                                                            |

## Accessibility / cross-cutting

| #   | Action                                                                                 | Expected                                                                                     |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 36  | Tab through any page                                                                   | Focus visible, no traps outside dialogs, every actionable control reachable.                 |
| 37  | Open any dialog                                                                        | Focus moves into it; Esc closes; Tab cycles within.                                          |
| 38  | DevTools Network — filter `localhost:3001`                                             | Every admin call has `cookie: gfj.session=…`; no `/api/admin/*` request without auth cookie. |
| 39  | DevTools Console                                                                       | No unhandled promise rejection on any failed mutation; toast appears instead.                |
| 40  | grep diff for `#[0-9a-f]` and `rgb(` and `px"` outside `(admin)/_components/rating.ts` | Empty (all values via `var(--*)`).                                                           |

## Done = §11 satisfied

- [ ] 1, 5, 6 → §11.1
- [ ] 7–19 → §11.2
- [ ] 20–27 → §11.3
- [ ] 28–35 → §11.4
- [ ] 2, 3, 4 → §11.5
- [ ] 14, 17, 27, 39 → §11.6
- [ ] 40 → §11.7
