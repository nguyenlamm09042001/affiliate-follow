/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FALLBACK_IMG = process.env.NEXT_PUBLIC_FALLBACK_IMG || "/placeholder.png";

function badEnv(res: NextApiResponse) {
  return res.status(500).json({ error: "missing_env", hasUrl: !!BASE, hasService: !!SERVICE });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!BASE || !SERVICE) return badEnv(res);

  try {
    if (req.method === "GET") {
      const endpoint =
        `${BASE}/rest/v1/deals` +
        `?select=id,slug,name,price,old_price,image,category,active:is_active,affiliate_link,updated_at` +
        `&order=updated_at.desc&limit=100`;
      const r = await fetch(endpoint, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
      const data = await r.json();
      return res.status(200).json({ items: Array.isArray(data) ? data : [] });
    }

    if (req.method === "POST") {
      const { source_url, affiliate_link, name, category = "Shopee", price = 0 } = req.body || {};
      if (!affiliate_link) return res.status(400).json({ error: "missing_affiliate_link" });

      let finalName = name || null;
      let image: string | null = null;

      // ✅ Tự tạo origin dựa vào request host (không cần NEXT_PUBLIC_BASE_URL)
      const origin = `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

      if (source_url) {
        try {
          const ogRes = await fetch(`${origin}/api/shopee/og?url=${encodeURIComponent(source_url)}`);
          if (ogRes.ok) {
            const j = await ogRes.json();
            if (!finalName) finalName = j.title || null;
            image = j.image || null;
          }
        } catch (err) {
          console.error("OG fetch error:", err);
        }
      }

      const slug =
        (finalName || affiliate_link)
          .toLowerCase()
          .replace(/https?:\/\//, "")
          .replace(/[^a-z0-9\- ]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 80) || crypto.randomUUID();

      const body = [
        {
          name: finalName || "Sản phẩm Shopee",
          slug,
          category,
          price,
          old_price: null,
          image: image || FALLBACK_IMG,   // ✅ luôn có giá trị
          is_active: true,
          affiliate_link,
          updated_at: new Date().toISOString(),
        },
      ];

      const r = await fetch(`${BASE}/rest/v1/deals`, {
        method: "POST",
        headers: {
          apikey: SERVICE,
          Authorization: `Bearer ${SERVICE}`,
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const text = await r.text();
        console.error("Insert failed:", text);
        return res.status(500).json({ error: "insert_failed", detail: text });
      }

      const inserted = await r.json();
      return res.status(200).json({ item: inserted?.[0] ?? null });
    }

    if (req.method === "PATCH") {
      const { id, ...patch } = req.body || {};
      if (!id) return res.status(400).json({ error: "missing_id" });

      const r = await fetch(`${BASE}/rest/v1/deals?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE,
          Authorization: `Bearer ${SERVICE}`,
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
      });

      if (!r.ok) return res.status(500).json({ error: "update_failed", body: await r.text() });
      const updated = await r.json();
      return res.status(200).json({ item: updated?.[0] ?? null });
    }

    if (req.method === "DELETE") {
      const id = (req.query.id as string) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: "missing_id" });

      const r = await fetch(`${BASE}/rest/v1/deals?id=eq.${id}`, {
        method: "DELETE",
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
      });

      if (!r.ok) return res.status(500).json({ error: "delete_failed", body: await r.text() });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e: any) {
    console.error("API Error:", e);
    return res.status(500).json({ error: "server_error", message: String(e?.message || e) });
  }
}
