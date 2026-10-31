import { Cake, CloudRain, Gem, Gift, HeartHandshake, Infinity as InfinityIcon, Mail, Puzzle, Sparkles, type LucideIcon } from "lucide-react";

/** Line icon per template, used in nav chips, cards and the builder header. */
const ICONS: Record<string, LucideIcon> = {
  birthday: Cake,
  "love-notes": Mail,
  proposal: Gem,
  anniversary: InfinityIcon,
  "best-friend": HeartHandshake,
  apology: CloudRain,
  puzzle: Puzzle,
  diwali: Sparkles,
};

export function TemplateIcon({ id, size = 16, className }: { id: string; size?: number; className?: string }) {
  const Icon = ICONS[id] ?? Gift;
  return <Icon size={size} className={className} strokeWidth={1.8} aria-hidden />;
}
