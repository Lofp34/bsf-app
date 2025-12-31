import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import RecommendationsList from "./recommendations-list";

export const dynamic = "force-dynamic";

export default async function AdminRecommendationsPage() {
  try {
    await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Acces refuse</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Cette page est reservee aux administrateurs.
        </p>
      </main>
    );
  }

  const recommendations = await prisma.recommendation.findMany({
    orderBy: { sentAt: "desc" },
    include: {
      sender: { include: { member: true } },
      recipient: true,
    },
    take: 200,
  });

  const items = recommendations.map((rec) => ({
    id: rec.id,
    senderLabel: rec.sender.member
      ? `${rec.sender.member.firstname} ${rec.sender.member.lastname}`
      : rec.sender.authEmail,
    recipientLabel: `${rec.recipient.firstname} ${rec.recipient.lastname}`,
    text: rec.text,
    status: rec.status,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Recommandations (admin)</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Vue complete des recommandations avec acces au texte.
        </p>
      </header>

      <div className="mt-6">
        <RecommendationsList items={items} />
      </div>
    </main>
  );
}
