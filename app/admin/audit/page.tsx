import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      actor: {
        select: {
          authEmail: true,
        },
      },
    },
  });

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Journal d&apos;audit</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Historique des actions admin pour tracer les operations clees.
        </p>
      </header>

      <section className="mt-6 space-y-4">
        {logs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
            Aucun evenement d&apos;audit pour le moment.
          </div>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-5 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {log.action}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {dateFormatter.format(log.createdAt)}
                </p>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {log.actor?.authEmail ?? "Systeme"}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
