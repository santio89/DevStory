/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach } from "vitest";
import { readStoredTheme, toggleTheme } from "@/lib/theme";

describe("theme toggle (light/dark via the top-bar switch)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  it("defaults to dark, flips to light, and persists through localStorage", () => {
    expect(readStoredTheme()).toBe("dark");

    toggleTheme();
    expect(readStoredTheme()).toBe("light");
    expect(window.localStorage.getItem("devstory-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    toggleTheme();
    expect(readStoredTheme()).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});