import type { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, History, GitCompareArrows, FlaskConical, Users, Settings, Download, ShieldCheck, LogOut, Plus, ChevronDown, BookOpen, Wrench, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Brand } from "./brand";
import { ThemeToggle } from "./public-shell";
import { supabase } from "@/integrations/supabase/client";
import { ActivePersonProvider, useActivePerson } from "@/hooks/use-active-person";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { myRole } from "@/lib/skintwin.functions";

const nav = [
  { to: "/dashboard", key: "overview", icon: LayoutDashboard },
  { to: "/history", key: "checkins", icon: History },
  { to: "/compare", key: "compare", icon: GitCompareArrows },
  { to: "/products", key: "routine", icon: FlaskConical },
  { to: "/catalogue", key: "catalogue", icon: BookOpen },
] as const;

export function AppShell({ children, sample = false }: { children: ReactNode; sample?: boolean }) {
  if (sample) return <ShellBody sample>{children}</ShellBody>;
  return <ActivePersonProvider><ShellBody>{children}</ShellBody></ActivePersonProvider>;
}

export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();
  return <label className="flex items-center gap-1 text-xs text-muted-foreground"><Languages className="size-4" /><span className="sr-only">{t("language")}</span><select aria-label={t("language")} className="max-w-28 bg-transparent text-foreground outline-none" value={locale} onChange={(e) => { setLocale(e.target.value as Locale); void supabase.auth.getUser().then(({ data }) => data.user && supabase.from("profiles").update({ locale: e.target.value }).eq("user_id", data.user.id)); }}>{LOCALES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label>;
}

function ShellBody({ children, sample }: { children: ReactNode; sample?: boolean }) {
  const { active, people, setActiveId } = useActivePerson();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const roleFn = useServerFn(myRole);
  const { data: role } = useQuery({ queryKey: ["role"], queryFn: () => roleFn(), enabled: !sample });
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };
  return <div className="min-h-screen">
    {sample && <div className="flex flex-wrap items-center justify-center gap-2 bg-secondary px-4 py-2 text-xs text-secondary-foreground"><span className="size-1.5 rounded-full bg-rose" /> Sample experience · Illustrative results, not your skin analysis <Link to="/register" className="font-semibold underline">Create an account</Link></div>}
    <header className="border-b bg-card"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8"><Brand /><div className="flex items-center gap-2"><div className="hidden sm:block"><LanguageSelect /></div><ThemeToggle />{sample ? <Button asChild variant="outline" className="rounded-full"><Link to="/register">Get started</Link></Button> : <><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="rounded-full"><span className="grid size-7 place-items-center rounded-full bg-secondary text-xs">{active?.name?.[0] ?? "M"}</span><span className="hidden sm:inline">{active?.name ?? "My account"}</span><ChevronDown className="size-3" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
      <DropdownMenuItem asChild><Link to="/manage-profiles"><Users className="size-4" /> {t("managePeople")}</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/profile"><Settings className="size-4" /> {t("skinProfile")}</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/settings"><Settings className="size-4" /> {t("settings")}</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/export-data"><Download className="size-4" /> {t("export")}</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/security-log"><ShieldCheck className="size-4" /> {t("securityLog")}</Link></DropdownMenuItem>
      {role?.admin && <DropdownMenuItem asChild><Link to="/admin"><Wrench className="size-4" /> {t("admin")}</Link></DropdownMenuItem>}
      <DropdownMenuItem onClick={signOut}><LogOut className="size-4" /> {t("signOut")}</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu><Button asChild className="rounded-full"><Link to="/check-in"><Plus /><span className="hidden sm:inline">{t("newCheckin")}</span></Link></Button></>}</div></div></header>
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b py-4"><nav className="flex flex-wrap items-center gap-1 sm:gap-3">{nav.map(({ to, key, icon: Icon }) => <Button key={to} asChild variant="ghost" className={`rounded-full px-3 text-xs sm:text-sm ${location.pathname === to || sample && to === "/dashboard" ? "bg-secondary text-primary" : "text-muted-foreground"}`}><Link to={sample ? "/demo" : to}><Icon className="size-4" /><span>{t(key)}</span></Link></Button>)}</nav><div className="flex items-center gap-3"><div className="sm:hidden"><LanguageSelect /></div>{!sample && people.length > 0 && <label className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="size-4" /><select aria-label="Active person" className="max-w-32 bg-transparent text-foreground outline-none" value={active?.id ?? ""} onChange={(e) => setActiveId(e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}</div></div>
      <main className="py-8 sm:py-10">{children}</main>
      <footer className="mb-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6"><p className="max-w-xl text-xs leading-6 text-muted-foreground">{t("disclaimer")}</p><div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><Link to="/guide">{t("help")}</Link><span>© 2026 SkinTwin AI. All rights reserved.</span><span>Built by 321 Design House</span></div></footer>
    </div>
  </div>;
}
