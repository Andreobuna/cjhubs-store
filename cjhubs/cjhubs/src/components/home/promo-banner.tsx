import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="energy-beam gradient-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-6 py-14 text-center sm:px-16">
        <div className="solar-grid absolute inset-0 opacity-30" />
        <div className="relative">
          <p className="text-sm font-medium text-solar-400">Limited time</p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
            Special offers across gifts and everyday essentials
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-brand-100/80">
            Handpicked deals on curated gift ideas and everyday products & accessories — while stock lasts.
          </p>
          <ButtonLink href="/products?offer=1" size="lg" className="mt-7 bg-solar-500 text-brand-950 hover:bg-solar-400">
            Shop special offers <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
