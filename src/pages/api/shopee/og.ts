// src/pages/api/shopee/og.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = (req.query.url as string) || (req.body && (req.body.url as string));
  if (!url) return res.status(400).json({ error: "missing_url" });

  try {
    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "accept-language": "vi,en;q=0.9",
      },
    });
    const html = await r.text();

    const pick = (re: RegExp) => html.match(re)?.[1]?.trim() || null;

    const title =
      pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/<title[^>]*>([^<]+)<\/title>/i);

    const image =
      pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/"image":"(https?:\/\/[^"]+)"/i);

    return res.status(200).json({ title, image });
  } catch (e: any) {
    return res.status(500).json({ error: "fetch_failed", message: String(e?.message || e) });
  }
}
