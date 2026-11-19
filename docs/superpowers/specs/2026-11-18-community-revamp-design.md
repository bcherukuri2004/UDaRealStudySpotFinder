# StudySpot Community Revamp — Design

Status: approved by owner (2026-11-18); visual direction revised the same day to the "noticeboard" look (see Phase 1).

## Intent and why
StudySpot Finder becomes a community app for remote workers and students.
Spots, amenity facts and events all come from the people using it, and the
data gets more trustworthy as more people contribute. The visual reference is
"nomadly." (a TikTok design concept by @designwith.angel) for what the app is
(a community hub for remote workers). The owner then rejected copying its look:
the first Phase 1 build was too close to it (cream and terracotta, italic serif,
monospace caps, hero-plus-grid). The look is now an original "noticeboard"
identity; see Phase 1.

## Goals
1. Restyle the whole app to a warm editorial look and move to bottom-tab navigation.
2. Replace 1-5 amenity scores with community yes/no facts that become more accurate with more votes.
3. Add events (Partiful-style): anyone with an account can host, local people can RSVP.
4. Keep every existing feature that still fits: map, Foursquare discovery, travel times and isochrones, reviews, add-a-spot.

## Non-goals
- No mood picker or mood tagging (owner explicitly dropped it).
- No phone-number sign-in or SMS (costs money per message). Can be added later without redesign.
- No embedding TikTok/Instagram posts on place pages (nomadly has it; not requested).
- No production deployment or serverless proxy in this revamp (still a separate task).

## Anti-goals (failure even if it "works")
- A sign-in wall that drives people away. RSVP must feel like guest RSVP.
- Text that is small or low-contrast. The owner has poor eyesight; the current large sizing is a hard requirement, and the new serif/mono styling must not shrink it.
- Surprise costs: no paid services, no credit card.

## Constraints
- Stack stays: React 18, Vite, TypeScript, Tailwind, shadcn, MapLibre, Supabase.
- Secrets stay server-side or gitignored; the Supabase anon key is public by design, so every new table needs Row Level Security.
- Existing abuse hardening (length checks, flood guard, one review per user per place) must be extended to new tables.

## Approaches considered (accounts and RSVP)
- A. Guests only, accounts later: fastest, but guests cannot edit or cancel an RSVP, hosts cannot tell people from spam, and bolting accounts on later means reworking storage.
- B. Accounts from day one (Google or email magic link): cleanest, but adds a visible sign-in step before the first RSVP.
- **C. Soft accounts (chosen by owner).** Someone RSVPs with a name and an email; that silently creates a passwordless Supabase account and emails a one-tap link to confirm and manage the RSVP. Feels like guest RSVP, is a real account, costs nothing.

Decision: C. Owner also wants account-based identity long term, with phone as a possible later add-on.

## Design

### Phase order (each phase gets its own plan)
1. Restyle + bottom-tab navigation.
2. Yes/no amenities with community confirmation.
3. Accounts (soft accounts) and events. Event details get a short follow-up brainstorm before planning.

### Phase 1 — Look and navigation (noticeboard identity)
Owner-approved mockup: `docs/superpowers/mockups/noticeboard.html`. Anti-goal: anything that reads as a copy of nomadly.

- **Metaphor:** a community cork board. Every spot is a paper note pinned or taped to the board; reviews are coloured sticky notes; events are flyers with tear-off RSVP strips (Phase 3).
- **Tabs (bottom, navy bar, yellow active marker):** Board (Discover, route `/`), Map (`/map`), Events (`/events`), Me (`/profile`).
- **Type:** Permanent Marker for names and headings (large sizes only); Atkinson Hyperlegible (designed for low vision) for all body text and labels. No italics, no monospace.
- **Colour:** paper (warm off-white) cards on cork; ink navy text and buttons; sticky yellow, mint, pink and sky as note colours; pin red. Dark mode: dark board, dark paper, yellow primary. Text contrast stays at least 4.5:1 (enforced by test); the 56px tab and 44px control floors stay.
- **Spot note:** white-framed photo, marker name, one meta line (type, travel time, rating), status as a tilted sticky badge (Open, New, Community, review count), amenities as rubber-stamp circles: green tick = yes, red cross = no, dashed question mark = not enough information. Until Phase 2 the stamp state is derived from the existing 1-5 scores (>= 3.5 yes, <= 2 no, otherwise unknown; noise inverted); unrated discovered places show "Not yet rated".
- **Photos:** real, freely licensed photos where they exist, with the licence credit as a link; otherwise a stand-in labelled "Illustrative photo"; no photo or a broken photo falls back to a warm gradient. Community uploads (later phase) replace stand-ins.
- **Directions:** no turn-by-turn link. Each spot page shows the address in a box with a "Copy address" button (graceful message if the clipboard is unavailable) and a "View on Google Maps" link to the place's page (a search link built from name plus address), opened in a new tab.
- **Spot page:** full-height overlay (already built): photo, name, address box, rating, price, travel time, amenity stamps, up to three reviews as sticky notes, Rate button.
- Restyle only: data, routes, state, tests of behaviour and existing features stay.

### Phase 2 — Yes/no amenities
- Amenities: wifi, outlets, bathroom, comfy seating, pet-friendly (starter list; builder may adjust). Noise becomes a three-way vote: Quiet / Moderate / Loud.
- Each person can vote once per amenity per place. Votes can be changed.
- Display: "Outlets: yes (12 of 14 say so)". Few votes shows "unconfirmed" so thin data is not presented as fact.
- Seed data: each place's amenity starts from research (Foursquare attributes if available, otherwise hand-curated for the demo spots), stored with a `source` marker so community votes can outweigh it as they accumulate.
- Existing 1-5 review scores are retired; old rows are kept but no longer shown or collected (migration decision left to builder, must not delete data).

### Phase 3 — Accounts and events
Accounts:
- Supabase passwordless sign-in. Soft-account flow: name + email, confirmation link by email.
- RSVP and hosting require a confirmed email. Browsing and reading never require an account. Reviews and amenity votes may stay guest-friendly for now.
- Profile tab: my RSVPs, events I host, my reviews.

Events (Partiful-style):
- Host creates: cover image, title, date and time, venue (a listed spot or free text address), description, optional capacity.
- Guests RSVP Going / Maybe / Can't go; event page shows who is going; host sees and manages the guest list; when capacity is reached, further RSVPs are waitlisted or blocked (builder's call, mark it).
- Events tab lists upcoming events near the user (default radius about 25 miles, city fallback if location is off), soonest first. Each event has a shareable link.
- Data (sketch): `profiles`, `events`, `event_rsvps` (unique per event per user), plus `amenity_votes` from phase 2. All with RLS: anyone reads public events, only the host edits or deletes, a guest can only change their own RSVP.

### Safety and abuse (applies to all phases)
- Length and range CHECK constraints, per-user uniqueness, flood-guard triggers on new tables, mirroring `supabase/hardening.sql`.
- Email-confirmed accounts for anything that publishes content visible to others.

## Left to the builder
- Exact hex values, tilt angles and shadow offsets (must keep contrast accessible).
- Image storage for event covers (Supabase Storage free tier is the likely fit).
- Waitlist behaviour, exact amenity list, vote-weighting formula, migration of old scores.

## Open items
- Event feature details (reminders, comments, co-hosts) deferred to the phase 3 follow-up.
- Production hosting and a rate-limited proxy remain out of scope.
