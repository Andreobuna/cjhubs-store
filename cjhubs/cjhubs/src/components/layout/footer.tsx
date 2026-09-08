import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "@/components/home/newsletter-form";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Gift Ideas", href: "/products?category=gift-ideas" },
      { label: "Products & Accessories", href: "/products?category=products-accessories" },
      { label: "Featured", href: "/products?featured=true" },
      { label: "Special Offers", href: "/products?offer=1" },
      { label: "New Arrivals", href: "/products?sort=newest" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why CJ Hubs", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Track an order", href: "/account" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & delivery", href: "/about#installation" },
      { label: "Returns", href: "/about#warranty" },
      { label: "FAQs", href: "/about#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface">
      <div className="solar-grid pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr,1fr,1fr,1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Thoughtfully chosen gift ideas and everyday products & accessories — all in one
              premium shopping destination, curated for quality.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Follow CJ Hubs"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-brand-400/60 hover:text-brand-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-text">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted transition hover:text-brand-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 gradient-border rounded-2xl bg-surface-2/60 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h4 className="font-display text-lg font-semibold text-text">Stay in the loop</h4>
              <p className="mt-1 text-sm text-muted">
                Get early access to new arrivals and special offers — no spam.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} CJ Hubs. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-text">Privacy</Link>
            <Link href="/terms" className="hover:text-text">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
