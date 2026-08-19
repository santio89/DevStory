const ITEMS = [
  "commits are letters",
  "repos are chapters",
  "every build is a heartbeat",
  "the invisible hours are the whole story",
];

export function Marquee() {
  const row = ITEMS.join("  ·  ");

  return (
    <div className="relative overflow-hidden border-y border-white/10 py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] whitespace-nowrap">
        <span className="px-4 font-mono text-sm tracking-wide text-zinc-500">
          {row}
        </span>
        <span
          aria-hidden="true"
          className="px-4 font-mono text-sm tracking-wide text-zinc-500"
        >
          {row}
        </span>
      </div>
    </div>
  );
}