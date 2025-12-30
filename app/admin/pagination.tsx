import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
};

export default function Pagination({ page, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const prevPage = page - 1;
  const nextPage = page + 1;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
      <span>
        Page {page} / {totalPages}
      </span>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`${basePath}?page=1`}
          className="rounded-full border border-[var(--stroke)] px-3 py-2 transition hover:border-[var(--accent)]"
        >
          Debut
        </Link>
        <Link
          href={`${basePath}?page=${prevPage}`}
          aria-disabled={page <= 1}
          className={`rounded-full border px-3 py-2 transition ${
            page <= 1
              ? "pointer-events-none border-[var(--stroke)] text-[var(--muted)]/60"
              : "border-[var(--stroke)] hover:border-[var(--accent)]"
          }`}
        >
          Precedent
        </Link>
        <Link
          href={`${basePath}?page=${nextPage}`}
          aria-disabled={page >= totalPages}
          className={`rounded-full border px-3 py-2 transition ${
            page >= totalPages
              ? "pointer-events-none border-[var(--stroke)] text-[var(--muted)]/60"
              : "border-[var(--stroke)] hover:border-[var(--accent)]"
          }`}
        >
          Suivant
        </Link>
        <Link
          href={`${basePath}?page=${totalPages}`}
          className="rounded-full border border-[var(--stroke)] px-3 py-2 transition hover:border-[var(--accent)]"
        >
          Fin
        </Link>
      </div>
    </div>
  );
}
