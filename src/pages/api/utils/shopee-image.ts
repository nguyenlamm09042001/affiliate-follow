import type { NextApiRequest, NextApiResponse } from "next";

/** ===== Helpers ===== */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

function buildCdnUrl(v: string) {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://down-vn.img.susercontent.com/file/${v}`;
}

function extractIds(u: string) {
  const m = u.match(/shopee\.vn\/product\/(\d+)\/(\d+)/);
  if (m) return { shopid: m[1], itemid: m[2] };
  const m2 = u.match(/product\/(\d+)\/(\d+)/);
  if (m2) return { shopid: m2[1], itemid: m2[2] };
  return null;
}

/** Shopee hay escape slash: https:\u002F\u002F...  hoặc https:\\/\\/...  */
function normalizeHtml(s: string) {
  return s
    .replace(/\\u002F/gi, "/")
    .replace(/\\\\\//g, "/")
    .replace(/\\\//g, "/");
}

async function resolveFinalUrl(url: string, headers: Record<string, string>) {
  const r = await fetch(url, { redirect: "follow", headers });
  return r.url || url;
}

async function fetchJson(url: string, headers: Record<string, string>) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`Upstream ${r.status}`);
  return r.json();
}

async function tryShopeeAPIs(
  shopid: string,
  itemid: string,
  headers: Record<string, string>,
  trace: any[]
): Promise<string | null> {
  // v4 (thường bị 403 khi gọi từ server, nên chỉ thử)
  try {
    const j = await fetchJson(
      `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`,
      headers
    );
    trace.push({ step: "api_v4_ok" });
    const hash =
      j?.data?.images?.[0] ??
      j?.data?.item?.images?.[0] ??
      j?.item?.images?.[0] ??
      null;
    if (hash) return buildCdnUrl(hash);
  } catch (e: any) {
    trace.push({ step: "api_v4_error", error: String(e) });
  }

  // v2 fallback
  try {
    const j = await fetchJson(
      `https://shopee.vn/api/v2/item/get?itemid=${itemid}&shopid=${shopid}`,
      headers
    );
    trace.push({ step: "api_v2_ok" });
    const hash =
      j?.item?.images?.[0] ??
      j?.data?.item?.images?.[0] ??
      j?.data?.images?.[0] ??
      null;
    if (hash) return buildCdnUrl(hash);
  } catch (e: any) {
    trace.push({ step: "api_v2_error", error: String(e) });
  }

  return null;
}

function pick(html: string, re: RegExp) {
  const m = html.match(re);
  return m?.[1] || null;
}

/** Quét HTML đã normalize để lôi URL ảnh */
async function tryParseHtml(
  url: string,
  headers: Record<string, string>,
  trace: any[]
) {
  const r = await fetch(url, { redirect: "follow", headers });
  if (!r.ok) {
    trace.push({ step: "html_status", status: r.status });
    return null;
  }

  const raw = await r.text();
  const html = normalizeHtml(raw);
  trace.push({ step: "html_len", len: html.length });

  // 1) og:image / twitter:image / secure_url
  const meta =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']?([^"' >]+)["']?/i)?.[1] ||
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']?([^"' >]+)["']?/i)?.[1] ||
    html.match(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']?([^"' >]+)["']?/i)?.[1];
  if (meta) return meta;

  // 2) JSON blocks: images/image/cover
  const inJson =
    html.match(/"images"\s*:\s*\[\s*"([^"]+)"/i)?.[1] ||
    html.match(/"image"\s*:\s*\[\s*"([^"]+)"/i)?.[1] ||
    html.match(/"image"\s*:\s*"([^"]+)"/i)?.[1] ||
    html.match(/"cover"\s*:\s*"([^"]+)"/i)?.[1];
  if (inJson) return buildCdnUrl(inJson);

  // 3) Bắt trực tiếp mọi URL CDN trong HTML (kể cả trong srcset)
  const cdn =
    html.match(/https?:\/\/[a-z0-9.-]*susercontent\.com\/file\/[^\s"'<>,)]+/i)?.[0] ||
    html.match(/https?:\/\/cf\.shopee\.[a-z.]+\/file\/[^\s"'<>,)]+/i)?.[0] ||
    html.match(/https?:\/\/deo\.shopeemobile\.com\/.*?\/file\/[^\s"'<>,)]+/i)?.[0];
  if (cdn) return cdn;

  return null;
}

/** ===== Handler ===== */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let url = (req.query.url as string || "").trim();
  const debug = req.query.debug === "1";
  if (!url) return res.status(400).json({ error: "Missing url" });

  const headers = {
    "User-Agent": UA,
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    Accept: "*/*",
  };
  const trace: any[] = [];

  try {
    // 1) Theo shortlink -> URL sản phẩm thật
    const finalUrl = await resolveFinalUrl(url, headers);
    trace.push({ step: "final_url", finalUrl });

    // 2) Thử API (nếu Shopee cho), nếu 403 sẽ log rồi bỏ qua
    const ids = extractIds(finalUrl);
    trace.push({ step: "ids", ids });
    if (ids) {
      const viaApi = await tryShopeeAPIs(ids.shopid, ids.itemid, headers, trace);
      if (viaApi) return res.json({ image: viaApi, ...(debug ? { trace } : {}) });
    }

    // 3) Fallback: bóc từ HTML (đã normalize)
    const viaHtml = await tryParseHtml(finalUrl, headers, trace);
    if (viaHtml) return res.json({ image: viaHtml, ...(debug ? { trace } : {}) });

    return res.status(404).json({ error: "Không tìm thấy ảnh", ...(debug ? { trace } : {}) });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Fetch failed", ...(debug ? { trace } : {}) });
  }
}
