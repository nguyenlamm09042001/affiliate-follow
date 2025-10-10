import Head from "next/head";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import DealCard from "@/components/DealCard";
import Header from "@/components/Header";
import { Deal } from "@/types/deal";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

const TABS = ["Tất cả", "Giảm sâu", "Dưới 200k", "Điện tử", "Gia dụng", "Skincare", "Lifestyle"] as const;
type Tab = (typeof TABS)[number];

const HOT_KEYS = ["tai nghe ANC", "bàn phím cơ", "sữa rửa mặt", "máy ép chậm", "bình giữ nhiệt"];
const TRUST = ["Miễn phí | Tổng hợp deal hot", "Không quảng cáo làm phiền", "Cập nhật 30s/lần"];

export default function Home() {
  const { data, isLoading } = useSWR<{ items: Deal[] }>("/api/deals", fetcher, {
    refreshInterval: 30000,
  });

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("Tất cả");
  const [dark, setDark] = useState(true);

  // dark mode
  useEffect(() => {
    const saved = localStorage.getItem("LameaLux-theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("LameaLux-theme", next ? "dark" : "light");
  };

  const deals = data?.items ?? [];

  const filtered = useMemo(() => {
    let list = [...deals];
    if (tab === "Giảm sâu")
      list = list.filter((d) => d.old_price && d.price <= d.old_price * 0.8);
    else if (tab === "Dưới 200k") list = list.filter((d) => d.price <= 200_000);
    else if (tab !== "Tất cả")
      list = list.filter((d) => (d.category ?? "").toLowerCase() === tab.toLowerCase());
    if (q.trim())
      list = list.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [deals, q, tab]);

  return (
    <>
      <Head>
        <title>LameaLux — Deals & Social Boost</title>
      </Head>

      <div className="min-h-screen bg-[#0b0f1a] bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(236,72,153,0.15),transparent),radial-gradient(900px_500px_at_90%_110%,rgba(147,51,234,0.15),transparent)]">
        <Header dark={dark} onToggleDark={toggleDark} />

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* hero */}
          <section className="relative text-center py-10 sm:py-14 rounded-3xl mx-auto max-w-5xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 opacity-95" />
            <div className="absolute inset-0 ring-1 ring-white/20 rounded-3xl" />
            <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-72 w-72 blur-3xl bg-white/20 rounded-full" />

            <div className="relative px-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow">
                Bảng deal đẹp ✨
              </h1>
              <p className="mt-2 text-white/90">
                Tự động tổng hợp deal • Tăng tương tác mạng xã hội
              </p>

              {/* search box */}
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-white/10 shadow px-3 py-2 text-white">
                  <span className="text-lg">🔎</span>
                  <input
                    id="search-box"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm: tai nghe, máy ép, skincare…"
                    className="w-full bg-transparent outline-none placeholder:text-white/70"
                  />
                  {q && (
                    <button
                      onClick={() => setQ("")}
                      className="text-xs px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 transition"
                    >
                      Xoá
                    </button>
                  )}
                </div>

                {/* hot keywords */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {HOT_KEYS.map((k) => (
                    <button
                      key={k}
                      onClick={() => setQ(k)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md transition"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* tabs */}
              <div className="mt-5 flex items-center gap-2 overflow-x-auto justify-center px-1 scrollbar-none">
                {TABS.map((t) => {
                  const active = t === tab;
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={[
                        "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition",
                        active
                          ? "bg-white text-pink-600 shadow-md"
                          : "bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* trust scrolling */}
              <div className="mt-6 relative overflow-hidden">
                <div className="flex gap-6 animate-[marquee_18s_linear_infinite] [&>*]:shrink-0 text-xs">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="flex gap-6 mx-auto">
                      {TRUST.map((t, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* grid 2-column equal height */}
          {isLoading ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 auto-rows-[1fr] items-stretch">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-full">
                  <div className="h-full rounded-2xl bg-white/10 animate-pulse border border-white/15" />
                </div>
              ))}
            </div>
          ) : (
            <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 auto-rows-[1fr] items-stretch">
              {filtered.map((d) => (
                <div key={d.slug} className="h-full">
                  <DealCard deal={d} compact />
                </div>
              ))}

              {!filtered.length && (
                <div className="col-span-full rounded-3xl bg-white/10 border border-white/15 p-10 text-center">
                  <p className="text-white/90">Không tìm thấy sản phẩm phù hợp 🤏</p>
                </div>
              )}
            </section>
          )}

          <footer className="py-10 text-center text-xs text-white/70">
            © {new Date().getFullYear()} LameaLux
          </footer>
        </main>
      </div>
    </>
  );
}

/* Thêm vào globals.css nếu chưa có:
@keyframes marquee {
  0% { transform: translateX(0) }
  100% { transform: translateX(-50%) }
}
*/
