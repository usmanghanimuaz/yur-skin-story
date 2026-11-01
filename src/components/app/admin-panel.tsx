import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, RefreshCw, ShieldAlert, Trash2, Upload, Lock, Unlock, MessageSquare, BellRing, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./dashboard";
import { LOCALES, LABEL_KEYS } from "@/lib/i18n";
import { CONTENT_DEFAULTS, CONTENT_PAGES } from "@/lib/content-defaults";
import { contentCoverage, toContentMap } from "@/lib/content-overrides";
import {
  adminAccounts, adminActivityLog, adminBulkImport, adminDeletionQueue, adminDeleteContentOverride, adminDeleteLocaleOverride,
  adminOverview, adminReminderCentre, adminReplySupport, adminRetryDeletions, adminScanLog, adminSendReminders,
  adminSetBlocked, adminSetContentOverride, adminSetLocaleOverride, adminSupportInbox, contentOverrides, localeOverrides,
} from "@/lib/admin.functions";

const card = "rounded-2xl border bg-card p-5";
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return <section className="space-y-4"><h2 className="text-3xl">{title}</h2><p className="text-sm text-muted-foreground">{hint}</p>{children}</section>;
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <div className={card}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-4xl">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}

/* --------------------------------- overview --------------------------------- */

export function OverviewNumbers() {
  const load = useServerFn(adminOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: () => load() });
  const peak = Math.max(1, ...(data?.scans.perDay ?? [1]));
  return <Section title="How it is going" hint="A quick read of the whole app: who joined, how much it is used, and what needs your attention.">
    {isLoading && <p className="text-sm text-muted-foreground">Counting…</p>}
    {data && <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Accounts" value={data.accounts.total} hint={`${data.accounts.verified} verified · ${data.accounts.verifiedPercent}%`} />
        <Stat label="Joined this week" value={data.accounts.joined7} hint="Newest first in Accounts below" />
        <Stat label="Check-ins" value={data.scans.total} hint={`${data.scans.today} scanned today`} />
        <Stat label="Open messages" value={data.support.open} hint={`${data.support.total} in total`} />
        <Stat label="Photos stored" value={data.photos.stored} hint={`${data.photos.waiting} waiting to be erased`} />
        <Stat label="Photos failing to erase" value={data.photos.failing} hint="Retried every hour" />
        <Stat label="Paused accounts" value={data.limits.paused} hint="Cannot start a scan" />
        <Stat label="Catalogue" value={data.catalogue.products} hint={`${data.catalogue.pendingReview} awaiting review`} />
      </div>
      <div className={card}>
        <p className="text-xs text-muted-foreground">CHECK-INS OVER THE LAST 7 DAYS</p>
        <div className="mt-4 flex h-32 items-end gap-2">{data.scans.days.map((d, i) => <div key={d} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{data.scans.perDay[i]}</span>
          <div className="w-full rounded-t-lg bg-primary/80" style={{ height: `${Math.max(3, (data.scans.perDay[i] / peak) * 100)}%` }} />
          <span className="text-[10px] text-muted-foreground">{day(d)}</span>
        </div>)}</div>
        {data.scans.byEngine.length > 0 && <p className="mt-4 text-xs text-muted-foreground">Results saved from: {data.scans.byEngine.map((e) => `${e.engine} (${e.count})`).join(", ")}</p>}
      </div>
    </>}
  </Section>;
}

/* --------------------------------- support inbox --------------------------------- */

