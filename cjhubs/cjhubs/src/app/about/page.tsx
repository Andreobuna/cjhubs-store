import type { Metadata } from "next";
import { ShieldCheck, Truck, Wrench, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Why CJ Hubs",
  description: "Learn how CJ Hubs curates, ships and supports gift ideas and everyday products.",
};

const FAQS = [
  { q: "How long does delivery take?", a: "Most orders ship within 2–4 business days and arrive within 3–10 days depending on your location." },
  { q: "Can I send a gift straight to someone else?", a: "Yes — at checkout, enter the recipient's shipping address. We can include a gift note on request." },
  { q: "What's covered under returns?", a: "Unopened items can be returned within 14 days of delivery. Personalized or perishable items may not be eligible — check the product page." },
  { q: "Do you ship nationwide?", a: "Yes, with tracked delivery to every state, and international shipping available on select items." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-text">Why CJ Hubs</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        CJ Hubs brings together thoughtfully chosen gift ideas and everyday products &
        accessories — all in one premium shopping destination. Every item on our platform is
        hand-picked for quality and craftsmanship, whether you're shopping for yourself or for
        someone you love.
      </p>

      <div id="installation" className="mt-12 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <Truck className="text-solar-500" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Shipping & delivery</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We ship nationwide with tracked delivery. Sending a gift? Add the recipient's address at
          checkout and we'll take care of the rest.
        </p>
      </div>

      <div id="warranty" className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-solar-500" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Returns</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Unopened items can be returned within 14 days of delivery. Every product page lists any
          exceptions specific to that item — personalized and perishable goods are typically final sale.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <Wrench className="text-solar-500" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Curated, not dumped</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We hand-pick every listing for quality and craftsmanship rather than filling the catalog
          with anything and everything — so browsing stays enjoyable and every purchase feels considered.
        </p>
      </div>

      <div id="faq" className="mt-12">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-solar-500" size={22} />
          <h2 className="font-display text-lg font-semibold text-text">Frequently asked questions</h2>
        </div>
        <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
          {FAQS.map((f) => (
            <div key={f.q} className="p-5">
              <h3 className="text-sm font-semibold text-text">{f.q}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
