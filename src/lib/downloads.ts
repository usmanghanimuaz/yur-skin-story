import type { CheckInLite } from "./products";
import { METRICS } from "./skin";

export function downloadBlob(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadPdf(person: string, checks: CheckInLite[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 24;
  const line = (text: string, size = 11) => {
    if (y > 265) { doc.addPage(); y = 24; }
    doc.setFontSize(size); doc.text(text, 20, y); y += size > 14 ? 12 : 7;
  };
  line("Skin Twin AI", 24); line(`Progress report — ${person}`, 16);
  line(`Exported ${new Date().toLocaleDateString("en-GB")}`); y += 7;
  for (const c of checks) {
    line(`${new Date(c.check_in_date).toLocaleDateString("en-GB")}  |  Overall ${c.overall_score}/100`, 14);
    for (const m of METRICS) line(`${m.label}: ${c.metrics[m.key] ?? "Unavailable"}`);
    y += 6;
  }
  line("Cosmetic estimates only. Not a medical device or diagnosis.");
  line("Changes can reflect lighting, pose or routine, not proven product effects.");
  doc.save(`Skin-Twin-AI-${person.replace(/[^a-zA-Z0-9]/g, "-")}-progress.pdf`);
}