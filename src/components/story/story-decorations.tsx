"use client";

import { motion } from "framer-motion";

export function ShareOrbitIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={className}
    >
      <motion.circle
        cx="32"
        cy="32"
        r="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity={0.35}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "32px 32px" }}
      />
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "32px 32px" }}
      >
        <circle cx="32" cy="10" r="3" fill="#f0c020" />
        <circle cx="54" cy="32" r="2.5" fill="#f9a8d4" />
        <circle cx="32" cy="54" r="2.5" fill="#38bdf8" />
        <circle cx="10" cy="32" r="2" fill="#ffffff" />
      </motion.g>
      <motion.path
        d="M22 32 C22 26.5 26.5 22 32 22 C37.5 22 42 26.5 42 32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ pathLength: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="32" cy="32" r="4" fill="currentColor" opacity={0.9} />
    </svg>
  );
}

export function LookupOrbitIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      className={className}
    >
      <motion.rect
        x="18"
        y="18"
        width="44"
        height="44"
        stroke="currentColor"
        strokeWidth="2"
        opacity={0.25}
        animate={{ rotate: [0, 90, 180, 270, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "40px 40px" }}
      />
      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="26" y="26" width="28" height="28" fill="#1040c0" stroke="#ffffff" strokeWidth="2" />
        <text
          x="40"
          y="46"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="16"
          fontFamily="monospace"
          fontWeight="900"
        >
          {"{ }"}
        </text>
      </motion.g>
      <motion.circle
        cx="62"
        cy="22"
        r="3"
        fill="#f0c020"
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="18"
        cy="58"
        r="2.5"
        fill="#f9a8d4"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </svg>
  );
}

export function MomentSparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden
      className={className}
    >
      <motion.circle
        cx="36"
        cy="36"
        r="28"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity={0.2}
        animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "36px 36px" }}
      />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "36px 36px" }}
      >
        <path
          d="M36 12 L38 30 L56 32 L38 34 L36 52 L34 34 L16 32 L34 30 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity={0.5}
        />
      </motion.g>
      <motion.circle
        cx="36"
        cy="36"
        r="6"
        fill="#f0c020"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "36px 36px" }}
      />
      <motion.path
        d="M36 24 V30 M36 42 V48 M24 36 H30 M42 36 H48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
