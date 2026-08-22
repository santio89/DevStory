import type { Transition } from "framer-motion";

export const revealViewport = { once: true, margin: "-40px" as const };

/** Critically damped — one smooth settle, no double-bounce. */
export const fluidSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 36,
  mass: 0.82,
};

export const subtleSpring: Transition = fluidSpring;

export const heroSpring: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 32,
  mass: 0.88,
};

export const strikeSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 0.9,
};

export const footerSpring: Transition = {
  type: "spring",
  stiffness: 360,
  damping: 38,
  mass: 0.85,
};

export const timelineSpring: Transition = fluidSpring;

export const subtleReveal = {
  initial: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export const heroReveal = {
  initial: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const strikeReveal = {
  initial: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

export const footerReveal = {
  initial: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const timelineReveal = {
  initial: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};
