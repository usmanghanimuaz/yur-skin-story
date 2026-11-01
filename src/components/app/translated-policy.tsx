import type { ReactNode } from "react";
import { PolicyPage, type Section } from "./policy";
import { useContent } from "@/lib/content";
import { CONTENT_DEFAULTS } from "@/lib/content-defaults";

/** Renders a policy page whose wording comes from the translatable page text; multi-line bodies become bullet lists. */
export function TranslatedPolicy({ page, image, extras = {} }: { page: string; image?: string; extras?: Record<number, ReactNode> }) {
  const { c } = useContent();
  const defaults = CONTENT_DEFAULTS[page] ?? {};
  const count = Object.keys(defaults).filter((k) => /^s\d+_title$/.test(k)).length;
  const sections: Section[] = Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const lines = c(page, `s${n}_body`).split("\n").map((l) => l.trim()).filter(Boolean);
    const text = lines.length > 1 ? <ul>{lines.map((l) => <li key={l}>{l}</li>)}</ul> : <p>{lines[0]}</p>;
    return { title: c(page, `s${n}_title`), body: <>{text}{extras[n]}</> };
  });
  return <PolicyPage eyebrow={c(page, "eyebrow")} title={c(page, "title")} intro={c(page, "intro")} image={image} sections={sections} />;
}
