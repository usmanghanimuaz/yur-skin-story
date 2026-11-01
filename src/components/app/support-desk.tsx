import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "./dashboard";
import { SUPPORT_EMAIL } from "@/lib/site";
import { canStartSupportThread, supportDraftError } from "@/lib/support";
import { mySupportMessages, submitSupportMessage } from "@/lib/admin.functions";

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");

export function SupportDesk() {
  const qc = useQueryClient();
  const load = useServerFn(mySupportMessages);
  const send = useServerFn(submitSupportMessage);
  const { data = [], isLoading } = useQuery({ queryKey: ["support-thread"], queryFn: () => load() });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const allowed = canStartSupportThread(data);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bad = supportDraftError({ subject, body });
    setProblem(bad ?? "");
    if (bad) return;
    setBusy(true);
    const out = await send({ data: { subject, body } }).catch((err: unknown) => err);
    setBusy(false);
    if (out instanceof Error) { setProblem(out.message); return; }
    toast.success("Your message is with us. We reply within two working days.");
    setSubject(""); setBody("");
    await qc.invalidateQueries();
  };
  return <div className="max-w-2xl space-y-10">
    <div>
      <h1 className="text-4xl sm:text-5xl">Message us.</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">Ask about your account, a photo, a deletion or an export. We aim to reply within two working days. You can also email <a className="font-medium text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </div>

    {allowed ? <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="e.g. My photo was rejected" className="h-11 rounded-xl bg-card" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">How can we help?</Label>
        <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} rows={6} placeholder="Tell us what happened and when." className="w-full rounded-xl border bg-card p-3 text-sm" />
      </div>
      {problem && <p role="alert" className="rounded-xl border border-destructive/30 bg-card p-3 text-sm text-destructive">{problem}</p>}
      <Button type="submit" disabled={busy} className="rounded-full">{busy ? <Loader2 className="animate-spin" /> : <Send />}{busy ? "Sending…" : "Send message"}</Button>
    </form> : <p className="rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">You already have 3 messages waiting for a reply. We answer within two working days.</p>}

    <section>
      <h2 className="mb-4 text-2xl">Your messages</h2>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !data.length ? <EmptyState title="Nothing sent yet" text="Your messages and our replies will appear here." /> :
        <div className="space-y-3">{data.map((m) => <div key={m.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{m.subject}</p>
            <span className="rounded-full bg-secondary px-2 py-1 text-[11px] capitalize text-muted-foreground">{m.status}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{when(m.created_at)}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6">{m.body}</p>
          {m.admin_reply && <p className="mt-3 rounded-xl bg-secondary p-3 text-sm leading-6"><span className="text-xs text-muted-foreground">Our reply · {when(m.replied_at)}</span><br />{m.admin_reply}</p>}
        </div>)}</div>}
    </section>
  </div>;
}
