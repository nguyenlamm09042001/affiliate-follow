import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { slug, qty = 1, guest_id } = req.body;
  if (!slug) return res.status(400).json({ error: "Missing slug" });

  // 1️⃣ Lấy sản phẩm từ bảng deals
  const { data: deal, error: dealErr } = await supabase
    .from("deals")
    .select("id, name, price, image, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (dealErr || !deal) return res.status(404).json({ error: "Sản phẩm không tồn tại" });

  const subtotal = deal.price * qty;
  const total = subtotal; // sau này có giảm giá thì trừ thêm
  const snapshot = { name: deal.name, image: deal.image, slug: deal.slug, price: deal.price };

  // 2️⃣ Tạo order + order_item
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert([{ guest_id, subtotal_vnd: subtotal, total_vnd: total, status: "pending" }])
    .select("id")
    .single();

  if (orderErr || !order) return res.status(500).json({ error: "Không tạo được đơn" });

  await supabase.from("order_items").insert([
    {
      order_id: order.id,
      deal_id: deal.id,
      deal_snapshot: snapshot,
      unit_price_vnd: deal.price,
      quantity: qty,
    },
  ]);

  res.status(200).json({ order_id: order.id, total_vnd: total, name: deal.name });
}
