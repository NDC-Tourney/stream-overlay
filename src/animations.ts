export type AnimType = "fade" | "slide" | "none";

export interface AnimTypes {
  header: AnimType;
  main: AnimType;
  footer: AnimType;
}

const SLIDE_DISTANCE = 1920;

export const sectionVariants = {
  header: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slide: (direction: 1 | -1) => ({
      initial: { x: SLIDE_DISTANCE * direction, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -SLIDE_DISTANCE * direction, opacity: 1 },
      transition: { duration: 0.2 },
    }),
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    },
  },
  main: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slide: (direction: 1 | -1) => ({
      initial: { x: SLIDE_DISTANCE * direction, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -SLIDE_DISTANCE * direction, opacity: 1 },
      transition: { duration: 0.2 },
    }),
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    },
  },
  footer: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slide: (direction: 1 | -1) => ({
      initial: { x: SLIDE_DISTANCE * direction, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -SLIDE_DISTANCE * direction, opacity: 1 },
      transition: { duration: 0.2 },
    }),
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    },
  },
} as const;

/**
 * Determine animation type per section for a transition
 */
export function getAnimations(from: string, to: string): AnimTypes {
  // Default fade
  const anim: AnimTypes = { header: "fade", main: "fade", footer: "fade" };

  // Normalize inputs
  const a = (from || "").toLowerCase();
  const b = (to || "").toLowerCase();
  const key = `${a}->${b}`;
  const rev = `${b}->${a}`;

  // Scheduling: always full fade in/out
  if (a === "scheduling" || b === "scheduling") {
    // eslint-disable-next-line no-console
    // console.debug("getAnimations(scheduling)", { from: a, to: b });
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // Helper to test both directions
  const either = (...pairs: string[]) =>
    pairs.some((p) => p === key || p === rev);

  // Start ↔ Standby, Mappool, Winner: Slide top & middle, instantly change bottom (no animation)
  if (either("start->standby", "start->mappool", "start->winner")) {
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // Start ↔ Versus: Slide top & middle, Fade bottom in
  if (either("start->versus")) {
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // Standby ↔ Mappool: Fade top, Slide middle, instantly change bottom (no animation)
  if (either("standby->mappool")) {
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // Standby ↔ Versus: Fade top & bottom in, main no animation
  if (either("standby->versus")) {
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // Standby ↔ Winner: Slide top & middle, instantly change bottom (no animation)
  if (either("standby->winner")) {
    return { header: "fade", main: "fade", footer: "none" };
  }

  // Versus ↔ Mappool: Instantly change top (no animation), Slide middle, Fade bottom in
  if (either("versus->mappool")) {
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // Versus ↔ Winner: Slide top & middle, Fade bottom in
  if (either("versus->winner")) {
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // Mappool ↔ Winner: Slide top & middle, instantly change bottom (no animation)
  if (either("mappool->winner")) {
    return { header: "fade", main: "fade", footer: "fade" };
  }

  // default
  // eslint-disable-next-line no-console
  // console.debug("getAnimations(default)", { from: a, to: b, key, rev });
  return anim;
}
