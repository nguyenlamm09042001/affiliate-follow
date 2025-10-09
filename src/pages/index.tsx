import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
        <h1 className="text-center text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          🌟 Danh sách Deal nổi bật
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {items.map((d) => (
            <article
              key={d.id}
              className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <img
                src={d.image}
                alt={d.name}
                className="w-full h-48 sm:h-56 object-cover"
              />
              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-800 truncate">
                  {d.name}
                </h2>
                {d.category && (
                  <p className="text-sm text-gray-500 mb-1">{d.category}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  {d.price && (
                    <span className="text-rose-600 font-bold text-base">
                      {d.price.toLocaleString("vi-VN")}đ
                    </span>
                  )}
                  {d.old_price && (
                    <span className="line-through text-gray-400 text-sm">
                      {d.old_price.toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
                {d.affiliate_link && (
                  <a
                    href={d.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Mua ngay →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
