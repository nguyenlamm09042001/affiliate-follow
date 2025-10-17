// src/pages/admin/orders.tsx
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AdminShell from "@/components/admin/AdminShell";

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

type ListResp = {
  items: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = (u: string) => fetch(u).then((r) => r.json());

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-200/20 text-yellow-300 ring-yellow-400/30",
  paid_pending_verify: "bg-indigo-200/20 text-indigo-300 ring-indigo-400/30",
  processing: "bg-blue-200/20 text-blue-300 ring-blue-400/30",
  paid: "bg-emerald-200/20 text-emerald-300 ring-emerald-400/30",
  completed: "bg-green-200/20 text-green-300 ring-green-400/30",
  canceled: "bg-rose-200/20 text-rose-300 ring-rose-400/30",
  refunded: "bg-purple-200/20 text-purple-300 ring-purple-400/30",
  failed: "bg-slate-200/20 text-slate-300 ring-slate-400/30",
};

function VND(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

function Badge({ value }: { value?: string | null }) {
  const v = (value || "").toLowerCase();
  const color = STATUS_COLORS[v] || "bg-slate-200/20 text-slate-300 ring-slate-400/30";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${color}`}>
      {value || "—"}
    </span>
  );
}

export default function OrdersAdminPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) params.set("status", status);
  if (q) params.set("q", q.trim());
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data, isLoading, mutate } = useSWR<ListResp>(`/api/admin/orders?${params.toString()}`, fetcher);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  // Modal
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const closeModal = () => setSelected(null);

  async function quickUpdate(id: string, patch: Partial<OrderRow>) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const js = await res.json();
    if (!res.ok) {
      alert(js?.error || "Cập nhật thất bại");
      return;
    }
    await mutate(); // refresh list
    if (selected?.id === id) setSelected(js.item);
  }

  useEffect(() => {
    // đổi filter → về trang 1
    setPage(1);
  }, [status, q, from, to]);

  return (
    <AdminShell>
      <Head>
        <title>Admin • Orders</title>
      </Head>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">Orders</h1>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-400">Tìm (email hoặc guest_id)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="vd: user@gmail.com"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="">(Tất cả)</option>
            <option>pending</option>
            <option>paid_pending_verify</option>
            <option>processing</option>
            <option>paid</option>
            <option>completed</option>
            <option>canceled</option>
            <option>refunded</option>
            <option>failed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">Từ ngày</label>
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">Đến ngày</label>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Giảm</th>
                <th className="px-4 py-3 text-right">Tổng</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    Đang tải…
                  </td>
                </tr>
              ) : (data?.items?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    Chưa có đơn nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                data!.items.map((o) => (
                  <tr
                    key={o.id}
                    className="text-sm text-slate-200 odd:bg-slate-950/20 even:bg-slate-950/10 hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        className="font-medium text-slate-100 underline decoration-dotted hover:opacity-80 break-all"
                        onClick={() => setSelected(o)}
                        title="Xem chi tiết"
                      >
                        {o.id}
                      </button>
                    </td>
                    <td className="px-4 py-3">{new Date(o.created_at).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3">{o.guest_id || "—"}</td>
                    <td className="px-4 py-3">{o.contact_email || "—"}</td>
                    <td className="px-4 py-3"><Badge value={o.status} /></td>
                    <td className="px-4 py-3 text-right tabular-nums">{VND(o.subtotal_vnd)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{VND(o.discount_vnd)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{VND(o.total_vnd)}</td>
                    <td className="px-4 py-3">{o.payment_method || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {o.status !== "paid" && (
                          <button
                            onClick={() => quickUpdate(o.id, { status: "paid" })}
                            className="rounded-2xl bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            Mark Paid
                          </button>
                        )}
                        {o.status !== "processing" && (
                          <button
                            onClick={() => quickUpdate(o.id, { status: "processing" })}
                            className="rounded-2xl bg-blue-600/90 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Processing
                          </button>
                        )}
                        {o.status !== "canceled" && (
                          <button
                            onClick={() => {
                              if (confirm("Hủy đơn này?")) quickUpdate(o.id, { status: "canceled" });
                            }}
                            className="rounded-2xl bg-rose-600/90 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-400">
            Tổng: <span className="font-medium text-slate-200">{data?.total ?? 0}</span> đơn
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Trước
            </button>
            <span className="text-sm text-slate-300">
              Trang <strong>{page}</strong>/<strong>{totalPages}</strong>
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={closeModal}
          onQuickUpdate={quickUpdate}
          onSaved={async () => { await mutate(); }}
        />
      )}
    </AdminShell>
  );
}

/* ---------- Components below ---------- */

function EditableNote({
  id,
  value,
  onSaved,
}: {
  id: string;
  value: string;
  onSaved?: () => void;
}) {
  const [note, setNote] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNote(value);
  }, [value]);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, note }),
    });
    const js = await res.json();
    setSaving(false);
    if (!res.ok) {
      alert(js?.error || "Lưu ghi chú thất bại");
      return;
    }
    onSaved?.();
  }

  return (
    <div className="mt-1 flex gap-2">
      <textarea
        className="h-20 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-slate-500"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú nội bộ..."
      />
      <button
        disabled={saving}
        onClick={save}
        className="h-10 self-start rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : "Lưu"}
      </button>
    </div>
  );
}

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}
function copy(value?: string | null) {
  if (!value) return;
  navigator.clipboard?.writeText(String(value)).catch(() => {});
}

function FieldRow({
  label,
  children,
  copyable,
  valueToCopy,
}: {
  label: string;
  children: React.ReactNode;
  copyable?: boolean;
  valueToCopy?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="flex min-w-0 items-center gap-2">
        <div className="truncate text-sm text-slate-100">{children}</div>
        {copyable && valueToCopy ? (
          <button
            onClick={() => copy(valueToCopy)}
            className="shrink-0 rounded-lg border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
            title="Copy"
          >
            Copy
          </button>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ value }: { value?: string | null }) {
  const v = (value || "").toLowerCase();
  const map: Record<string, string> = STATUS_COLORS;
  const color = map[v] || "bg-slate-200/20 text-slate-300 ring-slate-400/30";
  return (
    <span className={classNames("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", color)}>
      {value || "—"}
    </span>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onQuickUpdate,
  onSaved,
}: {
  order: OrderRow;
  onClose: () => void;
  onQuickUpdate: (id: string, patch: Partial<OrderRow>) => Promise<void>;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(order.note || "");
  const [paymentMethod, setPaymentMethod] = useState(order.payment_method || "");
  const [transferNote, setTransferNote] = useState(order.transfer_note || "");
  const [status, setStatus] = useState(order.status || "");

  // ESC để đóng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function saveAll() {
    setSaving(true);
    await onQuickUpdate(order.id, {
      note,
      payment_method: paymentMethod || null,
      transfer_note: transferNote || null,
      status: status || order.status || undefined,
    });
    setSaving(false);
    await onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* overlay blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* dialog */}
      <div
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-100">Chi tiết đơn</h2>
            <StatusPill value={status || order.status} />
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-slate-400 hover:bg-slate-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-3">
            <FieldRow label="ID" copyable valueToCopy={order.id}>
              <span className="break-all">{order.id}</span>
            </FieldRow>

            <FieldRow label="Ngày tạo">
              {new Date(order.created_at).toLocaleString("vi-VN")}
            </FieldRow>

            <FieldRow label="Khách" copyable valueToCopy={order.guest_id}>
              {order.guest_id || "—"}
            </FieldRow>

            <FieldRow label="Email" copyable valueToCopy={order.contact_email}>
              {order.contact_email || "—"}
            </FieldRow>

            <FieldRow label="Service code" copyable valueToCopy={order.service_code}>
              {order.service_code || "—"}
            </FieldRow>

            <FieldRow label="Target URL" copyable valueToCopy={order.target_url}>
              {order.target_url ? (
                <a href={order.target_url} target="_blank" rel="noreferrer" className="text-blue-300 underline decoration-dotted">
                  mở link
                </a>
              ) : (
                "—"
              )}
            </FieldRow>

            <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ghi chú nội bộ</div>
              <textarea
                className="mt-2 h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-slate-600"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập note..."
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
                <div className="text-xs font-medium text-slate-400">Subtotal</div>
                <div className="mt-1 text-right text-sm font-semibold tabular-nums text-slate-100">
                  {VND(order.subtotal_vnd)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
                <div className="text-xs font-medium text-slate-400">Giảm</div>
                <div className="mt-1 text-right text-sm font-semibold tabular-nums text-slate-100">
                  {VND(order.discount_vnd)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
                <div className="text-xs font-medium text-slate-400">Tổng</div>
                <div className="mt-1 text-right text-sm font-bold tabular-nums text-slate-50">
                  {VND(order.total_vnd)}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Thanh toán</div>
                <button
                  onClick={() => copy(order.transfer_note)}
                  className="rounded-lg border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Copy note
                </button>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">Phương thức</div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-slate-600"
                  >
                    <option value="">—</option>
                    <option value="bank_transfer">bank_transfer</option>
                    <option value="vnpay">vnpay</option>
                    <option value="cod">cod</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">Transfer at</div>
                  <div className="text-sm text-slate-100">
                    {order.transfer_submitted_at
                      ? new Date(order.transfer_submitted_at).toLocaleString("vi-VN")
                      : "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Transfer note</div>
                  <input
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-slate-600"
                    placeholder="VD: CTK NGUYEN A, 50000"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-slate-600"
                >
                  <option value={order.status || ""}>{order.status || "—"}</option>
                  <option value="pending">pending</option>
                  <option value="paid_pending_verify">paid_pending_verify</option>
                  <option value="processing">processing</option>
                  <option value="paid">paid</option>
                  <option value="completed">completed</option>
                  <option value="canceled">canceled</option>
                  <option value="refunded">refunded</option>
                  <option value="failed">failed</option>
                </select>

                {/* Hai nút giống ngoài bảng */}
                <button
                  onClick={() => onQuickUpdate(order.id, { status: "paid" })}
                  className="rounded-2xl bg-emerald-600/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Mark Paid
                </button>
                <button
                  onClick={() => onQuickUpdate(order.id, { status: "processing" })}
                  className="rounded-2xl bg-blue-600/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Processing
                </button>
                <button
                  onClick={() => confirm("Hủy đơn này?") && onQuickUpdate(order.id, { status: "canceled" })}
                  className="rounded-2xl bg-rose-600/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 px-5 py-4">
          <div className="text-xs text-slate-400">
            Nhấn <kbd className="rounded bg-slate-800 px-1.5 py-0.5">Esc</kbd> để đóng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
            >
              Đóng
            </button>
            <button
              disabled={saving}
              onClick={async () => {
                await saveAll();
              }}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .enter { animation: modalIn 0.16s ease-out forwards; }
        @keyframes modalIn {
          from { transform: translateY(4px) scale(0.98); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
