import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // chỉ dùng ở server
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "GET") return res.status(405).end();
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing order id" });

  const { data, error } = await supabase
    .from("orders")
    .select("id,status,total_vnd,created_at")
    .eq("id", id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Order not found" });
  return res.status(200).json(data);
}
