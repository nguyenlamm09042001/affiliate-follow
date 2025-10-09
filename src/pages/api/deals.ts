import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) {
      return res.status(500).json({ error: "missing_env", message: "Missing SUPABASE URL/ANON KEY" });
    }

    const sb = createClient(url, anon, { auth: { persistSession: false } });

    const { data, error } = await sb
      .from("deals")
      .select("id, slug, name, price, old_price, image, category, active, affiliate_link, updated_at")
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "supabase_error", message: error.message });
    }

    const items = (data ?? []).map((d: any) => ({
      id: d.id,
      slug: d.slug,
      name: d.name,
      price: d.price ?? undefined,
      old_price: d.old_price ?? undefined,
      image: d.image ?? "",
      category: d.category ?? "",
      active: d.active ?? false,
      affiliate_link: d.affiliate_link ?? "",
      updated_at: d.updated_at ?? "",
    }));

    res.status(200).json({ items });
  } catch (e: any) {
    res.status(500).json({ error: "fetch_failed", message: e?.message || String(e) });
  }
}
