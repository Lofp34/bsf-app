"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  description: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", description: "Tableau de bord" },
  { href: "/admin/members", label: "Membres", description: "Annuaire" },
  { href: "/admin/invitations", label: "Invitations", description: "Acces" },
  { href: "/admin/users", label: "Utilisateurs", description: "Comptes" },
  { href: "/admin/events", label: "Evenements", description: "Agenda" },
];

type Props = {
  email: string;
  roleLabel: string;
};

export default function AdminNav({ email, roleLabel }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] px-5 py-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          Business Sud de France
        </p>
        <h2 className="mt-3 text-2xl font-semibold">Admin</h2>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Navigation MVP pour piloter les donnees.
        </p>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl border px-4 py-3 transition ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--card)] text-[var(--ink)] shadow-sm"
                  : "border-[var(--stroke)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs uppercase tracking-[0.2em]">{item.description}</p>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[var(--stroke)] bg-white px-4 py-4 text-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Connecte
        </p>
        <p className="mt-2 text-sm font-semibold">{email}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{roleLabel}</p>
      </div>
    </aside>
  );
}
