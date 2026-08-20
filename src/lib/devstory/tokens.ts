export const TOKEN_IDS = [
  "sprout",
  "spark",
  "frame",
  "bridge",
  "flame",
  "peak",
  "compass",
  "rocket",
  "tide",
  "labyrinth",
  "key",
  "roots",
  "dawn",
  "orbit",
  "signal",
  "current",
  "forge",
  "gate",
  "mirror",
  "constellation",
] as const;

export type TokenId = (typeof TOKEN_IDS)[number];

export const TOKEN_MEANINGS: Record<TokenId, string> = {
  sprout: "beginnings, first steps, a seed planted",
  spark: "an idea ignites, curiosity sparks",
  frame: "structure, foundations, frameworks",
  bridge: "connecting things, integrating, refactoring",
  flame: "rewrites, burning it down and rebuilding",
  peak: "mastery, summits reached, hard-won skill",
  compass: "exploration, finding direction",
  rocket: "shipping, launching, going public",
  tide: "flow, steady streams of work, momentum",
  labyrinth: "long debugging journeys, deep complexity",
  key: "breakthroughs, unlocking something",
  roots: "deepening, growing in place",
  dawn: "new beginnings, first light after a long night",
  orbit: "consistent rhythm, rounds of iteration, satellite work",
  signal: "communication, APIs, messages sent and received",
  current: "momentum, continuous delivery, being in the flow",
  forge: "craftsmanship, building tools, hammering out details",
  gate: "checkpoints passed, releases, milestones cleared",
  mirror: "reflection, learning from mistakes, honest self-review",
  constellation: "many small pieces forming a bigger picture",
};

export function pickTokenForName(name: string): TokenId {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return TOKEN_IDS[hash % TOKEN_IDS.length];
}