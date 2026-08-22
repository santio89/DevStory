const GITHUB_USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function normalizeGitHubUsername(value: string): string {
  return value.trim().replace(/^@+/, "");
}

export function isValidGitHubUsername(value: string): boolean {
  const normalized = normalizeGitHubUsername(value);
  return normalized.length > 0 && GITHUB_USERNAME_RE.test(normalized);
}
