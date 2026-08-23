"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { useLocale } from "@/components/locale/locale-provider";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, GitCommit, Milestone } from "lucide-react";

const FEATURE_ICONS = [GitCommit, BookOpen, Milestone];
const FEATURE_ICON_COLORS = [
  "text-bauhaus-deep",
  "text-bauhaus-cyan",
  "text-bauhaus-sky",
];
const FEATURE_CORNER = [
  "bg-bauhaus-deep",
  "bg-bauhaus-yellow",
  "bg-bauhaus-pink",
];

export function HomeFeatures() {
  const { t } = useLocale();

  return (
    <section
      id="features"
      className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6"
    >
      <FadeIn>
        <h2 className="text-center font-heading text-2xl font-black tracking-normal text-balance uppercase sm:text-3xl">
          {t.features.title}
          <span className="ml-2 inline-block size-3 rounded-full border-2 border-foreground bg-bauhaus-yellow" />
        </h2>
      </FadeIn>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {FEATURE_ICONS.map((Icon, i) => {
          const feature =
            t.features[i === 0 ? "one" : i === 1 ? "two" : "three"];
          return (
            <FadeIn key={i} delay={0.1 * i}>
              <Card className="relative h-full bg-card shadow-hard transition-transform duration-200 hover:-translate-y-1">
                <span
                  className={`absolute top-3 right-3 size-3 rotate-45 ${FEATURE_CORNER[i]}`}
                />
                <CardHeader>
                  <span className="mb-1 flex size-9 items-center justify-center rounded-none border-2 border-foreground bg-bauhaus-sky/20 shadow-hard-sm">
                    <Icon className={cn("size-5", FEATURE_ICON_COLORS[i])} />
                  </span>
                  <CardTitle>{feature.t}</CardTitle>
                  <CardDescription>{feature.d}</CardDescription>
                </CardHeader>
              </Card>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
