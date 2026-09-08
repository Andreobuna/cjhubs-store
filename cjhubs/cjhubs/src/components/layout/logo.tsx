import clsx from "clsx";

/**
 * CJ Hubs brand mark: a navy hexagon (the "hub") with three gold nodes
 * orbiting a central gold gem, connected by thin gold spokes — reads as a
 * shopping/gift hub bringing multiple things together in one place. Pure
 * SVG so it's crisp at any size and adapts via currentColor for light/dark
 * contexts.
 */
export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5 select-none", className)}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="20,2 35,11 35,29 20,38 5,29 5,11" className="fill-brand-500" />
        <polygon
          points="20,2 35,11 35,29 20,38 5,29 5,11"
          fill="none"
          className="stroke-solar-400"
          strokeWidth="0.75"
          strokeOpacity="0.5"
        />
        <g className="stroke-solar-400" strokeWidth="1.4" strokeLinecap="round">
          <line x1="20" y1="20" x2="20" y2="11" />
          <line x1="20" y1="20" x2="28" y2="24.5" />
          <line x1="20" y1="20" x2="12" y2="24.5" />
        </g>
        <circle cx="20" cy="11" r="3" className="fill-solar-400" />
        <circle cx="28" cy="24.5" r="3" className="fill-solar-400" />
        <circle cx="12" cy="24.5" r="3" className="fill-solar-400" />
        <circle cx="20" cy="20" r="5.5" className="fill-surface" />
        <circle cx="20" cy="20" r="4.4" className="fill-solar-500" />
      </svg>
      {!mark && (
        <span className="font-display text-lg font-semibold tracking-tight text-text">
          CJ<span className="text-solar-500">Hubs</span>
        </span>
      )}
    </span>
  );
}
