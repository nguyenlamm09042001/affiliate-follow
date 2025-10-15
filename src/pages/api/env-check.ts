import type { NextApiRequest, NextApiResponse } from "next";

function decodeRef(jwt?: string) {
  try {
    if (!jwt) return null;
    const body = jwt.split(".")[1];
    const json = Buffer.from(body, "base64").toString("utf8");
    return JSON.parse(json)?.ref || null;
  } catch {
    return null;
  }
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const srv  = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  res.status(200).json({
    url,
    anon_len: anon?.length || 0,
    srv_len: srv?.length || 0,
    anon_head: anon?.slice(0, 12),
    anon_tail: anon?.slice(-12),
    srv_head: srv?.slice(0, 12),
    srv_tail: srv?.slice(-12),
    ref_from_srv: decodeRef(srv),
  });
}
