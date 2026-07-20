-- StudySpot Finder — database schema
-- Paste this whole file into Supabase → SQL Editor → Run

-- =========================================
-- PLACES
-- One row per real-world spot that has been reviewed at least once.
-- external_id is the id from wherever the place came from
-- (Foursquare fsq_place_id, or "mock-1" for our curated demo spots).
-- =========================================
create table if not exists places (
  id           uuid primary key default gen_random_uuid(),
  external_id  text unique not null,
  name         text not null,
  address      text,
  lat          double precision,
  lng          double precision,
  types        text[] default '{}',
  created_at   timestamptz not null default now()
);

-- =========================================
-- REVIEWS
-- The heart of the app: work-specific amenity ratings.
-- user_id is NULL for guest reviews (guests are allowed by design).
-- noise follows our app convention: 1 = very quiet, 5 = loud.
-- =========================================
create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  place_id     uuid not null references places(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  author_name  text,
  wifi         smallint not null check (wifi     between 1 and 5),
  outlets      smallint not null check (outlets  between 1 and 5),
  noise        smallint not null check (noise    between 1 and 5),
  seating      smallint not null check (seating  between 1 and 5),
  comment      text check (char_length(comment) <= 1000),
  created_at   timestamptz not null default now()
);

create index if not exists reviews_place_id_idx on reviews(place_id);

-- =========================================
-- AGGREGATED RATINGS
-- A view that averages every review per place, so the app can
-- fetch "what does the crowd say about this spot?" in one query.
-- =========================================
create or replace view place_ratings as
select
  p.id            as place_id,
  p.external_id,
  count(r.id)                          as review_count,
  round(avg(r.wifi)::numeric,    1)    as avg_wifi,
  round(avg(r.outlets)::numeric, 1)    as avg_outlets,
  round(avg(r.noise)::numeric,   1)    as avg_noise,
  round(avg(r.seating)::numeric, 1)    as avg_seating
from places p
left join reviews r on r.place_id = p.id
group by p.id, p.external_id;

-- =========================================
-- ROW LEVEL SECURITY
-- RLS is Postgres' per-row permission system. With it ON, the default
-- is "deny everything", and we explicitly open only what we want.
-- This is what makes it safe to ship the anon key in the browser.
-- =========================================
alter table places  enable row level security;
alter table reviews enable row level security;

-- Anyone (logged in or guest) can READ places and reviews.
create policy "places are publicly readable"
  on places for select using (true);

create policy "reviews are publicly readable"
  on reviews for select using (true);

-- Anyone can ADD a place record and a review (guests allowed by design).
create policy "anyone can add a place"
  on places for insert with check (true);

create policy "anyone can add a review"
  on reviews for insert with check (true);

-- Only the original author can edit or delete their own review.
-- Guest reviews (user_id is null) can't be edited by anyone — intentional.
create policy "users can update their own reviews"
  on reviews for update using (auth.uid() = user_id);

create policy "users can delete their own reviews"
  on reviews for delete using (auth.uid() = user_id);
