import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/skin-story-logo.png.asset.json";

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Skin Twin AI home">
      <img src={logoAsset.url} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full" />
      <span className="font-display text-2xl leading-none">Your Skin <span className="text-rose">Story</span></span>
    </Link>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>Cosmetic estimates for personal tracking only. Skin Twin AI is not a medical device and does not diagnose, treat or prevent any condition.</p>;
}
