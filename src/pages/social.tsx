// pages/social.tsx
import Head from "next/head";

type Row = { label: string; value?: string; g7?: string; g30?: string };

type SectionCommon = {
  title: string;
};

type SectionFollowVN = SectionCommon & {
  kind: "follow_vn"; // 3 cột: label | g7 | g30
  items: Row[]; // dùng g7 + g30
};

type SectionFollowGL = SectionCommon & {
  kind: "follow_global"; // 2 cột: label | g30
  items: Row[]; // dùng g30
};

type SectionSimple = SectionCommon & {
  kind: "simple"; // 2 cột: label | value
  items: Row[]; // dùng value
};

type Section = SectionFollowVN | SectionFollowGL | SectionSimple;

type Platform = {
  name: string;
  color: string; // gradient bg của card
  desc?: string;
  // với Instagram ta sẽ render 4 bảng (2x2)
  sections: Section[];
};

export default function Social() {
  const instagram: Platform = {
    name: "Instagram 📸",
    color: "from-pink-500 to-purple-600",
    desc: "Tách Follow / Likes / Views — bảo hành linh hoạt 7 ngày hoặc 1 tháng.",
    sections: [
      // TOP-LEFT: FOLLOW VIỆT (3 cột)
      {
        title: "Follow 🇻🇳",
        kind: "follow_vn",
        items: [
          { label: "500 Follow", g7: "50.000 đ", g30: "70.000 đ" },
          { label: "1.000 Follow", g7: "100.000 đ", g30: "140.000 đ" },
          { label: "2.000 Follow", g7: "190.000 đ", g30: "275.000 đ" },
          { label: "3.000 Follow", g7: "280.000 đ", g30: "410.000 đ" },
          { label: "4.000 Follow", g7: "370.000 đ", g30: "540.000 đ" },
          { label: "5.000 Follow", g7: "460.000 đ", g30: "660.000 đ" },
          { label: "10.000 Follow", g7: "900.000 đ", g30: "1.250.000 đ" },
        ],
      },
      // TOP-RIGHT: FOLLOW QUỐC TẾ (2 cột)
      {
        title: "Follow 🌍",
        kind: "follow_global",
        items: [
          { label: "500 Follow", g30: "100.000 đ" },
          { label: "1.000 Follow", g30: "190.000 đ" },
          { label: "2.000 Follow", g30: "370.000 đ" },
          { label: "3.000 Follow", g30: "550.000 đ" },
          { label: "4.000 Follow", g30: "730.000 đ" },
          { label: "5.000 Follow", g30: "900.000 đ" },
          { label: "10.000 Follow", g30: "1.700.000 đ" },
        ],
      },
      // BOTTOM-LEFT: LIKES (2 cột)
      {
        title: "Likes",
        kind: "simple",
        items: [
          { label: "100 Likes 🇻🇳", value: "10.000 đ" },
          { label: "500 Likes 🇻🇳", value: "45.000 đ" },
          { label: "1.000 Likes 🇻🇳", value: "80.000 đ" },
          { label: "5.000 Likes 🇻🇳", value: "350.000 đ" },
          { label: "200 Likes 🌍", value: "10.000 đ" },
          { label: "2.000 Likes 🌍", value: "80.000 đ" },
        ],
      },
      // BOTTOM-RIGHT: VIEWS / COMMENTS (2 cột)
      {
        title: "Views / Comments",
        kind: "simple",
        items: [
          { label: "10 Comments 🇻🇳", value: "15.000 đ" },
          { label: "1.000 View reels 🇻🇳", value: "30.000 đ" },
        ],
      },
    ],
  };

  const tiktok: Platform = {
    name: "TikTok 🎵",
    color: "from-blue-500 to-cyan-500",
    desc: "Follow / Likes / Views tách ô riêng — dễ đọc, dễ chọn.",
    sections: [
      {
        title: "Follow",
        kind: "simple",
        items: [
          { label: "100 Follow", value: "15.000 đ" },
          { label: "500 Follow", value: "60.000 đ" },
          { label: "1.000 Follow (Live)", value: "110.000 đ" },
          { label: "2.000 Follow", value: "210.000 đ" },
          { label: "3.000 Follow", value: "300.000 đ" },
          { label: "4.000 Follow", value: "390.000 đ" },
          { label: "5.000 Follow", value: "470.000 đ" },
          { label: "10.000 Follow", value: "800.000 đ" },
        ],
      },
      { title: "Views", kind: "simple", items: [
        { label: "1.000 View video", value: "10.000 đ" },
        { label: "10.000 View video", value: "70.000 đ" },
      ]},
      { title: "Likes", kind: "simple", items: [
        { label: "100 Like", value: "10.000 đ" },
        { label: "1.000 Like", value: "80.000 đ" },
      ]},
    ],
  };

  const facebook: Platform = {
    name: "Facebook 📘",
    color: "from-indigo-500 to-blue-600",
    sections: [
      {
        title: "Follow",
        kind: "simple",
        items: [
          { label: "500 Follow", value: "50.000 đ" },
          { label: "1.000 Follow", value: "100.000 đ" },
          { label: "2.000 Follow", value: "190.000 đ" },
          { label: "3.000 Follow", value: "280.000 đ" },
          { label: "4.000 Follow", value: "370.000 đ" },
          { label: "5.000 Follow", value: "450.000 đ" },
          { label: "10.000 Follow", value: "850.000 đ" },
        ],
      },
      {
        title: "Likes",
        kind: "simple",
        items: [
          { label: "100 Likes", value: "10.000 đ" },
          { label: "500 Likes", value: "45.000 đ" },
          { label: "1.000 Likes", value: "80.000 đ" },
          { label: "2.000 Likes", value: "150.000 đ" },
          { label: "5.000 Likes", value: "350.000 đ" },
        ],
      },
      {
        title: "Views / Comments",
        kind: "simple",
        items: [
          { label: "10 Comments", value: "15.000 đ" },
          { label: "1.000 View reels", value: "40.000 đ" },
          { label: "1.000 View story", value: "100.000 đ" },
        ],
      },
    ],
  };

  const platforms: Platform[] = [instagram, tiktok, facebook];

  const Card = ({ pf }: { pf: Platform }) => (
    <section
      className={`rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/10 bg-gradient-to-r ${pf.color} text-white`}
    >
      <div className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{pf.name}</h2>
          {pf.desc && <p className="mt-1 text-xs sm:text-sm opacity-90">{pf.desc}</p>}
        </div>

        {/* Instagram: 4 bảng (2x2). Các nền tảng khác: tự co giãn theo số section */}
        <div className={`grid gap-4 ${pf === instagram ? "md:grid-cols-2" : "sm:grid-cols-2"}`}>
          {pf.sections.map((sec, i) => (
            <article key={sec.title + i} className="rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-white/15">
                <h3 className="font-semibold">{sec.title}</h3>
              </div>

              {/* render theo loại */}
              {sec.kind === "follow_vn" && (
                <table className="w-full text-[15px]">
                  <thead className="text-sm font-semibold bg-white/10">
                    <tr>
                      <th className="py-2 px-4 text-left">Follow</th>
                      <th className="py-2 px-4 text-right">Bảo hành 7 ngày</th>
                      <th className="py-2 px-4 text-right">Bảo hành 1 tháng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map((r) => (
                      <tr key={r.label} className="border-b last:border-0 border-white/15">
                        <td className="py-3 px-4">{r.label}</td>
                        <td className="py-3 px-4 text-right font-semibold">{r.g7 ?? "–"}</td>
                        <td className="py-3 px-4 text-right font-extrabold">{r.g30 ?? "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {sec.kind === "follow_global" && (
                <table className="w-full text-[15px]">
                  <thead className="text-sm font-semibold bg-white/10">
                    <tr>
                      <th className="py-2 px-4 text-left">Follow</th>
                      <th className="py-2 px-4 text-right">Bảo hành 1 tháng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map((r) => (
                      <tr key={r.label} className="border-b last:border-0 border-white/15">
                        <td className="py-3 px-4">{r.label}</td>
                        <td className="py-3 px-4 text-right font-extrabold">{r.g30 ?? "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {sec.kind === "simple" && (
                <table className="w-full text-[15px]">
                  <tbody>
                    {sec.items.map((r) => (
                      <tr key={r.label} className="border-b last:border-0 border-white/15">
                        <td className="py-3 px-4">{r.label}</td>
                        <td className="py-3 px-4 text-right font-extrabold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </article>
          ))}
        </div>

        <a
          href="https://zalo.me/" // đổi sang link thật
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block w-full rounded-xl bg-white text-slate-900 text-center font-semibold py-2.5 hover:bg-gray-100 transition"
        >
          Liên hệ đặt dịch vụ 📩
        </a>
      </div>
    </section>
  );

  return (
    <>
      <Head><title>kimdeal — Dịch vụ Follow & Tương tác</title></Head>

      <div className="min-h-screen bg-gradient-to-br from-[#E4ECFF] via-[#F6F4FF] to-[#F9FBFF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[--color-brand-500] to-[--color-brand-600]" />
              <a href="/" className="font-bold tracking-tight text-slate-900 dark:text-white">kimdeal</a>
            </div>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-200">
              <a href="/" className="hover:underline">Deals</a>
              <a href="/social" className="underline font-semibold">Tăng follow</a>
            </nav>
          </div>
        </header>

        {/* Body */}
        <main className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-center text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-600">
            Bảng giá dịch vụ 💬
          </h1>
          <p className="mt-2 text-center text-slate-600 dark:text-slate-300">
            Bố cục 2x2 cho Instagram: Trên <b>Follow 🇻🇳 | Follow 🌍</b>, Dưới <b>Likes | Views/Comments</b>.
          </p>

          <div className="mt-10 flex flex-col gap-10">
            {platforms.map((pf) => (
              <Card key={pf.name} pf={pf} />
            ))}
          </div>

          <footer className="py-10 text-center text-xs text-gray-600 dark:text-slate-300">
            © {new Date().getFullYear()} kimdeal — Follow Service
          </footer>
        </main>
      </div>
    </>
  );
}
