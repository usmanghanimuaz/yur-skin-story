import { Link } from "@tanstack/react-router";

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="SkinTwin AI home">
      <span className="grid size-9 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">S</span>
      <span className="font-display text-2xl leading-none">SkinTwin <span className="text-rose">AI</span></span>
    </Link>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>Cosmetic estimates for personal tracking only. SkinTwin is not a medical device and does not diagnose, treat or prevent any condition.</p>;
}