// pages/api/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

function assertEnv() {
  const miss: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) miss.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) miss.push("SUPABASE_SERVICE_ROLE_KEY");
  if (miss.length) {
    throw new Error(`Missing env: ${miss.join(", ")}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    assertEnv();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only key
      { auth: { persistSession: false } }
    );

    const { service_code, price_vnd, target_url } = (req.body || {}) as {
      service_code?: string;
      price_vnd?: number;
      target_url?: string;
    };

    if (!service_code || !price_vnd || !target_url) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        service_code,
        total_vnd: price_vnd,
        target_url,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message || "Supabase error" });
    }

    return res.status(200).json({ order_id: data!.id });
  } catch (e: any) {
    console.error("POST /api/orders error:", e?.message || e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}
