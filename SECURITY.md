# Security Notes

## Current status (local development)

- **Foursquare key** lives in `.env.local` (gitignored) with **no `VITE_` prefix**, so it never enters the browser bundle. It is attached server-side by the Vite dev proxy.
- **Supabase anon key** is `VITE_`-prefixed and *is* public in the browser. That is by design — access is controlled by Row Level Security (RLS) in Postgres, not by hiding the key.
- The dev proxy is scoped to a single path (`/fsq/places/search`) so arbitrary Foursquare endpoints can't be piped through our key.
- Client-side caching (5 min) + throttling (1 call / 2s) limit quota burn.

## ⚠️ Before deploying to production

The Vite proxy **only exists in `npm run dev`**. A production build has no server, so `/fsq/...`
will 404 and discovery will break. Replacing it is also the single most important
security step.

**Required: a serverless proxy function** (Vercel/Netlify/Supabase Edge Function) that:

1. Reads `FOURSQUARE_API_KEY` from server-side environment variables (never client)
2. **Accepts only the search endpoint** — no arbitrary path forwarding
3. **Validates and clamps inputs**: `lat`/`lng` in range, `limit` <= 20, `radius` <= 5000
4. **Rate limits per IP** (e.g. 10 requests/minute) — without this, anyone can drain your quota
5. **Restricts CORS** to your own deployed domain only
6. Optionally caches responses server-side to further cut API calls

Without #4 and #5, a deployed app effectively hands your API key to the internet.

## Known accepted risks

- **Guest reviews can be spammed.** Anonymous inserts are allowed by product design.
  The DB has a flood guard (max 10 reviews/place/minute) and length limits, but a
  determined actor could still submit junk. Mitigations if it becomes a problem:
  captcha, require an account after N guest reviews, or per-IP limits via an Edge Function.
- **Guest reviews cannot be edited or deleted by their author** (no identity to check
  against). This is intentional.
- **Supabase free tier does not overage-bill** — it caps/pauses instead, so DB abuse
  degrades service rather than costing money.
- **Free-tier projects pause after ~1 week of inactivity.** Plan for a graceful fallback
  if reviews fail to load.
