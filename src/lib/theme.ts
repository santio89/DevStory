export const THEME_SCRIPT = `try{var t=localStorage.getItem("devstory-theme")||"dark";var dark=t==="dark";document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light"}catch(e){}`;

export type Theme = "dark" | "light";

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem("devstory-theme") === "light"
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function toggleTheme() {
  const next: Theme = readStoredTheme() === "dark" ? "light" : "dark";
  try {
    window.localStorage.setItem("devstory-theme", next);
  } catch {}
  applyTheme(next);
}