export function SupportInbox() {
  const qc = useQueryClient();
  const load = useServerFn(adminSupportInbox);
  const reply = useServerFn(adminReplySupport);
  const { data = [], isLoading } = useQuery({ queryKey: ["support-inbox"], queryFn: () => load() });
  const [text, setText] = useState<Record<string, string>>({});
  const send = async (id: string, close: boolean) => {
    const body = (text[id] ?? "").trim();
    if (body.length < 2) { toast.error("Write a reply first."); return; }
    try {
      await reply({ data: { id, reply: body, close } });
      toast.success(close ? "Marked closed." : "Reply saved.");
      setText((t) => ({ ...t, [id]: "" }));
      await qc.invalidateQueries();
    } catch (e) { toast.error(e instanceof Error ? e.message : "The reply could not be saved."); }
  };
  const open = data.filter((m) => m.status === "open").length;
  return <Section title="Support inbox" hint={`Messages people sent from inside the app. ${open} still waiting for a reply.`}>
    {!data.length && !isLoading && <EmptyState title="Nothing waiting" text="No one has messaged from inside the app yet." />}
    <div className="space-y-3">{data.map((m) => <div key={m.id} className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{m.subject}</p>
        <span className={`rounded-full px-2 py-1 text-[11px] ${m.status === "open" ? "bg-secondary text-primary" : "bg-secondary text-muted-foreground"}`}>{m.status}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{m.email} · {when(m.created_at)}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6">{m.body}</p>
      {m.admin_reply && <p className="mt-3 rounded-xl bg-secondary p-3 text-sm leading-6"><span className="text-xs text-muted-foreground">Your reply · {when(m.replied_at)}</span><br />{m.admin_reply}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <textarea aria-label={`Reply to ${m.subject}`} value={text[m.id] ?? ""} onChange={(e) => setText((t) => ({ ...t, [m.id]: e.target.value }))} placeholder="Write a reply…" rows={3} className="min-w-56 flex-1 rounded-xl border bg-card p-3 text-sm" />
        <div className="flex flex-col gap-2">
          <Button size="sm" onClick={() => void send(m.id, false)}><Mail />Send reply</Button>
          <Button size="sm" variant="outline" onClick={() => void send(m.id, true)}>Reply &amp; close</Button>
        </div>
      </div>
    </div>)}</div>
  </Section>;
}

/* -------------------------------- deletion queue -------------------------------- */

export function DeletionQueue() {
  const qc = useQueryClient();
  const load = useServerFn(adminDeletionQueue);
  const retry = useServerFn(adminRetryDeletions);
  const { data, isLoading } = useQuery({ queryKey: ["deletion-queue"], queryFn: () => load() });
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const out = await retry().catch(() => null);
    setBusy(false);
    if (!out) { toast.error("The queue could not be processed."); return; }
    toast.success(`${out.erased} photo file${out.erased === 1 ? "" : "s"} erased from ${out.scanned} queued.`);
    await qc.invalidateQueries();
  };
  const c = data?.counts;
  return <Section title="Deleted photos" hint="Every photo a person deletes is queued here until its file is really gone. A failed row is retried automatically each hour.">
    <div className="flex flex-wrap gap-3 text-xs">
      {[["Waiting", c?.pending ?? 0], ["Failing", c?.failing ?? 0], ["Erased", c?.erased ?? 0], ["Invalid", c?.invalid ?? 0]].map(([label, n]) => <span key={String(label)} className="rounded-full bg-secondary px-3 py-1">{label}: <strong>{n}</strong></span>)}
      <Button size="sm" variant="outline" disabled={busy} onClick={() => void run()}><RefreshCw className={busy ? "animate-spin" : ""} />Run the queue now</Button>
    </div>
    {!data?.rows.length && !isLoading && <EmptyState title="Nothing queued" text="No photo deletions are waiting." />}
    <div className="divide-y rounded-2xl border bg-card">{(data?.rows ?? []).slice(0, 60).map((r) => <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="flex flex-wrap items-center gap-2">
        <span className={`size-1.5 rounded-full ${r.status === "erased" ? "bg-primary" : r.status === "pending" ? (r.attempts ? "bg-rose" : "bg-muted-foreground") : "bg-secondary-foreground"}`} />
        <span className="capitalize">{r.status}</span>
        <span className="text-xs text-muted-foreground">{r.email} · {when(r.created_at)}</span>
        {r.attempts > 0 && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{r.attempts} attempts</span>}
      </span>
      {r.last_error && <span className="max-w-72 truncate text-xs text-destructive" title={r.last_error}>{r.last_error}</span>}
    </div>)}</div>
  </Section>;
}

/* ------------------------------- accounts & limits ------------------------------- */

