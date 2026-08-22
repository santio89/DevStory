"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect } from "react";
import type { ReactNode } from "react";

export function FloatingSymbol({
  children,
  className,
  drift = 0,
  idleRotate = 0,
  idle = true,
}: {
  children: ReactNode;
  className: string;
  drift?: number;
  idleRotate?: number;
  idle?: boolean;
}) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();

  const startIdle = useCallback(() => {
    if (reduce || !idle) return;
    controls.start({
      y: [0, -7, 0],
      rotate: [0, idleRotate, 0],
      transition: { duration: 5 + drift, repeat: Infinity, ease: "easeInOut" },
    });
  }, [controls, reduce, drift, idleRotate, idle]);

  useEffect(() => {
    startIdle();
  }, [startIdle]);

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={className}
      animate={controls}
      onHoverStart={() => {
        controls.start({
          y: [0, -9, 0, -6, 0, -3, 0],
          scale: [1, 1.04, 0.995, 1.025, 0.998, 1.01, 1],
          transition: {
            duration: 1,
            ease: [0.34, 1.1, 0.45, 1],
            times: [0, 0.16, 0.32, 0.5, 0.66, 0.82, 1],
            onComplete: startIdle,
          },
        });
      }}
    >
      {children}
    </motion.span>
  );
}