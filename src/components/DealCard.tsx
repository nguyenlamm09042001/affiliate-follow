// components/DealCard.tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Deal } from "@/types/deal";

const fmt = (n?: number | null) => ((n ?? 0) as number).toLocaleString("vi-VN") + "đ";
const PH = "https://picsum.photos/800/600?blur=2";

function categoryPill(category?: string) {
  const c = (category || "").toLowerCase();
  if (c.includes("skin")) return "bg-pink-100/60 text-pink-700 ring-1 ring-pink-200";
  if (c.includes("điện") || c.includes("dien") || c.includes("tech"))
    return "bg-indigo-100/60 text-indigo-700 ring-1 ring-indigo-200";
  if (c.includes("gia dụng") || c.includes("home"))
    return "bg-emerald-100/60 text-emerald-700 ring-1 ring-emerald-200";
  if (c.includes("lifestyle"))
    return "bg-violet-100/60 text-violet-700 ring-1 ring-violet-200";
  return "bg-slate-100/60 text-slate-700 ring-1 ring-slate-200";
}

const CTAS = [
  { label: "Múc liền", icon: "💖" },
  { label: "Xem ngay", icon: "💫" },
  { label: "Thêm wishlist", icon: "🌸" },
  { label: "Khám phá", icon: "✨" },
] as const;

export default function DealCard({
  deal,
  compact = true,
}: {
  deal: Deal;
  compact?: boolean;
}) {
  const [src, setSrc] = useState(deal.image || PH);
  const [wish, setWish] = useState(false);

  const drop =
    deal.old_price && deal.price
      ? Math.max(0, Math.round((1 - deal.price / deal.old_price) * 100))
      : null;

  const cta = useMemo(() => {
    return CTAS[Math.floor(Math.random() * CTAS.length)];
  }, []);

  const inactive = deal.active === false;

  return (
    <article
      className={[
        "h-full flex flex-col",                        // ✅ thêm 2 lớp này
        "group overflow-hidden border transition-all bg-white/80 backdrop-blur-sm",        compact
          ? "rounded-2xl shadow-sm hover:shadow-md border-pink-100 hover:border-pink-200"
          : "rounded-3xl shadow hover:shadow-lg border-black/5",
        inactive ? "opacity-75 grayscale" : "",
      ].join(" ")}
    >
      {/* media */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={src}
          alt={deal.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
          onError={() => setSrc(PH)}
          unoptimized={src === PH}
          loading="lazy"
        />

        {/* wishlist */}
        <button
          type="button"
          aria-label={wish ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}
          onClick={() => setWish((v) => !v)}
          className={[
            "absolute right-2 top-2 z-10 rounded-full",
            "bg-white/80 backdrop-blur hover:bg-white shadow-sm transition",
            compact ? "p-1.5" : "p-2",
          ].join(" ")}
        >
          <span className={compact ? "text-base" : "text-lg"}>{wish ? "💖" : "🤍"}</span>
        </button>

        {/* price ribbon */}
        <div className="absolute inset-x-0 bottom-0 px-2 pb-2">
          <div
            className={[
              "rounded-xl bg-white/80 backdrop-blur-md shadow-sm",
              "flex items-center gap-2 px-3 pr-5 py-1.5 min-w-0 overflow-hidden",
            ].join(" ")}
          >
            <span className="text-sm font-extrabold tabular-nums whitespace-nowrap text-slate-900 shrink-0">
              {fmt(deal.price)}
            </span>
            {deal.old_price && (
              <span className="text-[11px] line-through opacity-60 tabular-nums text-slate-600 shrink-0">
                {fmt(deal.old_price)}
              </span>
            )}
            <span aria-hidden className="flex-1" />
            {drop !== null && (
              <span
                className={[
                  "inline-flex items-center shrink-0 leading-none",
                  "text-[11px] font-semibold rounded-full px-2.5 py-0.5 tracking-[0.01em]",
                  "bg-gradient-to-r from-pink-200 to-violet-200 text-pink-800",
                ].join(" ")}
              >
                -{drop}%
              </span>
            )}
          </div>
        </div>

        {inactive && (
          <div className="absolute inset-0 bg-black/30 grid place-items-center text-white text-xs font-semibold">
            Hết hạn
          </div>
        )}
      </div>

      {/* content */}
{/* content */}
<div className={compact
  ? "flex-1 min-h-0 p-3 flex flex-col gap-2.5"
  : "flex-1 min-h-0 p-4 flex flex-col gap-3"
}>
        <h3
          className={[
            "leading-snug line-clamp-2 text-slate-800",
            compact ? "text-sm font-semibold" : "text-base font-semibold",
          ].join(" ")}
          title={deal.name}
        >
          {deal.name}
        </h3>

        <div className="flex items-center gap-2">
          {deal.category && (
            <span
              className={
                (compact ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2 py-0.5") +
                " rounded-full " +
                categoryPill(deal.category)
              }
            >
              {deal.category}
            </span>
          )}
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
        </div>

        {/* CTA */}
        <a
          href={deal.affiliate_link ? `/api/go/${deal.slug}` : `/go/${deal.slug}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-disabled={inactive}
          className={[
            "mt-auto inline-flex w-full items-center justify-center rounded-xl font-semibold transition-all",
            "bg-gradient-to-r from-pink-100 to-violet-100 text-pink-700 hover:from-pink-200 hover:to-violet-200 shadow-sm",
            "h-11 sm:h-11 py-0 px-4 text-sm", // ✅ fix chiều cao đều
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
          {...(inactive ? { onClick: (e) => e.preventDefault() } : {})}
        >
          <span className="inline-flex items-center gap-2 leading-none">
            <span className="leading-none">{cta.label}</span>
            <span aria-hidden className="-mt-px leading-none">{cta.icon}</span>
          </span>
        </a>
      </div>
    </article>
  );
}
