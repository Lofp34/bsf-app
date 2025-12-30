"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Connexion impossible.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen">
      <div className="surface-grid min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center">
          <section className="flex-1 space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
                Business Sud de France
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
                Connexion au reseau
              </h1>
              <p className="max-w-md text-base text-[var(--muted)]">
                Accedez a l&apos;annuaire, aux recommandations et aux evenements.
                Votre identifiant reste votre email de membre.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--card)] text-[var(--accent-deep)]">
                01
              </span>
              <span>Authentifiez-vous pour continuer.</span>
            </div>
          </section>

          <section className="grain relative flex-1">
            <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-[0_24px_60px_rgba(31,35,29,0.18)]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Bienvenue</h2>
                <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                  MVP
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Utilisez votre mot de passe. Vous pouvez le definir via une invitation.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
                    placeholder="prenom.nom@domaine.fr"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Mot de passe
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
                    placeholder="••••••••"
                  />
                </label>

                {error && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              <span>Vercel + Neon</span>
              <span>Mobile-first</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
