import { Suspense } from "react";
import AcceptInviteForm from "./accept-invite-form";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen">
          <div className="surface-grid min-h-screen">
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center">
              <section className="flex-1 space-y-8">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
                    Business Sud de France
                  </p>
                  <h1 className="text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                    Activation du compte
                  </h1>
                  <p className="max-w-md text-base text-[var(--muted)]">
                    Preparation de l&apos;activation en cours.
                  </p>
                </div>
              </section>
              <section className="grain relative flex-1">
                <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-[0_24px_60px_rgba(31,35,29,0.18)]">
                  <p className="text-sm text-[var(--muted)]">
                    Chargement du formulaire...
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