export function AccountsPanel() {
  const qc = useQueryClient();
  const load = useServerFn(adminAccounts);
  const setBlocked = useServerFn(adminSetBlocked);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-accounts"], queryFn: () => load() });
  const [reason, setReason] = useState<Record<string, string>>({});
  const toggle = async (id: string, blocked: boolean) => {
    try {
      await setBlocked({ data: { userId: id, blocked, reason: reason[id] ?? "" } });
      toast.success(blocked ? "Account paused." : "Account resumed.");
      await qc.invalidateQueries();
    } catch (e) { toast.error(e instanceof Error ? e.message : "The account state could not be saved."); }
  };
  return <Section title="Accounts and limits" hint="Who has signed up, how many scans they have used today, and pausing an account that abuses the limit.">
    <div className="flex flex-wrap gap-3 text-xs">
      <span className="rounded-full bg-secondary px-3 py-1">Accounts: <strong>{data.length}</strong></span>
      <span className="rounded-full bg-secondary px-3 py-1">Verified: <strong>{data.filter((a) => a.verified).length}</strong></span>
      <span className="rounded-full bg-secondary px-3 py-1">Paused: <strong>{data.filter((a) => a.blocked).length}</strong></span>
    </div>
    {!data.length && !isLoading && <EmptyState title="No accounts yet" text="Nobody has signed up so far." />}
    <div className="space-y-2">{data.map((a) => <div key={a.id} className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{a.email} {a.verified ? "" : <span className="text-xs text-destructive">· email not verified</span>}</p>
          <p className="mt-1 text-xs text-muted-foreground">Joined {when(a.created)} · {a.scans} scan{a.scans === 1 ? "" : "s"} · {a.today} of 10 today {a.lastScan ? `· last ${when(a.lastScan)}` : ""}</p>
          {a.blocked && <p className="mt-1 text-xs text-destructive">Paused{a.reason ? `: ${a.reason}` : ""}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input aria-label={`Reason for pausing ${a.email}`} value={reason[a.id] ?? ""} onChange={(e) => setReason((r) => ({ ...r, [a.id]: e.target.value }))} placeholder="Reason (optional)" className="h-9 w-44 rounded-xl bg-card text-xs" />
          <Button size="sm" variant={a.blocked ? "default" : "outline"} onClick={() => void toggle(a.id, !a.blocked)}>
            {a.blocked ? <><Unlock />Resume</> : <><Lock />Pause</>}
          </Button>
        </div>
      </div>
    </div>)}</div>
  </Section>;
}

/* ---------------------------------- scan log ---------------------------------- */

export function ScanLog() {
  const load = useServerFn(adminScanLog);
  const { data = [], isLoading } = useQuery({ queryKey: ["scan-log"], queryFn: () => load() });
  const failed = data.filter((l) => l.status === "failed").length;
  return <Section title="Scan log" hint={`Every analysis attempt and its outcome. ${failed} failed${failed === 1 ? "" : "s"} in the last 100.`}>
    {!data.length && !isLoading && <EmptyState title="No scans yet" text="No analysis has been attempted yet." />}
    <div className="divide-y rounded-2xl border bg-card">{data.slice(0, 60).map((l) => <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="flex flex-wrap items-center gap-2">
        <span className={`size-1.5 rounded-full ${l.status === "success" ? "bg-primary" : "bg-rose"}`} />
        <span className="capitalize">{l.stage}</span>
        <span className="text-xs text-muted-foreground">{l.email} · {when(l.created_at)}</span>
      </span>
      <span className="text-xs text-muted-foreground">{l.duration_ms != null ? `${l.duration_ms} ms` : ""} {l.detail ?? ""}</span>
    </div>)}</div>
  </Section>;
}

/* --------------------------------- reminders --------------------------------- */

export function ReminderCentre() {
  const qc = useQueryClient();
  const load = useServerFn(adminReminderCentre);
  const send = useServerFn(adminSendReminders);
  const { data, isLoading } = useQuery({ queryKey: ["admin-reminders"], queryFn: () => load() });
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const out = await send().catch(() => null);
    setBusy(false);
    if (!out) { toast.error("Reminders could not be recorded."); return; }
    toast.success(out.sent ? `${out.sent} reminder${out.sent === 1 ? "" : "s"} recorded for ${out.people} ${out.people === 1 ? "person" : "people"}.` : "No one was due for a reminder.");
    await qc.invalidateQueries();
  };
  return <Section title="Reminders" hint="In-app reminders people asked for: a weekly check-in nudge and a routine nudge. Each one is recorded once per period, and a daily job runs this automatically.">
    <div className="flex flex-wrap gap-3 text-xs">
      <span className="rounded-full bg-secondary px-3 py-1">Weekly on: <strong>{data?.optIns.weekly ?? 0}</strong></span>
      <span className="rounded-full bg-secondary px-3 py-1">Routine on: <strong>{data?.optIns.routine ?? 0}</strong></span>
      <span className="rounded-full bg-secondary px-3 py-1">Due now: <strong>{data?.due.length ?? 0}</strong></span>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => void run()}><BellRing className={busy ? "animate-spin" : ""} />Send reminders now</Button>
    </div>
    {!isLoading && data && !data.due.length && <EmptyState title="No one is due" text="Everyone opted in has checked in within the last week." />}
    {data?.due.length ? <div className="divide-y rounded-2xl border bg-card">{data.due.slice(0, 40).map((d) => <div key={d.user_id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="truncate">{d.email}</span>
      <span className="text-xs text-muted-foreground">{d.last ? `Last check-in ${when(d.last)}` : "No check-in yet"}</span>
    </div>)}</div> : null}
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">LAST RECORDED</p>
      {data?.recent.length ? <ul className="mt-2 space-y-1 text-xs">{data.recent.slice(0, 12).map((r) => <li key={r.id} className="flex flex-wrap justify-between gap-2"><span className="truncate">{r.email} · <span className="capitalize">{r.kind}</span></span><span className="text-muted-foreground">{when(r.sent_at)}</span></li>)}</ul> : <p className="mt-2 text-xs text-muted-foreground">Nothing recorded yet.</p>}
    </div>
  </Section>;
}

