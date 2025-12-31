import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import RecommendationForm from "./recommendation-form";
import SentList from "./sent-list";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  let user;
  try {
    user = await requireSessionUser([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.USER,
    ]);
  } catch (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Acces refuse</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Vous devez etre connecte pour acceder a cet espace.
        </p>
      </main>
    );
  }

  const [members, recommendations] = await Promise.all([
    prisma.member.findMany({
      orderBy: { lastname: "asc" },
      select: { id: true, firstname: true, lastname: true, company: true },
    }),
    prisma.recommendation.findMany({
      orderBy: { sentAt: "desc" },
      include: {
        sender: { include: { member: true } },
        recipient: true,
      },
      take: 120,
    }),
  ]);

  const sent = recommendations
    .filter((rec) => rec.senderUserId === user.id)
    .map((rec) => ({
      id: rec.id,
      status: rec.status,
      recipientLabel: `${rec.recipient.firstname} ${rec.recipient.lastname}`,
      text: rec.text,
    }));
  const received = recommendations.filter(
    (rec) => rec.recipientMemberId === user.memberId,
  );

  return (
    <main className="mx-auto w-full max-w-5xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Recommandations</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Suivez les recommandations envoyees, recues et visibles par la communaute.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Fil communaute</h2>
          {recommendations.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
              Aucune recommandation disponible.
            </div>
          )}
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">
                {rec.sender.member?.firstname} {rec.sender.member?.lastname} →{" "}
                {rec.recipient.firstname} {rec.recipient.lastname}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Statut: {rec.status}
              </p>
              {rec.status === "VALIDATED" && rec.revenueAmount && (
                <p className="mt-2 text-sm text-[var(--ink)]">
                  Montant: {rec.revenueAmount.toString()}{" "}
                  {rec.revenueCurrency ?? "EUR"}
                </p>
              )}
            </div>
          ))}
        </section>

        <div className="space-y-6">
          <RecommendationForm members={members} />

          <SentList items={sent} />

          <section className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Recommandations recues</h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {received.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--card)] px-4 py-3">
                  Aucune recommandation recue.
                </p>
              )}
              {received.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    Par {rec.sender.member?.firstname} {rec.sender.member?.lastname}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Statut: {rec.status}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">{rec.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
