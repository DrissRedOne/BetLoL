import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

/**
 * Supabase admin client using the service_role key.
 * NEVER use this client in browser code or expose the key.
 * Use only in Server Actions, API routes, or Edge Functions.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
