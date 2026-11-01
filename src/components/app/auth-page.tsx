import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand, Disclaimer } from "./brand";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { logActivity } from "@/lib/data";

export function googleMessage(raw?: string | null): string {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("access_denied") || m.includes("denied") || m.includes("cancel")) return "Google sign-in was cancelled. Choose an account and allow access to continue.";
  if (m.includes("popup") || m.includes("closed")) return "The Google window was closed or blocked before sign-in finished. Allow pop-ups for this site and try again.";
  if (m.includes("network") || m.includes("fetch")) return "We couldn't reach Google. Check your internet connection and try again.";
  return "Google sign-in didn't work this time. Please try again, or use your email and password instead.";
}

export type AuthMode = "login" | "register" | "forgot" | "reset";
export function AuthPage({ mode }: { mode: AuthMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [message, setMessage] = useState("");
  const [recovery, setRecovery] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (mode === "reset") {
      const recoveryHash = window.location.hash.includes("type=recovery") || sessionStorage.getItem("skintwin-recovery") === "yes";
      setRecovery(recoveryHash);
      if (recoveryHash) sessionStorage.setItem("skintwin-recovery", "yes");
    }
  }, [mode]);
  const destination = () => {
    const requested = new URLSearchParams(window.location.search).get("returnTo") ?? sessionStorage.getItem("skintwin-return");
    return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  };
  useEffect(() => {
    if (mode !== "login" && mode !== "register") return;
    let done = false;
    const go = async () => {
      if (done) return; done = true;
      sessionStorage.removeItem("skintwin-google-pending");
      const target = destination(); sessionStorage.removeItem("skintwin-return");
      if (sessionStorage.getItem("skintwin-signin-logged") !== "yes") { await logActivity("sign_in", "Signed in"); sessionStorage.setItem("skintwin-signin-logged", "yes"); }
      await navigate({ to: target });
    };
    // Provider errors come back in the URL query or hash.
    const params = new URLSearchParams(window.location.search + "&" + window.location.hash.replace(/^#/, ""));
    const urlError = params.get("error_description") ?? params.get("error");
    if (urlError) { sessionStorage.removeItem("skintwin-google-pending"); setGoogleError(googleMessage(urlError)); }
    // Returning from Google: the session lands after redirect, so send signed-in users onward.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { void go(); return; }
      const pending = Number(sessionStorage.getItem("skintwin-google-pending") ?? 0);
      if (pending && !urlError) {
        // Give a late session a moment to arrive before telling the user it failed.
        setTimeout(() => { if (done) return; sessionStorage.removeItem("skintwin-google-pending"); if (Date.now() - pending < 10 * 60000) setGoogleError("Google sign-in didn't finish, so you're back here. This can happen if the Google window was closed or your browser blocked cookies or pop-ups."); }, 2500);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => { if (event === "SIGNED_IN" && session) void go(); });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  const finishSignIn = async () => { await logActivity("sign_in", "Signed in"); sessionStorage.setItem("skintwin-signin-logged", "yes"); await navigate({ to: destination() }); };
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setMessage("");
    if ((mode === "register" || mode === "reset") && password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      if (mode === "forgot") {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        setMessage("If an account exists, you'll receive a password reset email. Check your inbox and spam folder.");
      } else if (mode === "reset") {
        if (!recovery) throw new Error("Open the reset link from your email to set a new password.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        sessionStorage.removeItem("skintwin-recovery"); setMessage("Your password has been updated. You can now sign in.");
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: name } } });
        if (error) throw error;
        if (data.session) await finishSignIn();
        else setMessage("Check your email to confirm your account. Then sign in to meet your skin story.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await finishSignIn();
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  const google = async () => {
    setBusy(true); setError(""); setGoogleError("");
    sessionStorage.setItem("skintwin-return", destination());
    sessionStorage.setItem("skintwin-google-pending", String(Date.now()));
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth`, extraParams: { prompt: "select_account" } });
      if (result.error) { sessionStorage.removeItem("skintwin-google-pending"); setGoogleError(googleMessage(result.error.message)); setBusy(false); return; }
      if (!result.redirected) { sessionStorage.removeItem("skintwin-google-pending"); await finishSignIn(); }
    } catch (err) {
      sessionStorage.removeItem("skintwin-google-pending");
      setGoogleError(googleMessage(err instanceof Error ? err.message : undefined)); setBusy(false);
    }
  };
  const headings = { login: ["Welcome back.", "Your skin story is right where you left it."], register: ["Meet your skin story.", "A little insight is the start of a little progress."], forgot: ["Let's get you back in.", "We'll send a secure link to reset your password."], reset: ["A fresh start.", "Choose a new password for your account."] };
  return <div className="flex min-h-screen flex-col"><header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-7 sm:px-8"><Brand /><Link to="/guide" className="text-sm text-muted-foreground">Your Skin Story guide <ArrowUpRight className="ml-1 inline size-3" /></Link></header><main className="mx-auto w-full max-w-md flex-1 px-5 py-10"><Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-3" /> Back to home</Link><h1 className="text-5xl">{headings[mode][0]}</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">{headings[mode][1]}</p>
    {message ? <div className="mt-8 rounded-2xl border bg-secondary/60 p-6"><Mail className="mb-3 size-6 text-primary" /><p className="text-sm leading-7" role="status">{message}</p><Button asChild variant="link" className="mt-3 px-0"><Link to="/login">Back to sign in <ArrowUpRight /></Link></Button></div> : <form className="mt-8 space-y-5" onSubmit={submit}>
      {mode === "register" && <div className="space-y-2"><Label htmlFor="name">Your name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="name" className="h-12 rounded-xl bg-card" /></div>}
      {mode !== "reset" && <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" placeholder="you@example.com" className="h-12 rounded-xl bg-card" /></div>}
      {mode !== "forgot" && <div className="space-y-2"><div className="flex justify-between"><Label htmlFor="password">{mode === "reset" ? "New password" : "Password"}</Label>{mode === "login" && <Link to="/forgot-password" className="text-xs text-muted-foreground">Forgot password?</Link>}</div><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} className="h-12 rounded-xl bg-card" /></div>}
      {(mode === "register" || mode === "reset") && <div className="space-y-2"><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} maxLength={128} autoComplete="new-password" className="h-12 rounded-xl bg-card" /></div>}
      {mode === "register" && <label className="flex items-start gap-2 text-xs leading-6 text-muted-foreground"><input type="checkbox" required className="mt-1.5" /><span>I agree to the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>. This is cosmetic tracking, not medical advice.</span></label>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy || mode === "reset" && !recovery} className="h-12 w-full rounded-full">{busy ? <Loader2 className="animate-spin" /> : <>{mode === "login" ? "Log in" : mode === "register" ? "Create my account" : mode === "forgot" ? "Send reset link" : "Save new password"}<ArrowUpRight /></>}</Button>
      {googleError && (mode === "login" || mode === "register") && <div role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4"><p className="text-sm font-medium text-destructive">Google sign-in didn't complete</p><p className="mt-1 text-xs leading-6 text-muted-foreground">{googleError}</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" className="rounded-full" disabled={busy} onClick={google}>Try Google again</Button><Button type="button" size="sm" variant="ghost" className="rounded-full" onClick={() => { setGoogleError(""); document.getElementById("email")?.focus(); }}>Use email instead</Button></div></div>}{(mode === "login" || mode === "register") && <><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div><Button type="button" variant="outline" className="h-12 w-full rounded-full bg-card" disabled={busy} onClick={google}><span className="text-base font-semibold">G</span> Continue with Google</Button><p className="text-center text-xs text-muted-foreground">{mode === "login" ? "New to Your Skin Story?" : "Already have an account?"} <Link to={mode === "login" ? "/register" : "/login"} className="font-medium text-primary underline">{mode === "login" ? "Start your journey" : "Log in"}</Link></p></>}
    </form>}
    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4" /> Private by design. Always.</div></main><footer className="mx-auto max-w-xl px-5 py-8 text-center"><Disclaimer /></footer></div>;
}