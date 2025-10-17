// src/pages/admin/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 kiểm tra mật khẩu đơn giản
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      localStorage.setItem("adminAuth", "true");
      router.push("/admin/dashboard"); // chuyển tới trang quản lý
    } else {
      setError("Sai mật khẩu rồi bé Kim ơi 🥲");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/15 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
        <input
          type="password"
          placeholder="Nhập mật khẩu..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/20 outline-none text-white placeholder:text-white/60"
        />
        {error && <p className="mt-2 text-pink-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-600 transition"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
