# Phase 1: Restyle + Bottom-Tab Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give StudySpot a warm editorial look and a four-tab bottom navigation (Discover, Map, Events, Profile) without removing any existing feature.

**Architecture:** `Index.tsx` keeps all existing state and data fetching but stops rendering UI itself; it becomes a layout route that shares its state with child views through React Router's `Outlet` context. Discover and Map become separate views, the spot detail becomes a shared overlay, and a new `AppShell` adds the top bar and bottom tab bar. Events and Profile are placeholders until Phase 3.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind, shadcn/ui, React Router 6, MapLibre. New dev-only: Vitest, jsdom, Testing Library. New runtime: `@fontsource-variable/fraunces`, `@fontsource/jetbrains-mono` (bundled fonts, no external requests).

**Spec:** `docs/superpowers/specs/2026-11-18-community-revamp-design.md` (Phase 1 section)

## Global Constraints

- Text floor: keep current large sizing. Body and control text stays at `text-base` (16px) or larger; nothing below `text-sm` (14px) except the existing `text-xs` helper hints; touch targets at least 44px (`h-11`); bottom-nav tabs at least 56px tall.
- Text contrast at least 4.5:1 against its background in both light and dark themes (enforced by a test in Task 2).
- Stack stays as is; no paid services; no external font or image requests added.
- Dark mode must keep working; the saved `localStorage` key `theme` (`'dark'` / `'light'`) keeps its meaning.
- Nothing from existing features is removed: filters, search, "Discover real places near me", "Search this area" style searches, sort, travel times, isochrone toggle, reviews (1-5 scores stay until Phase 2), add-a-spot, directions link.
- Do not touch `.env.local`, Supabase SQL, or proxy config.
- Git (owner's rules): one branch, `feature/phase1-restyle-nav`. Never commit, push or merge without asking the owner first. No `Co-Authored-By` or any Claude attribution in commit messages. Every "Commit" step below means: ask the owner, then commit only that task's files.

## Review Focus

- Zero places on Discover (all filtered out): shows the existing empty state, no hero card, no crash on `places[0]`.
- A place with a 200-character name or address: card and detail truncate or wrap without breaking the layout.
- A place with no `photo_url`, or a photo URL that fails to load: falls back to the tinted gradient card, no broken-image icon.
- `selectedPlace` id that is no longer in the list (a filter change removed it): detail overlay closes cleanly, no crash.
- Unknown URL (for example `/events/xyz` or `/spot/1`): still shows the NotFound page, with no bottom nav.

---

## File Structure

- Create `src/test/setup.ts` — Vitest setup (jest-dom matchers, `matchMedia` and `ResizeObserver` stubs).
- Create `src/lib/contrast.ts` (+ `.test.ts`) — WCAG contrast math used to guard theme tokens.
- Create `src/hooks/useDarkMode.ts` (+ test) — dark-mode state moved out of `Index.tsx`.
- Create `src/components/BottomNav.tsx`, `src/components/AppShell.tsx` (+ tests) — tab bar and top bar layout.
- Create `src/pages/Events.tsx`, `src/pages/Profile.tsx` — placeholder pages.
- Create `src/pages/exploreContext.ts` — the `ExploreContext` type shared by Index and its views.
- Create `src/pages/DiscoverView.tsx`, `src/pages/MapView.tsx` (+ tests) — the two views of the explore state.
- Create `src/components/SpotDetail.tsx` (+ test) — full-height detail overlay.
- Modify `src/index.css`, `tailwind.config.ts`, `src/main.tsx` — tokens, fonts.
- Modify `src/components/PlaceCard.tsx` (+ test) — hero and tile variants.
- Modify `src/App.tsx` — routes.
- Modify `src/pages/Index.tsx` — becomes the layout route (state kept, JSX moved out).
- Modify `FilterPanel.tsx`, `ReviewForm.tsx`, `AddSpotForm.tsx` — visual consistency only.
- Modify `package.json`, `vite.config.ts` — test tooling.

---

### Task 1: Test tooling and branch

**Files:** Modify `package.json`, `vite.config.ts`; Create `src/test/setup.ts`, `src/test/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` runs Vitest once (`vitest run`) in jsdom with jest-dom matchers; test files match `src/**/*.test.{ts,tsx}`; the `@/` alias works in tests.

- [ ] **Step 1:** Ask the owner, then create branch `feature/phase1-restyle-nav` from `main`.
- [ ] **Step 2:** Install dev deps: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`. Add script `"test": "vitest run"`.
- [ ] **Step 3:** Add a `test` block to the existing `defineConfig` in `vite.config.ts` (`environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`, `globals: true`, `css: true`); add `/// <reference types="vitest/config" />` at the top. Do not alter the proxy block.
- [ ] **Step 4:** `src/test/setup.ts` imports `@testing-library/jest-dom/vitest` and stubs `window.matchMedia` and `globalThis.ResizeObserver` (Radix needs both). Add `"types": ["vitest/globals"]` to `tsconfig.app.json` if the build complains.
- [ ] **Step 5:** `src/test/smoke.test.ts`: asserts `1 + 1 === 2` and that `document.body` exists. Run `npm test`. Expected: 1 file, 2 tests passed. Also run `npm run build`; expected: succeeds.
- [ ] **Step 6:** Commit (ask first): "Add Vitest tooling".

### Task 2: Theme tokens, fonts, contrast guard

**Files:** Create `src/lib/contrast.ts`, `src/lib/contrast.test.ts`; Modify `src/index.css`, `tailwind.config.ts`, `src/main.tsx`; install `@fontsource-variable/fraunces`, `@fontsource/jetbrains-mono`.

**Interfaces:**
- Produces: `contrastRatio(a: string, b: string): number` where each argument is a Tailwind HSL triple such as `"14 62% 40%"`; Tailwind classes `font-serif` (Fraunces) and `font-mono` (JetBrains Mono); CSS tokens recoloured warm: cream background, near-black warm foreground, terracotta `--primary`.

- [ ] **Step 1: Failing test** in `contrast.test.ts`: `contrastRatio("0 0% 0%", "0 0% 100%")` is within 0.01 of 21; `contrastRatio("0 0% 100%", "0 0% 100%")` is 1. Add a second describe "theme tokens" that reads `src/index.css` with `fs`, parses the `:root` and `.dark` blocks, and asserts for each theme: `--foreground` on `--background` >= 7; `--muted-foreground` on `--background` >= 4.5; `--primary` on `--background` >= 4.5; `--primary-foreground` on `--primary` >= 4.5.
- [ ] **Step 2:** Run it; expect FAIL (module missing).
- [ ] **Step 3:** Implement `contrastRatio` in `src/lib/contrast.ts` (HSL to sRGB to WCAG relative luminance).
- [ ] **Step 4:** Edit tokens in `src/index.css` (light and `.dark`): background cream (about `42 45% 96%`), card slightly lighter, foreground warm near-black, primary terracotta (about `14 62% 40%`), a darker muted-foreground; adjust until the token test passes. Keep every existing variable name so shadcn components keep working. Recolour `.ss-marker` to the new primary.
- [ ] **Step 5:** Import the two fontsource packages in `src/main.tsx`; in `tailwind.config.ts` set `fontFamily.serif` to `["Fraunces Variable", "serif"]`, `fontFamily.mono` to `["JetBrains Mono", "monospace"]`; add `.font-label` utility in `index.css` (`font-mono uppercase tracking-wide text-sm`).
- [ ] **Step 6:** Run `npm test` (all pass), `npm run build` (succeeds). Open the dev server and confirm the page loads in the new colours in light and dark.
- [ ] **Step 7:** Commit (ask first): "Warm editorial theme tokens and fonts".

### Task 3: `useDarkMode` hook

**Files:** Create `src/hooks/useDarkMode.ts`, `src/hooks/useDarkMode.test.ts`; Modify `src/pages/Index.tsx` (remove the dark-mode state and effect, call the hook).

**Interfaces:**
- Produces: `useDarkMode(): { isDarkMode: boolean; toggleDarkMode: () => void }`. Initial value is `localStorage.getItem('theme') === 'dark'`; it toggles the `dark` class on `document.documentElement` and writes `'dark'`/`'light'` to `localStorage.theme`.

- [ ] **Step 1: Failing tests:** default is light when storage is empty; starts dark when `theme` is `'dark'`; `toggleDarkMode` flips state, adds/removes the `dark` class, and persists; a garbage stored value (`'banana'`) is treated as light.
- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement the hook with the exact behaviour above. **Step 4:** In `Index.tsx`, replace lines 44-52 (state and effect) with the hook; keep the sun/moon button working by passing `isDarkMode` and `toggleDarkMode` where the old state setter was used. **Step 5:** Run tests and build; expected pass.
- [ ] **Step 6:** Commit (ask first): "Extract useDarkMode hook".

### Task 4: Bottom nav, app shell, routes, placeholders

**Files:** Create `src/components/BottomNav.tsx`, `src/components/AppShell.tsx`, `src/pages/Events.tsx`, `src/pages/Profile.tsx`, tests `BottomNav.test.tsx`, `AppShell.test.tsx`; Modify `src/App.tsx`.

**Interfaces:**
- Consumes: `useDarkMode` (Task 3).
- Produces: `BottomNav` (no props) renders a `<nav aria-label="Main">` with four `NavLink`s: Discover `/`, Map `/map`, Events `/events`, Profile `/profile`; the active link has `aria-current="page"`; each link is at least 56px tall with an icon and a `text-base` label. `AppShell` (no props) renders the top bar (wordmark `studyspot.` in the serif font, dark-mode toggle button with `aria-label="Toggle dark mode"`), `<Outlet />` in a scrollable `<main>`, then `BottomNav`. `Events` and `Profile` render a serif heading and a "Coming soon" message.
- Routes: `AppShell` is a layout route containing `/` and `/map` (both rendered by `Index`, built in Task 5), `/events`, `/profile`. `*` stays outside `AppShell` and renders `NotFound`.

- [ ] **Step 1: Failing tests:** `BottomNav` inside `MemoryRouter initialEntries={['/map']}` shows four links named Discover, Map, Events, Profile, and only Map has `aria-current="page"`; clicking Events (user-event) changes the active link. `AppShell` with a stub child route renders the child and the nav; toggle button flips `document.documentElement` `dark` class. Route test: rendering `App` routes at `/does-not-exist` shows the 404 text and no `navigation` role.
- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement components and routes. Until Task 5, `/` and `/map` may both render the current `Index` unchanged. **Step 4:** Run tests; expected pass. Manually open `/`, `/map`, `/events`, `/profile`, and `/zzz` in the dev server.
- [ ] **Step 5:** Commit (ask first): "Add bottom tab navigation and app shell".

### Task 5: Split Index into layout and views (no visual change)

**Files:** Create `src/pages/exploreContext.ts`, `src/pages/DiscoverView.tsx`, `src/pages/MapView.tsx`, tests `DiscoverView.test.tsx`, `MapView.test.tsx`; Modify `src/pages/Index.tsx`, `src/App.tsx`.

**Interfaces:**
- Produces in `exploreContext.ts`: `interface ExploreContext` holding exactly the state and handlers the views need: `places: Place[]`, `filters`, `setFilters`, `resetFilters(): void`, `activeFilterCount: number`, `openFilters(): void`, `sortBy`, `setSortBy`, `searchQuery`, `setSearchQuery`, `isDiscovering: boolean`, `discoverError: string | null`, `discoveredCount: number`, `handleDiscover(): void`, `handleSearchNearby(): void`, `startAddSpot(): void`, `canAddSpot: boolean`, `selectedPlace: string | null`, `toggleSelect(id: string): void`, `userLocation`, `isochrone`, `showIsochrone: boolean`, `toggleIsochrone(): void`, `isPicking`, `pickedLocation`, `onPickLocation(lat: number, lng: number): void`; and `useExplore(): ExploreContext` wrapping `useOutletContext`.
- `Index` renders `<Outlet context={explore} />` plus the existing modals (FilterPanel, ReviewForm, AddSpotForm), keeps every effect and fetch, and no longer renders the old header. `DiscoverView` contains the existing sidebar content (stats cards may stay for now); `MapView` contains the `Map` and the zone toggle. The expanded inline detail panel stays inside `DiscoverView` for this task and moves in Task 6.
- Routes: `/` renders `DiscoverView` and `/map` renders `MapView`, both children of `Index`, which is a layout route inside `AppShell`.

- [ ] **Step 1: Failing tests** (build a fake `ExploreContext` and wrap views in a router with an `Outlet` provider): `DiscoverView` with `places: []` and empty search shows "No spots match your filters"; with a non-empty `searchQuery` and no places shows "No matches found" and "Clear Search" calls `setSearchQuery('')`; typing in the search box calls `setSearchQuery`; pressing Enter calls `handleSearchNearby`; clicking a place card calls `toggleSelect` with its id. `MapView` (mock `@/components/Map` with a stub) renders the stub and shows the zone toggle only when `userLocation` is set.
- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Move the JSX; do not change behaviour or class names beyond what the move requires. **Step 4:** Run tests, build, then manually confirm in the dev server on `/` and `/map`: search, filters, discover, add-a-spot picking, isochrone toggle, review form all still work and the selected place stays selected when switching tabs.
- [ ] **Step 5:** Commit (ask first): "Split Index into layout route with Discover and Map views".

### Task 6: `SpotDetail` overlay

**Files:** Create `src/components/SpotDetail.tsx`, `SpotDetail.test.tsx`; Modify `Index.tsx`, `DiscoverView.tsx`.

**Interfaces:**
- Produces: `SpotDetail` props `{ place: Place | null; reviews: Review[]; transportMode: 'walking' | 'driving'; canReview: boolean; onClose(): void; onRate(place: Place): void }`. Returns `null` when `place` is `null`. Shows: hero (photo or tinted fallback), serif name, mono label line (`CAFE · address`), rating tile with review count, existing four amenity values, travel time for `transportMode`, price, hours label (curated places only), up to three reviews, "Rate this spot" (disabled when `canReview` is false), and an "Open in Google Maps" link using the same destination URL logic as the old `getDirectionsUrl`. Escape key behaviour stays in `Index`.
- `Index` renders `<SpotDetail>` for the selected place for both tabs; the inline expanded panel in `DiscoverView` is removed.

- [ ] **Step 1: Failing tests:** `null` place renders nothing; a place shows its name, rating, and an "Open in Google Maps" link whose `href` contains the encoded address; a 200-character name renders without error; with `canReview: false` the Rate button is disabled; clicking close calls `onClose`; a discovered place with zero reviews shows "Not yet rated" and a "Be the first to review" button that calls `onRate`.
- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement, porting the old expanded-panel logic (including the `isDiscovered && !reviewCount` empty state). **Step 4:** In `Index`, when `selectedPlace` is not in `places` (stale id), pass `place: null` and clear the selection in an effect. Add a test for this in `DiscoverView`/`Index` terms if practical; otherwise cover with the manual check below. **Step 5:** Run tests, build; manually open a curated spot, a discovered spot and a community spot.
- [ ] **Step 6:** Commit (ask first): "Add full-height SpotDetail overlay".

### Task 7: Photo-led `PlaceCard`

**Files:** Modify `src/components/PlaceCard.tsx`; Create `src/components/PlaceCard.test.tsx`.

**Interfaces:**
- Produces: `PlaceCard` gains `variant?: 'hero' | 'tile'` (default `'tile'`); keeps existing props and the `role="button"`, `tabIndex`, `aria-pressed`, Enter/Space behaviour. Both variants show: photo (or fallback) filling the card, the place name in the serif font over a dark gradient, a mono label line `TYPE · AREA · 0.6 MI` or travel time, the star rating, Open/Closed and Community/New badges, and a row of amenity icons. Hero is taller and shows larger text. Export `getFallbackGradient(types: string[]): string` returning a warm CSS gradient (distinct for cafe, library, restaurant, default).

- [ ] **Step 1: Failing tests:** `getFallbackGradient(['cafe'])` differs from `['library']` and an empty array returns the default; no `photo_url` renders no `<img>`; with `photo_url` renders an `<img>` and firing its `error` event swaps back to the fallback (no `<img>` left); a 200-char name has a truncation class and does not throw; Enter and Space call `onSelect`; hero and tile variants both render the name.
- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement, tracking image failure with local state.
- [ ] **Step 4:** Run tests and build. **Step 5:** Commit (ask first): "Photo-led place cards".

### Task 8: Discover and Map layouts

**Files:** Modify `src/pages/DiscoverView.tsx`, `src/pages/MapView.tsx`, `tests`.

**Interfaces:** Consumes `useExplore()`, `PlaceCard` variants, `SpotDetail` selection through context.

- [ ] **Step 1: Failing tests:** with three places, the first renders as the hero and the other two as tiles; with one place there is a hero and no tile grid; with zero places there is no hero and no crash; the serif heading "Choose your space." is present; the Filters button shows the active-filter count; clicking Sort options still calls `setSortBy`.
- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Rebuild `DiscoverView` layout: serif heading, chip row (Filters, quick amenity chips only if they map to existing filters, otherwise omit), hero card then a two-column tile grid on wide screens and one column on narrow, search input, sort, the discover and add-a-spot buttons, status messages. Drop the old stats cards. In `MapView`, make the map full-bleed above the tab bar with the zone toggle, restyled to the new tokens.
- [ ] **Step 4:** Run tests and build. Manually check 375px, 768px and 1440px widths in light and dark mode: no horizontal scroll, nothing clipped by the tab bar, text meets the sizing floor.
- [ ] **Step 5:** Commit (ask first): "Restyle Discover and Map views".

### Task 9: Modals consistency and final pass

**Files:** Modify `FilterPanel.tsx`, `ReviewForm.tsx`, `AddSpotForm.tsx` (class changes only), `index.html` (title and description text only if they still mention scores).

- [ ] **Step 1:** Update headings to the serif font and labels to `font-label` where it fits; confirm no control shrinks below the sizing floor and the tab bar does not cover modal footers (modals sit above it with a higher `z-index`).
- [ ] **Step 2:** Run `npm test`, `npm run lint`, `npm run build`; expected all pass (report any lint errors that already existed on `main` separately).
- [ ] **Step 3:** In the dev server, walk the full flow: Discover → search → open a spot → rate → map tab → add a spot → events and profile placeholders → dark mode. Report anything that did not work.
- [ ] **Step 4:** Commit (ask first): "Modal styling pass". Then ask the owner about merging; before recommending a merge, confirm the branch has no unrelated commits.

## Left to the executor

Exact spacing, the accent shade within the contrast limits, tile image aspect ratio, and the gradient palette per place type. Real place photos are not part of this phase (no free source is wired up); cards are photo-ready through `photo_url` and look intentional without it.
