import Link from "next/link";
import EventForm from "../event-form";

export default function EventCreatePage() {
  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Creer un evenement</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Publiez un evenement pour le reseau Business Sud de France.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Pour inviter des membres, passez par{" "}
              <Link
                href="/community/events/new"
                className="font-semibold text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-4"
              >
                Communaute &gt; Activites
              </Link>
              .
            </p>
          </div>
          <Link
            href="/admin/events"
            className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
          >
            Retour
          </Link>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
        <EventForm mode="create" />
      </div>
    </main>
  );
}
