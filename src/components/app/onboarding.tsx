import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Sun, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { accountOptions } from "@/lib/data";
import { useActivePerson } from "@/hooks/use-active-person";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelect } from "./app-shell";

const STEPS = ["Consent", "Preferences", "First profile", "Photo tips"];

export function Onboarding() {
  const { data: acct } = useQuery(accountOptions);
  const { people, setActiveId } = useActivePerson();
  const { t } = useI18n();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (acct) setStep(Math.min(acct.account.onboarding_step, 3)); }, [acct]);
  const uid = acct?.user.id ?? "";
  const save = async (next: number, patch: Record<string, unknown> = {}) => {
    setBusy(true);
    try {
      const done = next > 3;
      const { error } = await supabase.from("profiles").update({ ...patch, onboarding_step: Math.min(next, 4), onboarded: done }).eq("user_id", uid);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["account"] });
      if (done) await navigate({ to: "/dashboard" }); else setStep(next);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Please try again."); } finally { setBusy(false); }
  };
  const person = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const share = f.get("share") === "on"; const sharePatch = { share_scans: share, share_scans_at: share ? new Date().toISOString() : null };
    if (people.length) return save(3, sharePatch);
    setBusy(true);
    const { data, error } = await supabase.from("person_profiles").insert({ name: String(f.get("name")), skin_type: String(f.get("skin_type")), age_band: String(f.get("age_band")), country: String(f.get("country")), allergies: String(f.get("allergies")), pregnancy: f.get("pregnancy") === "on", is_me: true }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setActiveId(data.id); await qc.invalidateQueries({ queryKey: ["people"] }); await save(3, sharePatch);
  };
  return <div className="max-w-xl">
    <ol className="mb-8 flex gap-2" aria-label="Onboarding progress">{STEPS.map((s, i) => <li key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} title={s} />)}</ol>
    <p className="mb-2 text-xs text-muted-foreground">Step {step + 1} of 4 · {STEPS[step]}</p>
    {step === 0 && <form onSubmit={(e) => { e.preventDefault(); void save(1, { consent_version: "1" }); }} className="space-y-5"><h1 className="text-4xl sm:text-5xl">Meet your skin twin.</h1><p className="text-sm leading-7 text-muted-foreground">SkinTwin keeps a private weekly record of your skin. Photos stay in private storage, are sent to YouCam only for analysis, and can be erased at any time.</p><label className="flex items-start gap-2 text-sm"><input type="checkbox" required className="mt-1" /> I am 18 or older and agree to the Terms, Privacy Policy and Photo Retention policy.</label><label className="flex items-start gap-2 text-sm"><input type="checkbox" required className="mt-1" /> I understand SkinTwin gives cosmetic guidance, not medical diagnosis.</label><Button disabled={busy} className="rounded-full"><ShieldCheck />{t("next")}</Button></form>}
    {step === 1 && <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void save(2, { weekly_reminder: f.get("weekly") === "on", routine_reminders: f.get("routine") === "on" }); }} className="space-y-5"><h1 className="text-4xl">Make it yours.</h1><LanguageSelect /><label className="flex gap-2 text-sm"><input name="weekly" type="checkbox" defaultChecked={acct?.account.weekly_reminder} /> Show a weekly check-in reminder in the app</label><label className="flex gap-2 text-sm"><input name="routine" type="checkbox" defaultChecked={acct?.account.routine_reminders} /> Routine reminders (download to your calendar later)</label><p className="text-xs text-muted-foreground">Reminders appear inside SkinTwin. Email reminders are not sent yet.</p><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(0)}>{t("back")}</Button><Button disabled={busy}>{t("next")}</Button></div></form>}
    {step === 2 && <form onSubmit={person} className="space-y-5"><h1 className="text-4xl">Your first profile.</h1>{people.length ? <p className="text-sm text-muted-foreground">Profile “{people[0]?.name}” is ready.</p> : <><Field name="name" label="Name" def="Me" /><div className="grid gap-4 sm:grid-cols-2"><Sel name="skin_type" label="Skin type" values={["Not sure", "Normal", "Dry", "Oily", "Combination", "Sensitive"]} /><Sel name="age_band" label="Age band" values={["18-24", "25-34", "35-44", "45-54", "55+"]} /></div><Field name="country" label="Country" /><Field name="allergies" label="Allergies or sensitivities" required={false} /><label className="flex gap-2 text-sm"><input name="pregnancy" type="checkbox" /> Pregnant or breastfeeding</label></>}<label className="flex items-start gap-2 rounded-2xl border bg-card p-4 text-sm"><input name="share" type="checkbox" defaultChecked={acct?.account.share_scans} className="mt-1" /><span><b>Show my scans to others?</b><span className="block text-xs text-muted-foreground">Tick yes to show your face photo, name and skin scores from your latest scan on the public home page. You can turn this off anytime in Settings.</span></span></label><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(1)}>{t("back")}</Button><Button disabled={busy}>{busy && <Loader2 className="animate-spin" />}{t("next")}</Button></div></form>}
    {step === 3 && <div className="space-y-5"><h1 className="text-4xl">A good photo, every week.</h1><ul className="space-y-3 text-sm"><li className="flex gap-3"><Sun className="size-5 text-primary" /> Soft daylight facing a window, no harsh shadows.</li><li className="flex gap-3"><Camera className="size-5 text-primary" /> Face straight to the camera, filling most of the frame.</li><li className="flex gap-3"><ShieldCheck className="size-5 text-primary" /> No filters, glasses or heavy makeup. Same spot each week.</li></ul><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>{t("back")}</Button><Button disabled={busy} onClick={() => void save(4)}>{t("finish")}</Button></div></div>}
  </div>;
}
function Field({ name, label, def = "", required = true }: { name: string; label: string; def?: string; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} defaultValue={def} required={required} maxLength={name === "allergies" ? 300 : 60} className="h-11 rounded-xl bg-card" /></div>; }
function Sel({ name, label, values }: { name: string; label: string; values: string[] }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} className="h-11 w-full rounded-xl border bg-card px-3 text-sm">{values.map((v) => <option key={v}>{v}</option>)}</select></div>; }
