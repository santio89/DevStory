export const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  Java: "#b07219",
  Go: "#00add8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4f5d95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Swift: "#ffac45",
  Kotlin: "#a97bff",
  Vue: "#41b883",
  Dart: "#00b4ab",
};

export function langColor(language: string) {
  return LANG_COLORS[language] ?? "#64748b";
}