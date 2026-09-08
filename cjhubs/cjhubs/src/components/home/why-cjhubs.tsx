import { BadgeCheck, HeadphonesIcon, ShieldCheck, Truck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Curated, not dumped",
    body: "Every item is hand-picked for quality and craftsmanship — not a generic dropship catalog.",
  },
  {
    icon: BadgeCheck,
    title: "Real product photos",
    body: "What you see is what ships — accurate photos and descriptions on every listing.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    body: "Tracked shipping on every order, with clear timelines from checkout to your door.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 support",
    body: "Questions about an order, a gift, or a return — a real person answers, any time.",
  },
];

export function WhyCJHubs() {
  return (
    <section className="relative border-y border-border bg-surface/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why CJ Hubs" title="One hub, curated with care" align="center" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <div key={r.title} className="shine-sweep rounded-2xl border border-border bg-surface p-6 text-center transition hover:border-solar-500/40">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                <r.icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-text">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
