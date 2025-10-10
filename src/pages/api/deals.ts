/* pages/api/deals.ts */
import type { NextApiRequest, NextApiResponse } from "next";

// (nếu dùng app router thì không cần 2 dòng dưới; pages/api mặc định là node runtime)
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !service) {
      return res.status(500).json({
        error: "missing_env",
        message: "Thiếu SUPABASE URL hoặc SERVICE_ROLE_KEY",
        hasUrl: !!url,
        hasService: !!service,
      });
    }

    // chuẩn hoá URL (tránh thừa /)
    const base = url.replace(/\/+$/, "");

    // gọi REST trực tiếp để loại trừ vấn đề SDK
    const endpoint = `${base}/rest/v1/deals?select=id,slug,name,price,old_price,image,category,active,affiliate_link,updated_at&order=updated_at.desc&limit=100`;

    const r = await fetch(endpoint, {
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        // Nếu dùng RLS và muốn query với anon hãy đổi sang anon key
        // nhưng ở đây dùng service role để bypass RLS
      },
      // đảm bảo không cache ở edge/CDN
      cache: "no-store",
    });

    const txt = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        error: "supabase_rest_error",
        status: r.status,
        body: txt,
        endpoint,
      });
    }

    const data = txt ? JSON.parse(txt) : [];
    return res.status(200).json({ items: data ?? [] });
  } catch (e: any) {
    return res.status(500).json({
      error: "fetch_failed",
      message: String(e?.message || e),
      stack: e?.stack || null,
    });
  }
}