/* --------------------------------- bulk import --------------------------------- */

const IMPORT_EXAMPLE = "name,brand,category,actives,country,retailer,price,currency,url\nHydrating Serum,Example Lab,serum,hyaluronic acid,Pakistan,Example Store,2499,PKR,https://example.com";

export function BulkImport() {
  const qc = useQueryClient();
  const run = useServerFn(adminBulkImport);
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!csv.trim()) { toast.error("Paste the sheet first."); return; }
    setBusy(true);
    const out = await run({ data: { csv } }).catch(() => null);
    setBusy(false);
    if (!out) { toast.error("The sheet could not be imported."); return; }
    toast.success(`${out.products} product${out.products === 1 ? "" : "s"} and ${out.listings} listing${out.listings === 1 ? "" : "s"} added.`);
    if (out.skipped) toast.error(`${out.skipped} line${out.skipped === 1 ? "" : "s"} skipped: ${out.problems[0] ?? "see the sheet"}`);
    setCsv("");
    await qc.invalidateQueries();
  };
  return <Section title="Bulk import" hint="Paste a sheet with one product per line. Prices are stored unverified — tick a listing as checked only after you confirm it yourself.">
    <form onSubmit={submit} className="space-y-3">
      <textarea aria-label="Catalogue sheet" value={csv} onChange={(e) => setCsv(e.target.value)} rows={8} placeholder={IMPORT_EXAMPLE} className="w-full rounded-xl border bg-card p-3 font-mono text-xs" />
      <Button type="submit" disabled={busy}><Upload />{busy ? "Importing…" : "Import sheet"}</Button>
    </form>
  </Section>;
}

/* -------------------------------- translations -------------------------------- */

