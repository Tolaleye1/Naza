import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

function getServerEnv(
  name:
    | "NEXT_PUBLIC_SUPABASE_URL"
    | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    | "SUPABASE_SERVICE_ROLE_KEY"
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }

  return value;
}

export function createSupabaseServerClient() {
  return createClient<Database>(
    getServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

// ADMIN ONLY
// requires: SUPABASE_SERVICE_ROLE_KEY
export function createSupabaseAdminClient() {
  return createClient<Database>(
    getServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
