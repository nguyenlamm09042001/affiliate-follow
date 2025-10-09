"use client";

import Link from "next/link";

export default function Header({
  dark,
  onToggleDark,
}: {
  dark: boolean;
  onToggleDark: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[--color-brand-500] to-[--color-brand-600] shadow-sm" />
          <Link href="/" className="font-bold tracking-tight text-slate-900 dark:text-white">
            LameaLux
          </Link>
         
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
            {/* hiển thị cả mobile + desktop */}
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          <Link href="/" className="hover:underline">Deals</Link>
          <Link href="/social" className="hover:underline">Tăng follow</Link>
        </nav>

          <button
            onClick={onToggleDark}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800"
            aria-label="Đổi giao diện"
            title="Đổi giao diện"
          >
            {dark ? "🌙" : "🌞"}
          </button>
        </div>
      </div>
    </header>
  );
}
