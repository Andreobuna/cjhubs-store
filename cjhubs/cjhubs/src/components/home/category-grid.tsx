import Link from "next/link";
import { Gift, ShoppingBag } from "lucide-react";
import { SectionHeading } from "./section-heading";

const ICONS: Record<string, any> = {
  "gift-ideas": Gift,
  "products-accessories": ShoppingBag,
};

const BLURBS: Record<string, string> = {
  "gift-ideas": "Curated gifts for birthdays, anniversaries, and every special moment.",
  "products-accessories": "Everyday essentials and accessories built for quality and style.",
};

export function CategoryGrid({ categories }: { categories: { name: string; slug: string; _count?: { products: number } }[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Where to start"
        title="Shop by category"
        description="Two simple ways to shop — pick a lane and dive straight into the collection."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = ICONS[cat.slug] || Gift;
          return (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="shine-sweep group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all hover:-translate-y-1 hover:border-solar-500/50 hover:shadow-glow sm:p-10"
            >
              <div className="solar-grid pointer-events-none absolute inset-0 opacity-20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 transition-colors group-hover:bg-solar-500 group-hover:text-brand-950">
                <Icon size={26} />
              </div>
              <h3 className="relative mt-6 font-display text-xl font-semibold text-text">{cat.name}</h3>
              <p className="relative mt-2 max-w-xs text-sm leading-relaxed text-muted">
                {BLURBS[cat.slug] ?? cat.name}
              </p>
              {typeof cat._count?.products === "number" && (
                <p className="relative mt-4 text-xs font-medium text-solar-500">
                  {cat._count.products} products →
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
