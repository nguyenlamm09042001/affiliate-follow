import useSWR from "swr";
import { useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminGuard } from "@/hooks/useAdminGuard";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

type Item = {
  id: string;
  name?: string | null;
  image?: string | null;
  affiliate_link: string;
  source_url?: string | null;
  active?: boolean | null;
};

export default function ShopeeLinks() {
  const ok = useAdminGuard();
  const { data, mutate, isLoading } = useSWR<{ items: Item[] }>("/api/admin/deals", fetcher);

  // Modal: Thêm link
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", source_url: "", affiliate_link: "", image: "" });

  // Modal: Import
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!ok) return null;
  const items = data?.items ?? [];

  // ===== CRUD =====
  const addItem = async () => {
    if (!form.affiliate_link) return alert("Nhập Link ưu đãi Shopee");
    setAdding(true);
    try {
      const r = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name || undefined,
          source_url: form.source_url || undefined,
          affiliate_link: form.affiliate_link,
          image: form.image || undefined,
          source: "shopee",
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Tạo thất bại");
      await mutate();
      setForm({ name: "", source_url: "", affiliate_link: "", image: "" });
      setShowAdd(false);
    } catch (e: any) {
      console.error("ADD FAILED:", e);
      alert(e.message || "Lỗi");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xoá link này?")) return;
    const prev = items;
    mutate({ items: items.filter((x) => x.id !== id) }, false);
    const r = await fetch(`/api/admin/deals?id=${id}`, { method: "DELETE" });
    if (!r.ok) {
      alert("Xoá thất bại");
      mutate({ items: prev }, false);
      await mutate();
    } else {
      await mutate();
    }
  };

  const save = async (id: string, patch: Record<string, any>) => {
    const r = await fetch("/api/admin/deals", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("UPDATE FAILED:", j);
      return alert("Lưu thất bại");
    }
    await mutate();
  };

  // ===== Import: CSV/XLSX =====
  const parseCSV = (text: string): any[] => {
    const rows = text.split(/\r?\n/).filter((l) => l.trim().length);
    if (!rows.length) return [];
    const headers = rows[0].split(",").map((h) => h.trim());
    return rows.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => (obj[h] = cols[i] ?? ""));
      return obj;
    });
  };

  const handleImportFile = async (file: File) => {
    setImportLog([]);
    setImporting(true);
    try {
      const name = file.name.toLowerCase();
      const buf = await file.arrayBuffer();

      let rows: any[] = [];
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        let XLSX: any;
        try {
          // @ts-ignore – dynamic import
          XLSX = await import("xlsx");
        } catch {
          alert("Thiếu thư viện 'xlsx'. Cài: npm i xlsx @types/xlsx — hoặc xuất CSV để import.");
          return;
        }
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet);
      } else if (name.endsWith(".csv")) {
        const text = new TextDecoder().decode(buf);
        rows = parseCSV(text);
      } else {
        alert("Vui lòng chọn .xlsx hoặc .csv");
        return;
      }

      const cleaned = rows
        .map((r) => ({
          name: (r.name ?? r.Name ?? r["Tên sản phẩm"] ?? "").toString().trim(),
          affiliate_link: (r.affiliate_link ?? r.Affiliate ?? r["Link ưu đãi"] ?? r.link ?? "").toString().trim(),
          source_url: (r.source_url ?? r.Source ?? r["Link sản phẩm"] ?? "").toString().trim(),
          image: (r.image ?? r.Image ?? "").toString().trim(),
        }))
        .filter((r) => !!r.affiliate_link);

      if (!cleaned.length) {
        alert("Không tìm thấy dòng hợp lệ (cần cột 'affiliate_link' hoặc 'Link ưu đãi').");
        return;
      }

      let okCount = 0, failCount = 0;

      for (let i = 0; i < cleaned.length; i++) {
        const row = cleaned[i];

        // --- AUTO LẤY ẢNH nếu trống ---
        if (!row.image) {
          try {
            // ƯU TIÊN shortlink (affiliate_link) vì dễ lấy ảnh hơn
            const u = row.affiliate_link || row.source_url;
            if (u) {
              const rr = await fetch(`/api/utils/shopee-image?url=${encodeURIComponent(u)}`);
              const jj = await rr.json();
              if (jj.image) row.image = jj.image;
            }
          } catch {}
        }

        setImportLog((s) => [...s, `Đang thêm: ${row.name || row.affiliate_link}`]);
        try {
          const r = await fetch("/api/admin/deals", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: row.name || undefined,
              affiliate_link: row.affiliate_link,
              source_url: row.source_url || undefined,
              image: row.image || undefined,
              source: "shopee",
            }),
          });
          if (!r.ok) throw new Error(await r.text());
          okCount++;
        } catch (e) {
          console.error("IMPORT ROW FAILED:", e);
          failCount++;
          setImportLog((s) => [...s, `❌ Lỗi: ${row.name || row.affiliate_link}`]);
        }
      }

      setImportLog((s) => [...s, `Hoàn tất. Thành công: ${okCount}, lỗi: ${failCount}`]);
      await mutate();
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Quản lý link Shopee</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-sm text-white"
          >
            Thêm từ Excel
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-sm hover:bg-gray-100"
          >
            + Thêm link
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <div className="col-span-full text-white/60 p-4">Đang tải…</div>}

        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <img
                src={it.image || "/placeholder.png"}
                alt={it.name || "item"}
                className="h-16 w-16 rounded-lg object-cover bg-white/10 border border-white/10"
              />
              <div className="min-w-0">
                <div className="font-semibold truncate">{it.name || "Sản phẩm Shopee"}</div>
                <a
                  className="text-xs text-white/70 break-all hover:underline"
                  href={it.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {it.affiliate_link}
                </a>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => save(it.id, { is_active: !(it.active ?? true) })}
                className="pointer-events-auto px-3 py-1.5 rounded bg-white/15 hover:bg-white/25 text-sm text-white"
              >
                {it.active ? "Tắt hiển thị" : "Bật hiển thị"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const newName = prompt("Tên sản phẩm:", it.name || "");
                  if (newName != null) save(it.id, { name: newName });
                }}
                className="pointer-events-auto px-3 py-1.5 rounded bg-white/15 hover:bg-white/25 text-sm text-white"
              >
                Sửa
              </button>

              <button
                type="button"
                onClick={() => remove(it.id)}
                className="pointer-events-auto px-3 py-1.5 rounded bg-pink-500 hover:bg-pink-600 text-sm text-white"
              >
                Xoá
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Thêm link */}
      {showAdd && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="fixed z-[70] inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0f1a] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">Thêm link mới</div>
                <button onClick={() => setShowAdd(false)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <input
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/15 outline-none"
                  placeholder="Tên sản phẩm (optional)"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/15 outline-none"
                  placeholder="Link sản phẩm gốc (optional)"
                  value={form.source_url}
                  onChange={(e) => setForm((s) => ({ ...s, source_url: e.target.value }))}
                />
                <input
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/15 outline-none"
                  placeholder="Link ưu đãi Shopee (bắt buộc)"
                  value={form.affiliate_link}
                  onChange={(e) => setForm((s) => ({ ...s, affiliate_link: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/15 outline-none"
                    placeholder="Ảnh (URL) (optional)"
                    value={form.image}
                    onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      // ƯU TIÊN shortlink vì dễ lấy ảnh hơn
                      const u = (form.affiliate_link || form.source_url || "").trim();
if (!u) return alert("Nhập link trước đã");

try {
  // 1. Gọi API thường (nhẹ hơn)
  let r = await fetch(`/api/utils/shopee-image?url=${encodeURIComponent(u)}`);
  let j = await r.json();

  // 2. Nếu 404 hoặc không có ảnh → fallback sang headless
  if (!r.ok || !j.image) {
    r = await fetch(`/api/utils/shopee-image-headless?url=${encodeURIComponent(u)}`);
    j = await r.json();
  }

  if (j.image) {
    setForm((s) => ({ ...s, image: j.image }));
  } else {
    alert(j.error || "Không lấy được ảnh");
  }
} catch (e: any) {
  alert(e?.message || "Không lấy được ảnh");
}

                    }}
                    className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm"
                  >
                    Lấy ảnh tự động
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={adding}
                  className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-sm hover:bg-gray-100 disabled:opacity-60"
                >
                  {adding ? "Đang thêm..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Import */}
      {showImport && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowImport(false)} />
          <div className="fixed z-[70] inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b0f1a] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">Thêm từ Excel / CSV</div>
                <button onClick={() => setShowImport(false)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">
                  ✕
                </button>
              </div>

              <p className="text-white/70 text-sm mb-3">
                Hỗ trợ cột: <span className="text-white">affiliate_link</span> (bắt buộc),
                <span className="text-white"> name</span>, <span className="text-white">source_url</span>,
                <span className="text-white"> image</span>.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportFile(f);
                }}
                className="block w-full rounded border border-white/15 bg-white/5 p-2"
              />

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={importing}
                  onClick={() => setShowImport(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                >
                  Đóng
                </button>
              </div>

              {!!importLog.length && (
                <div className="mt-3 max-h-48 overflow-auto rounded bg-white/5 p-2 text-xs text-white/80">
                  {importLog.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                  {importing && <div className="opacity-70">Đang xử lý…</div>}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
