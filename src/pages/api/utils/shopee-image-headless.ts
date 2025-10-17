import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { type Browser, type HTTPResponse } from "puppeteer";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Tìm URL ảnh CDN trong chuỗi
function firstCdnUrl(str: string): string | null {
  const m =
    str.match(/https?:\/\/[a-z0-9.-]*susercontent\.com\/file\/[^\s"')><]+/i) ||
    str.match(/https?:\/\/cf\.shopee\.[a-z.]+\/file\/[^\s"')><]+/i) ||
    str.match(/https?:\/\/deo\.shopeemobile\.com\/.*?\/file\/[^\s"')><]+/i);
  return m?.[0] || null;
}

// Lấy shopid/itemid từ URL sau cùng
function extractIds(u: string) {
  const m = u.match(/shopee\.vn\/product\/(\d+)\/(\d+)/);
  if (m) return { shopid: m[1], itemid: m[2] };
  const m2 = u.match(/product\/(\d+)\/(\d+)/);
  if (m2) return { shopid: m2[1], itemid: m2[2] };
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = ((req.query.url as string) || "").trim();
  const debug = req.query.debug === "1";
  if (!url) return res.status(400).json({ error: "Missing url" });

  let browser: Browser | null = null;
  const trace: any[] = [];

  try {
    browser = await puppeteer.launch({
      headless: true, // boolean cho đúng kiểu
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    // Thu thập mọi URL CDN ảnh xuất hiện trong các response
    const seenCdn: Set<string> = new Set();
    const onResp = async (resp: HTTPResponse) => {
      try {
        const u = resp.url();
        const hit = firstCdnUrl(u);
        if (hit) seenCdn.add(hit);
      } catch {}
    };
    page.on("response", onResp);

    // Đi tới URL
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await sleep(1000);
    // Cho trang “ổn định” thêm chút
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 15_000 }).catch(() => {});

    // Theo redirect để lấy URL cuối
    const finalUrl = page.url();
    trace.push({ step: "final_url", finalUrl });

    // ===== Lớp 1: gọi Shopee API TỪ BÊN TRONG TRANG (same-origin) =====
    const ids = extractIds(finalUrl);
    trace.push({ step: "ids", ids });

    if (ids) {
      const { shopid, itemid } = ids;
      const apiResult = await page.evaluate(
        async ({ shopid, itemid }) => {
          async function getJson(endpoint: string) {
            try {
              const r = await fetch(endpoint, {
                // same-origin, có cookie/session/headers của trang Shopee
                credentials: "include",
              });
              if (!r.ok) return null;
              return await r.json();
            } catch {
              return null;
            }
          }
          const v4 = await getJson(`/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`);
          const imagesV4: string[] =
            v4?.data?.images ??
            v4?.data?.item?.images ??
            v4?.item?.images ??
            [];

          if (imagesV4 && imagesV4.length) {
            return { src: imagesV4[0] };
          }

          const v2 = await getJson(`/api/v2/item/get?itemid=${itemid}&shopid=${shopid}`);
          const imagesV2: string[] =
            v2?.item?.images ??
            v2?.data?.item?.images ??
            v2?.data?.images ??
            [];

          if (imagesV2 && imagesV2.length) {
            return { src: imagesV2[0] };
          }
          return null;
        },
        { shopid, itemid }
      );

      if (apiResult?.src) {
        const image =
          apiResult.src.startsWith("http")
            ? apiResult.src
            : `https://down-vn.img.susercontent.com/file/${apiResult.src}`;
        page.off("response", onResp);
        await browser.close();
        return res.json({ image, ...(debug ? { trace } : {}) });
      }
    }

    // ===== Lớp 2: bắt từ DOM/response khi trang đã render =====
    // Nhiều ảnh lazy-load → scroll vài lần cho chắc
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 600));
      await sleep(700);
    }
    // Nếu đã thấy CDN từ responses thì dùng luôn
    if (seenCdn.size) {
      const image = Array.from(seenCdn.values())[0];
      page.off("response", onResp);
      await browser.close();
      return res.json({ image, ...(debug ? { trace: [...trace, { step: "cdn_from_responses", count: seenCdn.size }] } : {}) });
    }

    // 2a) Meta og:image
    const og = await page.$$eval(
      'meta[property="og:image"]',
      (els: Element[]) =>
        (els as HTMLMetaElement[]).map((e) => e.content).filter(Boolean)
    ).catch(() => []);
    if (og && og[0]) {
      page.off("response", onResp);
      await browser.close();
      return res.json({ image: og[0], ...(debug ? { trace: [...trace, { step: "og_image" }] } : {}) });
    }

    // 2b) <img> src/srcset
    const imgCandidates = await page
      .$$eval("img", (imgs: Element[]) => {
        const out: string[] = [];
        for (const el of imgs) {
          const img = el as HTMLImageElement;
          const src = (img.getAttribute("src") || "").trim();
          const srcset = (img.getAttribute("srcset") || "").trim();
          if (src) out.push(src);
          if (srcset) out.push(srcset);
        }
        return out;
      })
      .catch(() => []);
    const domCdn = firstCdnUrl(imgCandidates.join(" "));
    if (domCdn) {
      page.off("response", onResp);
      await browser.close();
      return res.json({ image: domCdn, ...(debug ? { trace: [...trace, { step: "cdn_from_dom_img" }] } : {}) });
    }

    // 2c) style="background-image: url(...)"
    const bgCandidates = await page
      .$$eval("*", (nodes: Element[]) => {
        const out: string[] = [];
        for (const n of nodes) {
          const s = (n as HTMLElement).style?.backgroundImage || "";
          if (s) out.push(s);
        }
        return out;
      })
      .catch(() => []);
    const bgCdn = firstCdnUrl(bgCandidates.join(" "));
    if (bgCdn) {
      page.off("response", onResp);
      await browser.close();
      return res.json({ image: bgCdn, ...(debug ? { trace: [...trace, { step: "cdn_from_dom_bg" }] } : {}) });
    }

    // ===== Lớp 3: regex toàn bộ HTML một lần cuối =====
    const html = await page.content();
    const htmlCdn = firstCdnUrl(html);
    page.off("response", onResp);
    await browser.close();

    if (htmlCdn) {
      return res.json({ image: htmlCdn, ...(debug ? { trace: [...trace, { step: "cdn_from_html" }] } : {}) });
    }

    return res.status(404).json({ error: "Không tìm thấy ảnh", ...(debug ? { trace } : {}) });
  } catch (e: any) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    return res.status(500).json({ error: e?.message || "Headless failed", ...(debug ? { trace } : {}) });
  }
}
