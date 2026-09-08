import { StarRating } from "@/components/ui/star-rating";
import { SectionHeading } from "./section-heading";

const REVIEWS = [
  {
    name: "Adaeze O.",
    role: "Verified buyer, Lekki",
    quote:
      "Ordered a birthday gift set with two days' notice and it arrived beautifully packaged, right on time. It's now my go-to for last-minute gifts.",
    rating: 5,
  },
  {
    name: "Tunde B.",
    role: "Verified buyer, Ibadan",
    quote:
      "I compared a few shops before choosing CJ Hubs. The photos on the product pages actually matched what arrived, and support answered every question before I paid.",
    rating: 5,
  },
  {
    name: "Chiamaka N.",
    role: "Small business owner, Enugu",
    quote:
      "I've reordered the same accessory bundle three times now for staff gifts — solid build quality every time, and checkout is genuinely fast.",
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Customers" title="Trusted by homes and businesses nationwide" align="center" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="flex flex-col rounded-2xl border border-border bg-surface p-6">
            <StarRating rating={r.rating} size={15} />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text">"{r.quote}"</blockquote>
            <figcaption className="mt-5 border-t border-border pt-4 text-sm">
              <span className="font-medium text-text">{r.name}</span>
              <span className="block text-xs text-muted">{r.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
