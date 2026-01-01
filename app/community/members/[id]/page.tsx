import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

export default async function CommunityMemberDetailPage({ params }: PageProps) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      company: true,
      email: true,
      phone: true,
      consentShareContact: true,
      createdAt: true,
    },
  });

  if (!member) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-[var(--stroke)] bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Membre introuvable</h1>
          <Link
            href="/community/members"
            className="mt-4 inline-flex rounded-full border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            Retour a la liste
          </Link>
        </div>
      </main>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {member.firstname} {member.lastname}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{member.company}</p>
            <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
              {member.consentShareContact ? (
                <>
                  <p>Email: {member.email ?? "Non renseigne"}</p>
                  <p>Telephone: {member.phone ?? "Non renseigne"}</p>
                </>
              ) : (
                <p>Coordonnees non partagees.</p>
              )}
              <p>Inscription: {dateFormatter.format(member.createdAt)}</p>
            </div>
          </div>
          <Link
            href="/community/members"
            className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
          >
            Retour
          </Link>
        </div>
      </header>
    </main>
  );
}
