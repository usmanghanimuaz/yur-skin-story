import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { logAdminAction } from "@/lib/admin.functions";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActivePerson } from "@/hooks/use-active-person";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { priceLabel } from "@/lib/catalogue";
import { EmptyState } from "./dashboard";

const catalogueOptions = { queryKey: ["catalogue"], queryFn: async () => {
  const { data, error } = await supabase.from("catalogue_products").select("*, product_availability(*)").order("name");
  if (error) throw error;
  return data;
} };

export function Catalogue() {
  const { active } = useActivePerson();
  const { data = [], isLoading } = useQuery(catalogueOptions);
  const [country, setCountry] = useState("");
  const c = country || active?.country || "";
  const items = data.filter((p) => p.status !== "retired");
  return <>
    <h1 className="mb-4 text-4xl sm:text-5xl">Products to explore.</h1>
    <p className="mb-6 max-w-2xl text-sm leading-7 text-muted-foreground">Ideas matched by ingredient, not endorsements. Prices are shown only when verified within the last 30 days; anything else is marked unverified.</p>
    <label className="mb-6 flex max-w-xs flex-col gap-2 text-xs text-muted-foreground">Country<Input value={c} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Pakistan" className="h-11 rounded-xl bg-card" /></label>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !items.length ? <EmptyState title="The catalogue is empty" text="No catalogue products have been added yet. Earlier catalogue records have not been imported." /> :
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((p) => {
        const avail = p.product_availability.filter((a) => !c || a.country.toLowerCase() === c.toLowerCase());
        return <div key={p.id} className="rounded-2xl border bg-card p-5">
          <p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p>
          <h2 className="mt-1 text-2xl">{p.name}</h2>
          {p.actives && <p className="mt-2 text-xs">Actives: {p.actives}</p>}
          {p.status === "seed_pending_review" && <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px]"><ShieldAlert className="size-3" /> Pending expert review</p>}
          {active?.pregnancy && p.pregnancy_safe !== true && <p className="mt-2 text-xs text-destructive">Check with a clinician before use during pregnancy.</p>}
          <ul className="mt-4 space-y-1 text-xs">{avail.length ? avail.map((a) => <li key={a.id} className="flex justify-between gap-2"><span>{a.retailer || a.country}</span><span className="text-muted-foreground">{priceLabel(a)}</span></li>) : <li className="text-muted-foreground">No availability listed{c ? ` for ${c}` : ""}.</li>}</ul>
        </div>;
      })}</div>}
  </>;
}

