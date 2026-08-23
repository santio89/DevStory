import type { SVGProps } from "react";

/** GitHub-style repository (open book) — stroke icon matching DevStory sigils. */
export function RepoBookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 4v16" />
      <path d="M5 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5" />
      <path d="M9 4v16" />
      <path d="M9 4h4v4H9z" />
    </svg>
  );
}
