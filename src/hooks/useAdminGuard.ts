// src/hooks/useAdminGuard.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function useAdminGuard() {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const isAuth = typeof window !== "undefined" && localStorage.getItem("adminAuth");
    if (!isAuth) router.replace("/admin/login");
    else setOk(true);
  }, [router]);

  return ok;
}
