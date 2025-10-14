// pages/api/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // dùng service role ở server
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { service_code, price_vnd, target_url } = req.body as {
    service_code: string;
    price_vnd: number;
    target_url?: string;
  };

  if (!service_code || !price_vnd || !target_url) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  // tạo order
  const { data, error } = await supabase
    .from("orders")
    .insert({
      service_code,
      total_vnd: price_vnd,
      target_url,          // ✅ lưu link khách hàng
      status: "pending"
    })
    .select("id")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ order_id: data.id });
}
