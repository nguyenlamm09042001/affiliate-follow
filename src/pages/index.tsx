// pages/index.tsx
import Head from "next/head";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import DealCard from "@/components/DealCard";
import { Deal } from "@/types/deal";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

const TABS = [
  "Tất cả",
  "Giảm sâu",
  "Dưới 200k",
  "Điện tử",
  "Gia dụng",
  "Skincare",
  "Lifestyle",
] as const;
type Tab = (typeof TABS)[number];

const HOT_KEYS = [
  "tai nghe ANC",
  "bàn phím cơ",
  "sữa rửa mặt",
  "máy ép chậm",
  "bình giữ nhiệt",
];

const TRUST = [
  "Miễn phí | Tổng hợp deal hot",
  "Không quảng cáo làm phiền",
  "Cập nhật 30s/lần",
];

export default function Home() {
  const { data, isLoading } = useSWR<{ items: Deal[] }>("/api/deals", fetcher, {
    refreshInterval: 30000,
  });
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("Tất cả");
  const [dark, setDark] = useState(false);

  // dark mode toggle
  useEffect(() => {
    const saved = localStorage.getItem("kimdeal-theme");
    const isDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("kimdeal-theme", next ? "dark" : "light");
  };

  const deals = data?.items ?? [];

  const filtered = useMemo(() => {
    let list = [...deals];
    if (tab === "Giảm sâu")
      list = list.filter((d) => d.old_price && d.price <= d.old_price * 0.8);
    else if (tab === "Dưới 200k") list = list.filter((d) => d.price <= 200_000);
    else if (tab !== "Tất cả")
      list = list.filter(
        (d) => (d.category ?? "").toLowerCase() === tab.toLowerCase()
      );
    if (q.trim())
      list = list.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [deals, q, tab]);

  return (
    <>
      <Head>
        <title>kimdeal — Template magazine</title>
      </Head>

      {/* page bg (có dark) */}
      <div className="min-h-screen bg-gradient-to-br from-[#FAF7FF] via-[#F3F7FF] to-[#EAFBF3] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* topbar */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[--color-brand-500] to-[--color-brand-600] shadow-sm" />
              <span className="font-bold tracking-tight text-slate-900 dark:text-white">
                kimdeal
              </span>
              <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                Beta • Gen Z vibes
              </span>
              <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-200">
  <a href="/" className="hover:underline">Deals</a>
  <a href="/social" className="hover:underline">Tăng follow</a>
</nav>

            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Tìm kiếm"
                onClick={() => document.getElementById("search-box")?.focus()}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
              >
                🔎 <span className="hidden md:inline">Tìm nhanh</span>
              </button>
              <button
                onClick={toggleDark}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800"
                aria-label="Đổi giao diện"
                title="Đổi giao diện"
              >
                {dark ? "🌙" : "🌞"}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* hero (ombre + blob + highlight) */}
          <section
            className="relative text-center py-10 sm:py-16 rounded-3xl mx-auto max-w-5xl shadow-sm
                              bg-gradient-to-b from-[#fff7fa] via-[#f7faff] to-[#f3fff7] dark:from-slate-900 dark:via-slate-850 dark:to-slate-900"
          >
            {/* glow blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-16 h-64 w-64 blur-3xl opacity-40
                              bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.45),_transparent_60%)]"
              />
              <div
                className="absolute right-6 bottom-0 h-56 w-56 blur-3xl opacity-35
                              bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.45),_transparent_60%)]"
              />
            </div>

            <h1
              className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent
                           bg-gradient-to-r from-[--color-brand-500] to-[--color-brand-600]"
            >
              Deal đẹp — kiểu tạp chí ✨
            </h1>

            <p
              className="mt-3 inline-block px-3 py-1 rounded-xl font-medium text-gray-700 dark:text-gray-100 
bg-white/60 dark:bg-white/10 backdrop-blur-sm ring-1 ring-black/5 shadow-sm"
            >
              Tối giản, ảnh lớn, nhấn mạnh giá &amp; phần trăm giảm.
            </p>

            {/* search */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 shadow-sm px-3 py-2">
                <span className="text-lg">🔎</span>
                <input
                  id="search-box"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm: tai nghe, máy ép, skincare…"
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-white
                  placeholder:text-gray-500/70 dark:placeholder:text-slate-300"
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="text-xs px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10"
                  >
                    Xoá
                  </button>
                )}
              </div>

              {/* quick chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {HOT_KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setQ(k)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium
                    text-slate-700 dark:text-slate-100
                    bg-white/90 dark:bg-slate-700/80 border border-black/5 dark:border-white/10
                    hover:bg-white dark:hover:bg-slate-600 transition-colors"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* tabs (scrollable) */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto justify-center px-1 scrollbar-none">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition",
                    t === tab
                      ? "bg-gray-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-white/90 dark:bg-slate-700/80 text-slate-700 dark:text-slate-100 border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-slate-600",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* trust marquee */}
            <div className="mt-6 relative overflow-hidden">
              <div className="flex gap-6 animate-[marquee_20s_linear_infinite] [&>*]:shrink-0 text-xs text-slate-600 dark:text-slate-300">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="flex gap-6 mx-auto">
                    {TRUST.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/60 border border-black/5 dark:border-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* grid */}
          {isLoading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-3xl bg-white/70 dark:bg-slate-800/50 animate-pulse border border-black/5 dark:border-white/10"
                />
              ))}
            </div>
          ) : (
            <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((d) => (
                <DealCard key={d.slug} deal={d} />
              ))}
              {!filtered.length && (
                <div className="col-span-full rounded-3xl bg-white/80 dark:bg-slate-800/70 border border-black/5 dark:border-white/10 p-10 text-center">
                  <p className="text-gray-700 dark:text-slate-200">
                    Không tìm thấy sản phẩm phù hợp 🤏
                  </p>
                </div>
              )}
            </section>
          )}

          <footer className="py-10 text-center text-xs text-gray-600 dark:text-slate-300">
            © {new Date().getFullYear()} kimdeal
          </footer>
        </main>
      </div>
    </>
  );
}
