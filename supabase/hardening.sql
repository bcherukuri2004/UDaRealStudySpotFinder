-- StudySpot Finder — anti-abuse hardening
-- Safe to run AFTER schema.sql. Run in Supabase → SQL Editor.

-- =========================================
-- 1. One review per logged-in user per place.
-- Stops a signed-in user from spamming the same spot repeatedly.
-- Partial index: only applies when user_id is present, so guest
-- reviews (user_id NULL) are unaffected.
-- =========================================
create unique index if not exists reviews_one_per_user_per_place
  on reviews (place_id, user_id)
  where user_id is not null;

-- =========================================
-- 2. Field length limits (defense against junk payloads).
-- =========================================
alter table reviews
  drop constraint if exists reviews_author_name_len;
alter table reviews
  add constraint reviews_author_name_len
  check (author_name is null or char_length(author_name) <= 60);

alter table places
  drop constraint if exists places_name_len;
alter table places
  add constraint places_name_len
  check (char_length(name) between 1 and 200);

alter table places
  drop constraint if exists places_address_len;
alter table places
  add constraint places_address_len
  check (address is null or char_length(address) <= 300);

-- =========================================
-- 3. Sanity-check coordinates so garbage can't be stored.
-- =========================================
alter table places
  drop constraint if exists places_valid_coords;
alter table places
  add constraint places_valid_coords
  check (
    (lat is null and lng is null) or
    (lat between -90 and 90 and lng between -180 and 180)
  );

-- =========================================
-- 4. Global insert throttle (blunt but effective anti-flood).
-- Rejects a review if the SAME place received more than 10 reviews
-- in the past minute — a pattern that only happens under attack.
-- =========================================
create or replace function check_review_flood()
returns trigger
language plpgsql
security definer
as $$
begin
  if (
    select count(*) from reviews
    where place_id = new.place_id
      and created_at > now() - interval '1 minute'
  ) >= 10 then
    raise exception 'Too many reviews submitted for this place. Please try again later.';
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_flood_guard on reviews;
create trigger reviews_flood_guard
  before insert on reviews
  for each row execute function check_review_flood();

-- =========================================
-- 5. Lock down the aggregate view.
-- Views run with the creator's rights by default; make it obey
-- the caller's RLS instead.
-- =========================================
alter view place_ratings set (security_invoker = on);
