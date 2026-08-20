import type { MetadataRoute } from "next";
import { getDb, hasDatabase } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  try {
    if (hasDatabase()) {
      const db = getDb();
      const rows = await db
        .select({ id: stories.id, updatedAt: stories.updatedAt })
        .from(stories);
      for (const row of rows) {
        entries.push({
          url: `${siteUrl}/story/${row.id}`,
          lastModified: row.updatedAt ?? new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch (e) {
    console.error("sitemap generation failed:", e);
  }

  return entries;
}