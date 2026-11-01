import { Link } from "@tanstack/react-router";

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Your Skin Story home">
      <span className="grid size-9 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">S</span>
      <span className="font-display text-2xl leading-none">Your Skin <span className="text-rose">Story</span></span>
    </Link>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>Cosmetic estimates for personal tracking only. Your Skin Story is not a medical device and does not diagnose, treat or prevent any condition.</p>;
}