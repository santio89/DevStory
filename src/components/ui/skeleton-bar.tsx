import { cn } from "@/lib/utils";

export function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-3 animate-pulse rounded-none bg-foreground/15",
        className,
      )}
    />
  );
}
