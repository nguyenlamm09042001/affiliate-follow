// src/pages/api/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

function assertEnv() {
  const miss: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) miss.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) miss.push("SUPABASE_SERVICE_ROLE_KEY");
  if (miss.length) throw new Error(`Missing env: ${miss.join(", ")}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, route: "orders" }); // healthcheck
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    assertEnv();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const b = (req.body || {}) as any;
    const service_code: string | undefined = b.service_code;
    const price_vnd: number | undefined =
      typeof b.price_vnd === "number" ? b.price_vnd : parseInt(String(b.price_vnd ?? "").replace(/\D/g, ""), 10);
    const target_url: string | undefined = b.target_url;
    const payment_method: string | undefined = b.payment_method ?? "bank_transfer";

    if (!service_code || !price_vnd || !target_url) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const insertRes = await supbaseInsert(supabase, {
      service_code,
      target_url,
      payment_method,
      subtotal_vnd: price_vnd,
      discount_vnd: 0,
      total_vnd: price_vnd,
      status: "pending",
    });

    if (!insertRes.ok) {
      console.error("Supabase insert error:", insertRes.error);
      return res.status(500).json({ error: insertRes.error });
    }

    return res.status(201).json({ order_id: insertRes.id });
  } catch (e: any) {
    console.error("POST /api/orders error:", e?.message || e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}

async function supbaseInsert(supabase: any, row: any): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.from("orders").insert(row).select("id").maybeSingle();
  if (error) return { ok: false, error: error.message || "Supabase error" };
  if (data?.id) return { ok: true, id: data.id };

  const { data: again, error: e2 } = await supabase
    .from("orders")
    .select("id")
    .eq("service_code", row.service_code)
    .eq("target_url", row.target_url)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (e2) return { ok: false, error: e2.message || "Supabase error" };
  if (again?.id) return { ok: true, id: again.id };

  return { ok: false, error: "Không lấy được order_id sau khi insert" };
}
