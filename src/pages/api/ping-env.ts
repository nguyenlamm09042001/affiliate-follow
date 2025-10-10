import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    anonLen: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    serviceLen: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    vercel: !!process.env.VERCEL,
    node: process.version,
  });
}
