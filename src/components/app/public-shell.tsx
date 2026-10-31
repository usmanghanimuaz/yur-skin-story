import { useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowUpRight, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand, Disclaimer } from "./brand";
import { supabase } from "@/integrations/supabase/client";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { const d = localStorage.getItem("skintwin-theme") === "dark"; setDark(d); document.documentElement.classList.toggle("dark", d); }, []);
  return <Button variant="ghost" size="icon" aria-label={dark ? "Light theme" : "Dark theme"} title={dark ? "Light theme" : "Dark theme"} onClick={() => { setDark(!dark); document.documentElement.classList.toggle("dark", !dark); localStorage.setItem("skintwin-theme", !dark ? "dark" : "light"); }}>{dark ? <Sun /> : <Moon />}</Button>;
}

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user))); }, []);
  return <div className="min-h-screen">
    <header className="relative z-30 border-b bg-background/95">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link to="/how-it-works" className="text-muted-foreground hover:text-primary">How it works</Link>
          <Link to="/guide" className="text-muted-foreground hover:text-primary">Photo guide</Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-primary">Your privacy</Link>
          <ThemeToggle />
          <Link to={signedIn ? "/dashboard" : "/login"} className="font-medium">{signedIn ? "My dashboard" : "Log in"}</Link>
          <Button asChild className="rounded-full px-5"><Link to={signedIn ? "/check-in" : "/register"}>{signedIn ? "New check-in" : "Start your journey"}<ArrowUpRight /></Link></Button>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav className="grid gap-4 border-t px-5 py-6 md:hidden"><Link to="/how-it-works">How it works</Link><Link to="/guide">Photo guide</Link><Link to="/privacy">Privacy</Link><Link to="/login">Log in</Link><Button asChild><Link to="/register">Start your journey</Link></Button></nav>}
    </header>
    <main>{children}</main>
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_1.5fr]">
        <div><Brand /><p className="mt-4 text-sm text-muted-foreground">A little insight. A little care. A healthier-looking you.</p><Disclaimer className="mt-4 max-w-sm" /></div>
        <div className="flex flex-wrap justify-start gap-x-7 gap-y-4 text-xs text-muted-foreground md:justify-end">
          <Link to="/how-it-works">How it works</Link><Link to="/guide">Photo guide</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/consent">Consent</Link><Link to="/photo-retention">Photo retention</Link><Link to="/cookies">Cookies</Link><Link to="/security">Security</Link><Link to="/your-data">Your data</Link><Link to="/accessibility">Accessibility</Link><Link to="/medical-disclaimer">Medical disclaimer</Link><Link to="/support">Support</Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t px-5 py-5 text-xs text-muted-foreground sm:px-8"><span>© 2026 SkinTwin AI. All rights reserved.</span><span>Made for your skin. Built around your privacy.</span><span>Built by 321 Design House</span></div>
    </footer>
  </div>;
}