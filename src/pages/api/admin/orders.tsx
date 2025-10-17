// src/pages/api/admin/orders.tsx
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || "";

// validate: tránh tạo client với giá trị rỗng
function isValidUrl(u: string) {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && /supabase\.co$/.test(x.hostname);
  } catch {
    return false;
  }
}

if (!isValidUrl(supabaseUrl)) {
  // Đừng log key; chỉ log URL invalid để bé biết sai biến
  console.error("Invalid or missing SUPABASE_URL. Current:", supabaseUrl ? "[present]" : "[missing]");
}

if (!serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY (server env).");
}

const supabase = createClient(supabaseUrl, serviceKey);

const TABLE_NAME = "orders";

type OrderRow = {
  id: string;
  guest_id: string | null;
  contact_email: string | null;
  status: string | null;
  subtotal_vnd: number | null;
  discount_vnd: number | null;
  total_vnd: number | null;
  note: string | null;
  created_at: string;
  target_url: string | null;
  service_code: string | null;
  payment_method: string | null;
  transfer_submitted_at: string | null;
  transfer_note: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // chặn sớm nếu env lỗi
  if (!isValidUrl(supabaseUrl) || !serviceKey) {
    return res.status(500).json({
      error:
        "Server env thiếu hoặc sai: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Kiểm tra .env.local (dev) hoặc Vercel Env và restart.",
    });
  }

  if (req.method === "GET") {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Math.min(Number(req.query.pageSize ?? 10), 100);
      const status = (req.query.status as string) || "";
      const q = (req.query.q as string) || "";
      const from = (req.query.from as string) || "";
      const to = (req.query.to as string) || "";

      const fromIdx = (page - 1) * pageSize;
      const toIdx = fromIdx + pageSize - 1;

      // không dùng generic để tránh TS 2558
      let query = supabase.from(TABLE_NAME).select("*", { count: "exact" });

      if (status) query = query.eq("status", status);
      if (q) query = query.or(`contact_email.ilike.%${q}%,guest_id.ilike.%${q}%`);
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      query = query.order("created_at", { ascending: false }).range(fromIdx, toIdx);

      const { data, error, count } = await query;
      if (error) return res.status(400).json({ error: error.message });

      return res.json({
        items: (data ?? []) as OrderRow[],
        total: count ?? 0,
        page,
        pageSize,
      });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Unknown error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const {
        id,
        status,
        note,
        payment_method,
        transfer_submitted_at,
        transfer_note,
      } = req.body as {
        id: string;
        status?: string;
        note?: string | null;
        payment_method?: string | null;
        transfer_submitted_at?: string | null;
        transfer_note?: string | null;
      };

      if (!id) return res.status(400).json({ error: "Missing id" });

      const updates: Partial<OrderRow> = {};
      if (typeof status !== "undefined") updates.status = status;
      if (typeof note !== "undefined") updates.note = note;
      if (typeof payment_method !== "undefined") updates.payment_method = payment_method;
      if (typeof transfer_submitted_at !== "undefined") updates.transfer_submitted_at = transfer_submitted_at;
      if (typeof transfer_note !== "undefined") updates.transfer_note = transfer_note;

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updates as any)
        .eq("id", id)
        .select("*")
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ item: data as OrderRow });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Unknown error" });
    }
  }

  res.setHeader("Allow", "GET,PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
