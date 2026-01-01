"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { csrfHeaders } from "@/app/components/csrf";

type ChecklistSteps = {
  profile: boolean;
  directory: boolean;
  recommendation: boolean;
};

type ChecklistState = {
  seenAt: string | null;
  completedAt: string | null;
  steps: ChecklistSteps;
};

type Props = {
  show: boolean;
  memberName: string;
  profileHref?: string | null;
  initialState?: Partial<ChecklistState>;
};

const DEFAULT_STEPS: ChecklistSteps = {
  profile: false,
  directory: false,
  recommendation: false,
};

export default function WelcomeChecklist({
  show,
  memberName,
  profileHref,
  initialState,
}: Props) {
  const [state, setState] = useState<ChecklistState>({
    seenAt: initialState?.seenAt ?? null,
    completedAt: initialState?.completedAt ?? null,
    steps: { ...DEFAULT_STEPS, ...(initialState?.steps ?? {}) },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    async function ensureSeen() {
      if (state.seenAt) return;
      setIsSaving(true);
      setError(null);
      const response = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        body: JSON.stringify({ seenAt: new Date().toISOString() }),
      });
      if (!response.ok) {
        if (!cancelled) {
          setError("Impossible de sauvegarder l'etat.");
          setIsSaving(false);
        }
        return;
      }
      const data = await response.json().catch(() => null);
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          seenAt: data?.onboarding?.seenAt ?? prev.seenAt,
        }));
        setIsSaving(false);
      }
    }

    ensureSeen();

    return () => {
      cancelled = true;
    };
  }, [show, state.seenAt]);

  const completion = useMemo(() => {
    const total = Object.keys(state.steps).length;
    const done = Object.values(state.steps).filter(Boolean).length;
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [state.steps]);

  useEffect(() => {
    if (!show || state.completedAt || completion.done !== completion.total) return;
    let cancelled = false;

    async function markComplete() {
      setIsSaving(true);
      setError(null);
      const response = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });
      if (!response.ok) {
        if (!cancelled) {
          setError("Impossible de sauvegarder l'etat.");
          setIsSaving(false);
        }
        return;
      }
      const data = await response.json().catch(() => null);
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          completedAt: data?.onboarding?.completedAt ?? prev.completedAt,
        }));
        setIsSaving(false);
      }
    }

    markComplete();

    return () => {
      cancelled = true;
    };
  }, [show, state.completedAt, completion.done, completion.total]);

  async function updateStep(step: keyof ChecklistSteps, value: boolean) {
    setError(null);
    setState((prev) => ({
      ...prev,
      steps: { ...prev.steps, [step]: value },
    }));
    setIsSaving(true);
    const response = await fetch("/api/auth/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ steps: { [step]: value } }),
    });
    if (!response.ok) {
      setError("Impossible de sauvegarder l'etat.");
      setIsSaving(false);
      return;
    }
    const data = await response.json().catch(() => null);
    setState((prev) => ({
      ...prev,
      steps: { ...prev.steps, ...(data?.onboarding?.steps ?? {}) },
    }));
    setIsSaving(false);
  }

  if (!show || state.completedAt) {
    return null;
  }

  return (
    <section className="mb-6 rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Bienvenue
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Heureux de vous voir, {memberName}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Quelques etapes rapides pour bien demarrer.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-5 py-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Progression
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {completion.done}/{completion.total}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{completion.percent}%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ChecklistCard
          title="Completer mon profil"
          description="Verifiez vos coordonnees et informations de base."
          done={state.steps.profile}
          onToggle={() => updateStep("profile", !state.steps.profile)}
          cta={
            profileHref ? (
              <Link
                href={profileHref}
                className="inline-flex rounded-full border border-[var(--stroke)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
              >
                Modifier
              </Link>
            ) : (
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Contact
              </span>
            )
          }
        />
        <ChecklistCard
          title="Parcourir l'annuaire"
          description="Explorez la communaute via les recommandations."
          done={state.steps.directory}
          onToggle={() => updateStep("directory", !state.steps.directory)}
          cta={
            <Link
              href="/community/recommendations"
              className="inline-flex rounded-full border border-[var(--stroke)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
            >
              Explorer
            </Link>
          }
        />
        <ChecklistCard
          title="Envoyer une recommandation"
          description="Partagez votre premiere recommandation."
          done={state.steps.recommendation}
          onToggle={() => updateStep("recommendation", !state.steps.recommendation)}
          cta={
            <Link
              href="/community/recommendations"
              className="inline-flex rounded-full border border-[var(--stroke)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
            >
              Commencer
            </Link>
          }
        />
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {isSaving && (
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Sauvegarde...
        </p>
      )}
    </section>
  );
}

type ChecklistCardProps = {
  title: string;
  description: string;
  done: boolean;
  onToggle: () => void;
  cta: React.ReactNode;
};

function ChecklistCard({ title, description, done, onToggle, cta }: ChecklistCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{description}</p>
        </div>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
            done
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-[var(--stroke)] bg-white text-[var(--muted)]"
          }`}
        >
          {done ? "OK" : "•"}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        {cta}
        <button
          type="button"
          onClick={onToggle}
          className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          {done ? "Annuler" : "Fait"}
        </button>
      </div>
    </div>
  );
}
