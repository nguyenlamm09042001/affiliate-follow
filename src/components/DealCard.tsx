import Image from "next/image";
import { useMemo, useState } from "react";
import { Deal } from "@/types/deal";

const fmt = (n: number) => (n ?? 0).toLocaleString("vi-VN") + "đ";
const PH = "https://picsum.photos/800/600?blur=2";

// màu pastel theo category
function categoryPill(category?: string) {
  const c = (category || "").toLowerCase();
  if (c.includes("skin")) return "bg-pink-50 text-pink-700 ring-1 ring-pink-100";
  if (c.includes("điện") || c.includes("dien") || c.includes("tech"))
    return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100";
  if (c.includes("gia dụng") || c.includes("home"))
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  if (c.includes("lifestyle"))
    return "bg-violet-50 text-violet-700 ring-1 ring-violet-100";
  return "bg-slate-50 text-slate-700 ring-1 ring-slate-100";
}

export default function DealCard({ deal }: { deal: Deal }) {
  const [src, setSrc] = useState(deal.image || PH);
  const [wish, setWish] = useState(false);

  const drop =
    deal.old_price && deal.price
      ? Math.max(0, Math.round((1 - deal.price / deal.old_price) * 100))
      : null;

  // CTA ngẫu nhiên cho vibe Gen Z (chỉ tạo 1 lần)
  const cta = useMemo(() => {
    const list = ["Múc ngay 😎", "Chốt lẹ đi 🫣", "Thêm wishlist 💖", "Xem deal"];
    return list[Math.floor(Math.random() * list.length)];
  }, []);

  const inactive = deal.active === false;

  return (
    <article
      className={[
        "group rounded-3xl overflow-hidden border border-black/5 shadow-sm",
        "bg-white/90 dark:bg-slate-900/60 transition-all",
        "hover:shadow-lg hover:ring-2 hover:ring-black/5 dark:hover:ring-white/10",
        inactive ? "opacity-75 grayscale" : "",
      ].join(" ")}
    >
      {/* media */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={src}
          alt={deal.name}
          fill
          sizes="(max-width:768px) 100vw, 400px"
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
          onError={() => setSrc(PH)}
          unoptimized={src === PH}
        />

        {/* wishlist */}
        <button
          type="button"
          aria-label={wish ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}
          onClick={() => setWish((v) => !v)}
          className={[
            "absolute right-3 top-3 z-10 rounded-full p-2",
            "bg-white/80 dark:bg-slate-800/80 backdrop-blur",
            "shadow-sm hover:shadow transition-all",
          ].join(" ")}
        >
          <span
            className={[
              "text-lg leading-none transition-transform",
              wish
                ? "scale-110"
                : "group-hover:scale-110 motion-safe:duration-300",
            ].join(" ")}
          >
            {wish ? "💖" : "🤍"}
          </span>
        </button>

        {/* price ribbon */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <div className="rounded-2xl px-3 py-2 text-white flex items-center gap-3 shadow-sm
                          bg-black/55 backdrop-blur">
            <span className="text-lg font-extrabold">{fmt(deal.price)}</span>
            {deal.old_price && (
              <span className="text-xs/4 line-through opacity-80">
                {fmt(deal.old_price)}
              </span>
            )}
            {drop !== null && (
              <span
                className="ml-auto text-[11px] font-semibold rounded-full px-2 py-1
                           bg-gradient-to-r from-pink-500 to-indigo-500"
              >
                -{drop}%
              </span>
            )}
          </div>
        </div>

        {/* inactive mask */}
        {inactive && (
          <div className="absolute inset-0 bg-black/30 grid place-items-center text-white text-sm font-semibold">
            Hết hạn
          </div>
        )}
      </div>

      {/* content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-base font-semibold leading-snug line-clamp-2 text-gray-900 dark:text-white">
          {deal.name}
        </h3>

        <div className="flex items-center gap-2">
          {deal.category && (
            <span
              className={
                "text-[11px] px-2 py-0.5 rounded-full " + categoryPill(deal.category)
              }
            >
              {deal.category}
            </span>
          )}
          {/* emoji nhỏ khi hover cho cảm giác “alive” */}
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            ✨
          </span>
        </div>

        <a
          href={deal.affiliate_link ? `/api/go/${deal.slug}` : `/go/${deal.slug}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-disabled={inactive}
          className={[
            "mt-auto inline-flex w-full items-center justify-center rounded-xl",
            "font-semibold py-2.5 transition-all",
            "bg-slate-900 text-white hover:bg-slate-800",
            "dark:bg-white dark:text-slate-900 dark:hover:bg-white/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-sm hover:shadow",
            "backdrop-blur",
          ].join(" ")}
          {...(inactive ? { onClick: (e) => e.preventDefault() } : {})}
        >
          {cta}
        </a>
      </div>
    </article>
  );
}
