import clsx from "clsx";
import { motion } from "motion/react";

export function Background({ className }: { className?: string }) {
  const PROVINCES = [
    "ZUID-HOLLAND",
    "LUXEMBURG",
    "GELDERLAND",
    "OOST-VLAANDEREN",
    "NOORD-HOLLAND",
    "ZEELAND",
    "VLAAMS-BRABANT",
    "DRENTHE",
    "WALLONIË",
    "OVERIJSSEL",
    "UTRECHT",
    "ANTWERPEN",
    "FLEVOLAND",
    "LIMBURG",
    "GRONINGEN",
    "WEST-VLAANDEREN",
    "NOORD-BRABANT",
    "FRIESLAND",
  ] as const;

  return (
    <div
      className={clsx(
        "absolute inset-0 -z-50 h-full w-full overflow-hidden bg-gray-950 text-7xl font-semibold text-nowrap text-gray-900/50 select-none",
        className,
      )}
    >
      <div className="-translate-y-1/8 -rotate-12">
        {[...Array(21)].map((e, i) => (
          <div
            key={`bg-text-${i}`}
            style={{ transform: `translateX(-${i * 400}px)` }}
          >
            {Array(2).fill(PROVINCES).flat().join(" ")}
          </div>
        ))}
      </div>
    </div>
  );
}
