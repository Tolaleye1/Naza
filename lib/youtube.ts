const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function parseStartTime(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get("start") ?? searchParams.get("t");
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) return null;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const total = hours * 3600 + minutes * 60 + seconds;

  return total > 0 ? total : null;
}

export function extractYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(host)) {
      return null;
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments[0] === "watch") {
      const id = parsed.searchParams.get("v") ?? "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live") {
      const id = segments[1] ?? "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function getYouTubeEmbedSrc(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return "";

  try {
    const parsed = new URL(url.trim());
    const start = parseStartTime(parsed.searchParams);
    return start
      ? `https://www.youtube.com/embed/${videoId}?start=${start}`
      : `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}