export function TranslationEditor() {
  const qc = useQueryClient();
  const load = useServerFn(localeOverrides);
  const save = useServerFn(adminSetLocaleOverride);
  const remove = useServerFn(adminDeleteLocaleOverride);
  const { data = [] } = useQuery({ queryKey: ["locale-overrides"], queryFn: () => load() });
  const [locale, setLocale] = useState<string>(LOCALES[0]?.code ?? "en");
  const [key, setKey] = useState<string>(LABEL_KEYS[0] ?? "overview");
  const [value, setValue] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) { toast.error("Write the label first."); return; }
    try {
      await save({ data: { locale, key, value } });
      toast.success("Label saved.");
      setValue("");
      await qc.invalidateQueries();
    } catch (e) { toast.error(e instanceof Error ? e.message : "The label could not be saved."); }
  };
  const mine = data.filter((r) => r.locale === locale);
  return <Section title="Interface labels" hint="Fix or change any word in the app without a rebuild. Your text wins over the built-in wording.">
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4">
      <select aria-label="Language" value={locale} onChange={(e) => setLocale(e.target.value)} className="h-11 rounded-xl border bg-card px-3 text-sm">{LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select>
      <select aria-label="Label" value={key} onChange={(e) => setKey(e.target.value)} className="h-11 rounded-xl border bg-card px-3 text-sm">{LABEL_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="New wording" className="h-11 rounded-xl bg-card" />
      <Button type="submit" className="w-fit"><MessageSquare />Save label</Button>
    </form>
    <div className="divide-y rounded-2xl border bg-card">{mine.length ? mine.map((r) => <div key={`${r.locale}-${r.label_key}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <span>{r.label_key} — <strong>{r.label_value}</strong></span>
      <Button size="sm" variant="ghost" aria-label={`Remove ${r.label_key}`} onClick={async () => { await remove({ data: { locale: r.locale, key: r.label_key } }); await qc.invalidateQueries(); }}><Trash2 /></Button>
    </div>) : <p className="px-4 py-4 text-sm text-muted-foreground">No changed labels for this language yet.</p>}</div>
  </Section>;
}

/* ------------------------------- page wording ------------------------------- */

export function PageTextEditor() {
  const qc = useQueryClient();
  const load = useServerFn(contentOverrides);
  const save = useServerFn(adminSetContentOverride);
  const remove = useServerFn(adminDeleteContentOverride);
  const { data = [] } = useQuery({ queryKey: ["content-overrides"], queryFn: () => load() });
  const [locale, setLocale] = useState<string>(LOCALES[0]?.code ?? "en");
  const [page, setPage] = useState<string>(CONTENT_PAGES[0] ?? "landing");
  const keys = Object.keys(CONTENT_DEFAULTS[page] ?? {});
  const [key, setKey] = useState<string>(keys[0] ?? "");
  const [value, setValue] = useState("");
  const map = toContentMap(data);
  const coverage = contentCoverage(map, locale, page, CONTENT_DEFAULTS[page] ?? {});
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) { toast.error("Write the wording first."); return; }
    try {
      await save({ data: { locale, page, key, value } });
      toast.success("Page wording saved.");
      setValue("");
      await qc.invalidateQueries();
    } catch (e) { toast.error(e instanceof Error ? e.message : "The wording could not be saved."); }
  };
  const mine = data.filter((r) => r.locale === locale && r.page_key === page);
  return <Section title="Page text" hint={`Write the marketing pages in any language. ${coverage.done} of ${coverage.total} sentences on this page are written for this language.`}>
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <select aria-label="Language" value={locale} onChange={(e) => setLocale(e.target.value)} className="h-11 rounded-xl border bg-card px-3 text-sm">{LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select>
        <select aria-label="Page" value={page} onChange={(e) => { setPage(e.target.value); setKey(Object.keys(CONTENT_DEFAULTS[e.target.value] ?? {})[0] ?? ""); }} className="h-11 rounded-xl border bg-card px-3 text-sm">{CONTENT_PAGES.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <select aria-label="Sentence" value={key} onChange={(e) => setKey(e.target.value)} className="h-11 rounded-xl border bg-card px-3 text-sm">{keys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
      </div>
      <p className="rounded-xl bg-secondary/60 p-3 text-xs leading-6 text-muted-foreground"><span className="font-medium text-foreground">Built-in wording: </span>{CONTENT_DEFAULTS[page]?.[key] ?? "—"}</p>
      <textarea aria-label="Page wording" value={value} onChange={(e) => setValue(e.target.value)} rows={3} placeholder="Write this sentence in the chosen language…" className="w-full rounded-xl border bg-card p-3 text-sm" />
      <Button type="submit" className="w-fit"><FileText />Save wording</Button>
    </form>
    <div className="divide-y rounded-2xl border bg-card">{mine.length ? mine.map((r) => <div key={`${r.locale}-${r.page_key}-${r.text_key}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="min-w-0"><span className="text-xs text-muted-foreground">{r.text_key}</span><br /><strong>{r.text_value}</strong></span>
      <Button size="sm" variant="ghost" aria-label={`Remove ${r.text_key}`} onClick={async () => { await remove({ data: { locale: r.locale, page: r.page_key, key: r.text_key } }); await qc.invalidateQueries(); }}><Trash2 /></Button>
    </div>) : <p className="px-4 py-4 text-sm text-muted-foreground">No written wording for this page and language yet.</p>}</div>
  </Section>;
}

/* ------------------------------- activity log ------------------------------- */

export function ActivityLog() {
  const load = useServerFn(adminActivityLog);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-activity"], queryFn: () => load() });
  return <Section title="Activity log" hint="Every change made from this page, with who made it and when. Nothing here can be edited or removed.">
    {!data.length && !isLoading && <EmptyState title="Nothing recorded yet" text="Maintainer changes will appear here." />}
    <div className="divide-y rounded-2xl border bg-card">{data.slice(0, 60).map((r) => <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
        <span className="font-medium">{r.action.replace(/_/g, " ")}</span>
        {r.target && <span className="truncate text-xs text-muted-foreground">{r.target}</span>}
      </span>
      <span className="text-xs text-muted-foreground">{r.actor_email ?? "unknown"} · {when(r.created_at)}{r.detail ? ` · ${r.detail}` : ""}</span>
    </div>)}</div>
  </Section>;
}

export function AdminSections() {
  return <div className="space-y-14">
    <OverviewNumbers />
    <SupportInbox />
    <DeletionQueue />
    <AccountsPanel />
    <ScanLog />
    <ReminderCentre />
    <BulkImport />
    <TranslationEditor />
    <PageTextEditor />
    <ActivityLog />
    <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldAlert className="size-4" /> Every change here is checked against your maintainer role on the server.</p>
  </div>;
}
