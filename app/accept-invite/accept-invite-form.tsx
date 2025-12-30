"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error ?? "Activation impossible.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
                Activation du compte
              </h1>
              <p className="max-w-md text-base text-[var(--muted)]">
                Finalisez votre acces en definissant un mot de passe securise.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--card)] text-[var(--accent-deep)]">
                02
              </span>
              <span>Invitation requise pour activer le compte.</span>
            </div>
          </section>

          <section className="grain relative flex-1">
            <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-[0_24px_60px_rgba(31,35,29,0.18)]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Bienvenue</h2>
                <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                  Invite
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Entrez le lien d&apos;invitation recu et choisissez votre mot de passe.
              </p>

              {success ? (
                <div className="mt-8 space-y-4">
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Compte active. Vous pouvez vous connecter.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)]"
                  >
                    Acceder a la connexion
                  </button>
                </div>
              ) : (
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Token d&apos;invitation
                    </span>
                    <input
                      type="text"
                      required
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
                      placeholder="Collez le token ici"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Mot de passe
                    </span>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
                      placeholder="••••••••"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Confirmation
                    </span>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
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
                    {loading ? "Activation..." : "Activer le compte"}
                  </button>
                </form>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              <span>Activation securisee</span>
              <span>Support admin</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
