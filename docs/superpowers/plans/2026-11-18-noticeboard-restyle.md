# Noticeboard Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement task-by-task. Steps use checkbox syntax.

**Goal:** Replace the nomadly-like Phase 1 look with the owner-approved noticeboard identity, add stamps, and swap directions for a copyable address plus a Google Maps place link.

**Architecture:** Styling lives in design tokens and a few CSS utility classes (`.board`, `.note`, `.tilt-*`, `.pin`, `.tape`, `.sticky-note`, `.chip`, `.stamp`). Behaviour, routes, state and data stay. One new component (`AmenityStamps`) and one new action (copy address) are added.

**Tech Stack:** React, Tailwind, Vitest. New fonts via `@fontsource/atkinson-hyperlegible` and `@fontsource/permanent-marker` (bundled). Removed: `@fontsource-variable/fraunces`, `@fontsource/jetbrains-mono`.

**Spec:** `docs/superpowers/specs/2026-11-18-community-revamp-design.md` (Phase 1). Mockup: `docs/superpowers/mockups/noticeboard.html`.

## Global Constraints

- Body text >= 16px; nothing under 14px; touch targets >= 44px; tabs >= 56px tall. Marker font only for large text (>= 22px).
- Contrast >= 4.5:1 for text pairs in both themes (existing token test must keep passing, extended to new tokens).
- No italics, no monospace anywhere in the UI.
- No existing feature removed; no data/route/state changes except tab labels (Board, Map, Events, Me).
- Git: stay on `feature/phase1-restyle-nav`; commit per task, no Claude attribution; push only the feature branch at the end; never merge.

## Review Focus

- Amenity stamp with missing, NaN or out-of-range score: shows "?" (unknown), never a crash or a false tick.
- Copy address when `navigator.clipboard` is missing or rejects: visible fallback message, address stays selectable.
- Place name or address containing `&`, `#`, quotes or non-ASCII: Maps link is correctly encoded.
- 200-character name/address: note and spot page wrap or clamp without overflow.
- Dark mode: stamps, sticky badges and notes keep readable contrast.

---

### Task R1: Tokens, fonts, utility classes
**Files:** Modify `src/index.css`, `tailwind.config.ts`, `src/main.tsx`, `src/lib/contrast.test.ts`, `package.json`.
**Produces:** Tailwind `font-sans` = Atkinson Hyperlegible, `font-marker` = Permanent Marker; tokens `--board`, `--sticky`, `--mint`, `--pink`, `--sky`, `--pin`; classes listed in Architecture; `.font-label` = bold uppercase small label.
- [ ] Extend the token test first: also assert `--primary-foreground` on `--primary`, `--foreground` on `--sticky`, `--foreground` on `--mint`/`--pink`/`--sky` >= 4.5 in light and dark; run, expect FAIL (tokens missing).
- [ ] Implement tokens/classes/fonts; swap font packages; run tests, build.
- [ ] Commit "Noticeboard theme tokens and fonts".

### Task R2: Tab bar and shell
**Files:** Modify `BottomNav.tsx`, `AppShell.tsx`, tests, `Events.tsx`, `Profile.tsx`.
**Produces:** tabs labelled Board `/`, Map `/map`, Events `/events`, Me `/profile`; navy bar with yellow active marker; marker-font wordmark `study` + yellow `spot`.
- [ ] Update tests first (names Board/Map/Events/Me; shell shows wordmark) — expect FAIL; implement; pass; commit "Noticeboard tab bar and shell".

### Task R3: AmenityStamps
**Files:** Create `src/components/AmenityStamps.tsx` + test.
**Produces:** `stampState(kind: 'wifi'|'outlets'|'noise'|'seating', score: number | undefined): 'yes'|'no'|'unknown'` (wifi/outlets/seating: >=3.5 yes, <=2 no, else unknown; noise inverted: <=2.5 yes ("quiet"), >=4 no, else unknown; non-finite or out of 1..5 range = unknown) and `<AmenityStamps amenities size?>` rendering one stamp per kind with `aria-label="Wifi: yes"` etc.
- [ ] Tests (boundaries 2, 2.01, 3.49, 3.5, noise 2.5/2.51/4, undefined, NaN, 0, 99, -1; labels) FAIL; implement; pass; commit.

### Task R4: Note-style PlaceCard
**Files:** Modify `PlaceCard.tsx`, `PlaceCard.test.tsx`.
**Produces:** `PlaceCard` props gain `tilt?: 'left' | 'right' | 'none'`; keeps `variant`, `data-variant`, `data-fallback`, role/aria behaviour, badge texts (Open/Closed, Community, New, review count), "Not yet rated" prompt, illustrative label. Meta line `TYPE · N min walk|drive · ★ rating` in normal case.
- [ ] Update tests (meta text, stamps present, tilt class, existing behaviours) FAIL where changed; implement; pass; commit.

### Task R5: Board page
**Files:** Modify `DiscoverView.tsx` (+ test), `MapView.tsx`.
**Produces:** sticky-note heading "Where are you working today?" (h1), paper search box, chips (Filters & Preferences, Discover real places near me, Add a spot that's missing), native sort select, hero then tiles with alternating tilt on a `.board` background; map keeps zone toggle styled as chip.
- [ ] Update tests (heading, same behaviours) FAIL; implement; pass; commit.

### Task R6: Spot page — address, copy, Maps link
**Files:** Modify `SpotDetail.tsx` (+ test).
**Produces:** address box, "Copy address" button (`navigator.clipboard.writeText(address)`; label becomes "Copied!"; on missing/rejected clipboard shows "Couldn't copy — select the address above"), link "View on Google Maps" to `https://www.google.com/maps/search/?api=1&query=<encodeURIComponent(name + ' ' + address)>`; reviews as coloured sticky notes; stamps instead of the amenity tiles.
- [ ] Tests (link name/href encoding with `&#"é`, copy success, clipboard absent, clipboard rejects, 200-char strings) FAIL; implement; pass; commit.

### Task R7: Remaining surfaces and final verification
**Files:** Modify `NotFound.tsx`, `FilterPanel.tsx`, `ReviewForm.tsx`, `AddSpotForm.tsx`, `index.html` meta text (class and copy only), map pin CSS.
- [ ] Replace leftover `font-serif`/`italic`/`font-mono` uses (grep must find none in `src/`); restyle surfaces to tokens.
- [ ] Run full tests, type-check, build; walk the app at 375px and 1440px in light and dark; check no horizontal scroll; commit; push the feature branch.
