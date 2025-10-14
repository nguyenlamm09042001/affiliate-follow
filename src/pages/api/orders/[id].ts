// pages/api/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_STATUS = ["pending","paid","failed","cancelled","processing","completed"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { id } = req.query as { id: string };
    const { status, transfer_note } = (req.body || {}) as { status?: string; transfer_note?: string };

    const patch: Record<string, any> = {};
    if (status) {
      if (!ALLOWED_STATUS.includes(status as any)) {
        return res.status(400).json({ error: `Status không hợp lệ. Cho phép: ${ALLOWED_STATUS.join(", ")}` });
      }
      patch.status = status;
    }
    if (transfer_note !== undefined) {
      patch.transfer_note = transfer_note;
    }
    // Khi user bấm “Tôi đã chuyển khoản” → cập nhật timestamp
    if (status === "processing" || status === "paid") {
      patch.transfer_submitted_at = new Date().toISOString();
    }

    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/orders/[id] error:", e?.message || e);
    res.status(500).json({ error: e?.message || "Internal error" });
  }
}
