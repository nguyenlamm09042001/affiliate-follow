// src/pages/api/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ ok: true, id: req.query.id });
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing env" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const id = req.query.id as string;
    const { status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: "Missing id/status" });

    const { error } = await supabase
    .from("orders")
    .update({ status }) // <-- bọc trong ngoặc nhọn
    .eq("id", id);
      if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/orders/[id] error:", e?.message || e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}
