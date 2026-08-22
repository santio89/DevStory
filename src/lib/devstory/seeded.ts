/** Stable index in [0, modulus) from a string seed. */
export function seededIndex(seed: string, modulus: number): number {
  if (modulus <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % modulus;
}
