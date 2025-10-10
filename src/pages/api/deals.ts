/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!baseUrl || !service) {
      return res.status(500).json({
        error: "missing_env",
        hasUrl: !!baseUrl,
        hasService: !!service,
      });
    }

    const endpoint =
      `${baseUrl}/rest/v1/deals` +
      `?select=id,slug,name,price,old_price,image,category,active,affiliate_link,updated_at` +
      `&order=updated_at.desc&limit=100`;

    const r = await fetch(endpoint, {
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
      cache: "no-store",
    });

    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        error: "supabase_rest_error",
        status: r.status,
        endpoint,
        body: text,
      });
    }

    const data = text ? JSON.parse(text) : [];
    // nhẹ nhàng cache CDN 15s
    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");
    return res.status(200).json({ items: data });
  } catch (e: any) {
    // log nguyên nhân mạng nếu có
    return res.status(500).json({
      error: "fetch_failed",
      message: String(e?.message || e),
      cause: (e as any)?.cause
        ? {
            code: (e as any).cause.code || null,
            syscall: (e as any).cause.syscall || null,
            address: (e as any).cause.address || null,
            port: (e as any).cause.port || null,
          }
        : null,
    });
  }
}
