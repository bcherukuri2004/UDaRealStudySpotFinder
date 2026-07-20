import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Whether Supabase is configured. Lets the app degrade gracefully
// (reviews simply unavailable) instead of crashing if env vars are missing.
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[StudySpot] Supabase env vars missing — review features are disabled. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
  );
}

// Safe to expose in the browser: the anon key is public by design,
// and access is governed by Row Level Security policies in the database.
export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
