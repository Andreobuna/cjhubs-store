import clsx from "clsx";
import Image from "next/image";

/**
 * CJ Hubs brand mark.
 */
export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/waw.jpg"
        alt="CJ Hubs Logo"
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 object-contain"
      />
      {!mark && (
        <span className="font-display text-lg font-semibold tracking-tight text-text">
          CJ<span className="text-solar-500">Hubs</span>
        </span>
      )}
    </span>
  );
}
