import type { NextApiRequest, NextApiResponse } from "next";
import { resolve4, resolve6 } from "node:dns/promises";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const base = raw.replace(/\/+$/,"");
    let host: string | null = null;
    try { host = base ? new URL(base).hostname : null; } catch {}

    // in ra mã ký tự để bắt ký tự lạ/vô hình
    const codes = host ? Array.from(host).map(c => c.charCodeAt(0)) : null;

    let a:any=null, aaaa:any=null, headOk=false;

    if (host) {
      a = await resolve4(host).catch(e => ({ error: e.code || String(e) }));
      aaaa = await resolve6(host).catch(e => ({ error: e.code || String(e) }));
      headOk = await fetch(base + "/rest/v1/", { method: "HEAD" })
        .then(r => r.ok).catch(() => false);
    }

    const httpbinOk = await fetch("https://httpbin.org/get")
      .then(r => r.ok).catch(() => false);

    res.status(200).json({ raw, base, host, charCodes: codes, dnsA: a, dnsAAAA: aaaa, supabaseHeadOk: headOk, httpbinOk });
  } catch (e:any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
