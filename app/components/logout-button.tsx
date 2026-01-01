"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { csrfHeaders } from "@/app/components/csrf";

type Props = {
  className?: string;
  label?: string;
};

export default function LogoutButton({ className, label = "Se deconnecter" }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { ...csrfHeaders() },
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Deconnexion..." : label}
    </button>
  );
}
