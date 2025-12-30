"use client";

import { useState } from "react";

type ImportError = { row: number; message: string };

type ImportResult = {
  ok: boolean;
  created: number;
  skipped: number;
  errors: ImportError[];
};

export default function ImportMembersForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Selectionnez un fichier Excel.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/import-members", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      setError(data?.error ?? "Import impossible.");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Importer l&apos;annuaire</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Formats supportes: .xlsx. Colonnes attendues: Prenom, Nom,
            Societe, Email, Telephone.
          </p>
        </div>
        <span className="rounded-full border border-[var(--stroke)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Super Admin
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".xlsx"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && (
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm">
            <p className="text-[var(--ink)]">
              {result.created} membres crees, {result.skipped} ignores.
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-3 space-y-1 text-[var(--muted)]">
                {result.errors.slice(0, 6).map((item, index) => (
                  <li key={`${item.row}-${index}`}>
                    Ligne {item.row}: {item.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[var(--accent)] px-6 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Import en cours" : "Lancer l'import"}
        </button>
      </form>
    </div>
  );
}
