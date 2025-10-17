// src/pages/admin/dashboard.tsx
import AdminShell from "@/components/admin/AdminShell";
import { useAdminGuard } from "@/hooks/useAdminGuard";

export default function Dashboard() {
  const ok = useAdminGuard();
  if (!ok) return null;

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-4">Tổng quan</h1>
      <p className="text-white/80">
        Xin chào bé Kim 💖 — đây là trang tổng quan. (Thêm chart, số liệu…)
      </p>
    </AdminShell>
  );
}
