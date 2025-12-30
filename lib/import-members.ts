export type ImportMemberRow = {
  firstname: string;
  lastname: string;
  company: string;
  email?: string;
  phone?: string;
  sourceRow: number;
};

const HEADER_MAP: Record<string, keyof Omit<ImportMemberRow, "sourceRow">> = {
  prenom: "firstname",
  firstname: "firstname",
  nom: "lastname",
  lastname: "lastname",
  societe: "company",
  company: "company",
  email: "email",
  mail: "email",
  telephone: "phone",
  phone: "phone",
};

export function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function buildMemberKey(row: ImportMemberRow): string {
  if (row.email) {
    return `email:${row.email.trim().toLowerCase()}`;
  }
  const company = row.company.trim().toLowerCase();
  const firstname = row.firstname.trim().toLowerCase();
  const lastname = row.lastname.trim().toLowerCase();
  return `name:${firstname}|${lastname}|${company}`;
}

export function mapHeaders(headers: string[]): Record<string, keyof ImportMemberRow> {
  const mapping: Record<string, keyof ImportMemberRow> = {};
  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    const mapped = HEADER_MAP[normalized];
    if (mapped) {
      mapping[header] = mapped;
    }
  });
  return mapping;
}

export function parseRows(rows: Record<string, unknown>[]) {
  const errors: { row: number; message: string }[] = [];
  const members: ImportMemberRow[] = [];
  const headerKeys = rows.length ? Object.keys(rows[0]) : [];
  const mapping = mapHeaders(headerKeys);

  rows.forEach((row, index) => {
    const sourceRow = index + 2;
    const data: Partial<ImportMemberRow> = {
      sourceRow,
    };

    Object.entries(mapping).forEach(([header, field]) => {
      const value = row[header];
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed) {
          data[field] = trimmed as never;
        }
      }
    });

    if (!data.firstname || !data.lastname || !data.company) {
      errors.push({
        row: sourceRow,
        message: "Champs requis manquants (prenom/nom/societe).",
      });
      return;
    }

    members.push(data as ImportMemberRow);
  });

  return { members, errors };
}
