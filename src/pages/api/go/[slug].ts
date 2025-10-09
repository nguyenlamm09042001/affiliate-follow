import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (!slug) return res.redirect("/");

  const r = await fetch(`${BACKEND}/api/deals`);
  const data = await r.json();
  const item = (data.items ?? []).find((i: any) => i.slug === slug);

  if (item?.affiliate_link) {
    res.writeHead(302, { Location: item.affiliate_link });
  } else {
    res.writeHead(302, { Location: "/" });
  }
  res.end();
}
