export function withBase(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

export function matchHref(id: string, view?: "stats" | "setup") {
  const query = `?id=${encodeURIComponent(id)}`;
  if (view === "stats") return `/match/stats/${query}`;
  if (view === "setup") return `/match/setup/${query}`;
  return `/match/${query}`;
}
