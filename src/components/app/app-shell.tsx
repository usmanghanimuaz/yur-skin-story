import type { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Camera, History, GitCompareArrows, FlaskConical, Users, Settings, Download, ShieldCheck, LogOut, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Brand, Disclaimer } from "./brand";
import { ThemeToggle } from "./public-shell";
import { supabase } from "@/integrations/supabase/client";
import { ActivePersonProvider, useActivePerson } from "@/hooks/use-active-person";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/history", label: "My check-ins", icon: History },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/products", label: "My routine", icon: FlaskConical },
] as const;

export function AppShell({ children, sample = false }: { children: ReactNode; sample?: boolean }) {
  if (sample) return <ShellBody sample>{children}</ShellBody>;
  return <ActivePersonProvider><ShellBody>{children}</ShellBody></ActivePersonProvider>;
}

function ShellBody({ children, sample }: { children: ReactNode; sample?: boolean }) {
  const { active, people, setActiveId } = useActivePerson();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };
  return <div className="min-h-screen">
    {sample && <div className="flex flex-wrap items-center justify-center gap-2 bg-secondary px-4 py-2 text-xs text-secondary-foreground"><SparkleDot /> Sample experience · Illustrative results, not your skin analysis <Link to="/register" className="font-semibold underline">Create an account</Link></div>}
    <header className="border-b bg-card"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8"><Brand /><div className="flex items-center gap-2"><ThemeToggle />{sample ? <Button asChild variant="outline" className="rounded-full"><Link to="/register">Get started</Link></Button> : <><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="rounded-full"><span className="grid size-7 place-items-center rounded-full bg-secondary text-xs">{active?.name?.[0] ?? "M"}</span><span className="hidden sm:inline">{active?.name ?? "My account"}</span><ChevronDown className="size-3" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to="/manage-profiles"><Users className="size-4" /> Manage people</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/profile"><Settings className="size-4" /> Skin profile</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/settings"><Settings className="size-4" /> Settings</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/export-data"><Download className="size-4" /> Export data</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/security-log"><ShieldCheck className="size-4" /> Security log</Link></DropdownMenuItem><DropdownMenuItem onClick={signOut}><LogOut className="size-4" /> Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Button asChild className="rounded-full"><Link to="/check-in"><Plus /><span className="hidden sm:inline">New check-in</span></Link></Button></>}</div></div></header>
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b py-4"><nav className="flex flex-wrap items-center gap-1 sm:gap-3">{nav.map(({ to, label, icon: Icon }) => <Button key={to} asChild variant="ghost" className={`rounded-full px-3 text-xs sm:text-sm ${location.pathname === to || sample && to === "/dashboard" ? "bg-secondary text-primary" : "text-muted-foreground"}`}><Link to={sample ? "/demo" : to}><Icon className="size-4" /><span>{label}</span></Link></Button>)}</nav>{!sample && people.length > 0 && <label className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="size-4" /><select className="max-w-32 bg-transparent text-foreground outline-none" value={active?.id ?? ""} onChange={(e) => setActiveId(e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}</div>
      <main className="py-8 sm:py-10">{children}</main>
      <footer className="mb-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6"><Disclaimer className="max-w-xl" /><Link to="/guide" className="text-xs text-muted-foreground">Need a little help?</Link></footer>
    </div>
  </div>;
}
function SparkleDot() { return <span className="size-1.5 rounded-full bg-rose" />; }