import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role chỉ dùng server
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { order_id, note } = req.body as { order_id: string; note?: string };
  if (!order_id) return res.status(400).json({ error: "Missing order_id" });

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_method: "bank",
      status: "transfer_submitted",         // trạng thái chờ bạn verify
      transfer_submitted_at: new Date().toISOString(),
      transfer_note: note ?? null,
    })
    .eq("id", order_id)
    .select("id,status,transfer_submitted_at")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, order: data });
}