export function AdminPanel() {
  const qc = useQueryClient();
  const record = useServerFn(logAdminAction);
  const { data: products = [] } = useQuery(catalogueOptions);
  const { data: evidence = [] } = useQuery({ queryKey: ["evidence"], queryFn: async () => { const { data, error } = await supabase.from("evidence_entries").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  const run = async (fn: () => PromiseLike<{ error: unknown }>, ok: string, note?: { action: string; target?: string; detail?: string }) => {
    const { error } = await fn();
    if (error) { toast.error((error as Error).message ?? "Not allowed"); return; }
    toast.success(ok);
    if (note) await record({ data: { action: note.action, target: note.target ?? "", detail: note.detail ?? "" } }).catch(() => {});
    await qc.invalidateQueries();
  };
  const addProduct = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const form = e.currentTarget; void run(() => supabase.from("catalogue_products").insert({ name: String(f.get("name")), brand: String(f.get("brand")), category: String(f.get("category")), actives: String(f.get("actives")), pregnancy_safe: f.get("preg") === "on" ? true : null }), "Product added", { action: "catalogue_product_added", target: String(f.get("name")) }).then(() => form.reset()); };
  const addAvail = (e: FormEvent<HTMLFormElement>, id: string) => { e.preventDefault(); const f = new FormData(e.currentTarget); const price = String(f.get("price")); const verified = f.get("verified") === "on"; void run(() => supabase.from("product_availability").insert({ product_id: id, country: String(f.get("country")), retailer: String(f.get("retailer")), price: price ? Number(price) : null, currency: String(f.get("currency")) || null, price_verified_at: verified && price ? new Date().toISOString() : null, url: String(f.get("url")) || null }), "Availability added", { action: "listing_added", target: `${String(f.get("country"))} · ${String(f.get("retailer"))}` }); };
  const addEvidence = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(() => supabase.from("evidence_entries").insert({ ingredient: String(f.get("ingredient")), concern: String(f.get("concern")), summary: String(f.get("summary")), source_url: String(f.get("source")) || null }), "Evidence added", { action: "evidence_added", target: String(f.get("ingredient")) }); };
  return <div className="space-y-12">
    <h1 className="text-4xl sm:text-5xl">Catalogue & evidence.</h1>
    <p className="text-sm text-muted-foreground">Admin only. Every change is checked by the server against your admin role.</p>
    <section><h2 className="mb-4 text-3xl">Catalogue products ({products.length})</h2>
      <form onSubmit={addProduct} className="mb-6 grid gap-3 sm:grid-cols-5"><Input name="name" placeholder="Name" required /><Input name="brand" placeholder="Brand" /><Input name="category" placeholder="Category" defaultValue="serum" /><Input name="actives" placeholder="Actives" /><label className="flex items-center gap-2 text-xs"><input type="checkbox" name="preg" />Pregnancy-safe (reviewed)</label><Button className="sm:col-span-5 sm:w-fit"><Plus />Add product</Button></form>
      <div className="space-y-3">{products.map((p) => <details key={p.id} className="rounded-2xl border bg-card p-4"><summary className="cursor-pointer text-sm">{p.name} · <span className="text-muted-foreground">{p.status}</span> · {p.product_availability.length} listings</summary>
        <div className="mt-3 flex flex-wrap gap-2">{(["seed_pending_review", "reviewed", "retired"] as const).map((s) => <Button key={s} size="sm" variant={p.status === s ? "default" : "outline"} onClick={() => void run(() => supabase.from("catalogue_products").update({ status: s }).eq("id", p.id), "Status updated", { action: "product_status_changed", target: p.name, detail: s })}>{s}</Button>)}<Button size="sm" variant="ghost" aria-label="Delete product" onClick={() => confirm("Delete product?") && void run(() => supabase.from("catalogue_products").delete().eq("id", p.id), "Deleted", { action: "product_deleted", target: p.name })}><Trash2 /></Button></div>
        <ul className="mt-3 space-y-1 text-xs">{p.product_availability.map((a) => <li key={a.id} className="flex justify-between"><span>{a.country} · {a.retailer}</span><span>{priceLabel(a)} <button className="ml-2 underline" onClick={() => void run(() => supabase.from("product_availability").delete().eq("id", a.id), "Removed", { action: "listing_removed", target: `${a.country} · ${a.retailer}` })}>remove</button></span></li>)}</ul>
        <form onSubmit={(e) => addAvail(e, p.id)} className="mt-3 grid gap-2 sm:grid-cols-6"><Input name="country" placeholder="Country" required /><Input name="retailer" placeholder="Retailer" /><Input name="price" type="number" step="0.01" placeholder="Price" /><Input name="currency" placeholder="PKR" maxLength={3} /><Input name="url" placeholder="https://…" /><label className="flex items-center gap-1 text-xs"><input type="checkbox" name="verified" />Price checked today</label><Button size="sm" className="w-fit">Add listing</Button></form>
      </details>)}</div>
    </section>
    <section><h2 className="mb-4 text-3xl">Evidence entries ({evidence.length})</h2>
      <form onSubmit={addEvidence} className="mb-6 grid gap-3 sm:grid-cols-2"><Input name="ingredient" placeholder="Ingredient" required /><Input name="concern" placeholder="Concern (e.g. redness)" /><Input name="summary" placeholder="Summary" className="sm:col-span-2" /><Input name="source" placeholder="https://source" /><Button className="w-fit"><Plus />Add evidence</Button></form>
      <div className="divide-y">{evidence.map((ev) => <div key={ev.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span>{ev.ingredient} — {ev.concern} <span className="text-xs text-muted-foreground">({ev.status})</span></span><span className="flex gap-2">{ev.status !== "reviewed" && <Button size="sm" variant="outline" onClick={() => void run(() => supabase.from("evidence_entries").update({ status: "reviewed", reviewed_at: new Date().toISOString() }).eq("id", ev.id), "Marked reviewed", { action: "evidence_reviewed", target: ev.ingredient })}>Mark reviewed</Button>}<Button size="sm" variant="ghost" aria-label="Delete evidence" onClick={() => void run(() => supabase.from("evidence_entries").delete().eq("id", ev.id), "Deleted", { action: "evidence_deleted", target: ev.ingredient })}><Trash2 /></Button></span></div>)}</div>
    </section>
  </div>;
}
