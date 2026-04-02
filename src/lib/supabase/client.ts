import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build-time SSR, env vars may not be available.
    // Return a dummy client that will be replaced on the actual client.
    return createBrowserClient<Database>(
      "http://localhost:54321",
      "placeholder-key-for-build-time"
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
