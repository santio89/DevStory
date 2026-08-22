"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useEffect } from "react";
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

  const startIdle = () => {
    if (reduce || !idle) return;
    controls.start({
      y: [0, -7, 0],
      rotate: [0, idleRotate, 0],
      transition: { duration: 5 + drift, repeat: Infinity, ease: "easeInOut" },
    });
  };

  useEffect(() => {
    startIdle();
  }, [controls, reduce, drift, idleRotate, idle]);

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={className}
      animate={controls}
      onHoverStart={() => {
        controls.start({
          y: [0, -14, 0, -8, 0],
          scale: [1, 1.06, 1.02, 1.05, 1],
          transition: {
            duration: 0.6,
            ease: "easeOut",
            onComplete: startIdle,
          },
        });
      }}
    >
      {children}
    </motion.span>
  );
}