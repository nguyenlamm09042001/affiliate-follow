import { createClient } from "@supabase/supabase-js";

export const supabaseServer = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only

  if (!url) throw new Error("SUPABASE_URL missing");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");

  return createClient(url, key, { auth: { persistSession: false } });
};
