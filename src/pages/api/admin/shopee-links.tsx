import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = supabaseServer(); // 💡 PHẢI có dòng này
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("source", "shopee")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json({ items: data });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const { source_url, affiliate_link } = body;

      if (!affiliate_link) return res.status(400).json({ error: "Thiếu affiliate_link" });

      const { error } = await supabase.from("deals").insert([
        {
          source: "shopee",
          source_url,
          affiliate_link,
          active: true,
          created_at: new Date(),
        },
      ]);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === "PATCH") {
      const { id, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: "Thiếu id" });

      const { error } = await supabase.from("deals").update(rest).eq("id", id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Thiếu id" });

      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (e: any) {
    console.error("API ERROR:", e);
    return res.status(500).json({ error: e.message || "Internal Server Error" });
  }
}
