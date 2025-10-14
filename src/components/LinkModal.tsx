import { useState } from "react";

export default function LinkModal({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}) {
  const [url, setUrl] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    if (!url.trim()) return alert("Vui lòng nhập link!");
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) throw new Error("invalid");
      onConfirm(url);
    } catch {
      alert("Link không hợp lệ. Vui lòng nhập đúng dạng http(s)://...");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-[1px] rounded-2xl shadow-xl w-[90%] max-w-md">
        <div className="bg-slate-900 text-white rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold mb-2">🔗 Nhập link bài viết hoặc profile</h2>
          <p className="text-sm text-gray-300 mb-4">Dán link bạn muốn tăng tương tác (Instagram, TikTok, Facebook...)</p>

          <input
            type="text"
            placeholder="https://instagram.com/..."
            className="w-full p-2 rounded-lg border border-white/20 bg-white/10 focus:ring-2 focus:ring-pink-400 focus:outline-none text-white placeholder-gray-400"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <div className="flex justify-between mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-semibold transition"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
