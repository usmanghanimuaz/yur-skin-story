// Pure rules for the public "shared scans" showcase.
export type SharedRow = {
  id: string;
  owner_id: string;
  profile_id: string;
  photo_path: string | null;
  overall_score: number;
  metrics: unknown;
  check_in_date: string;
};
export type SharedPerson = { id: string; user_id: string; name: string; is_me: boolean };

/**
 * Only owners who opted in, only their own ("is_me") profile — never family
 * members they track — only scans with a photo, latest scan per owner, newest first.
 */
export function pickSharedScans(rows: SharedRow[], people: SharedPerson[], optedIn: Set<string>, limit?: number) {
  const self = new Map(people.filter((p) => p.is_me).map((p) => [p.id, p]));
  const seen = new Set<string>();
  const out: (SharedRow & { name: string })[] = [];
  const sorted = [...rows].sort((a, b) => b.check_in_date.localeCompare(a.check_in_date));
  for (const r of sorted) {
    if (!optedIn.has(r.owner_id) || !r.photo_path || seen.has(r.owner_id)) continue;
    const person = self.get(r.profile_id);
    if (!person || person.user_id !== r.owner_id) continue;
    seen.add(r.owner_id);
    out.push({ ...r, name: person.name.trim() || "SkinTwin member" });
    if (limit && out.length >= limit) break;
  }
  return out;
}

export const SLIDE_MS = 2000;
export const nextSlide = (i: number, total: number) => (total ? (i + 1) % total : 0);
