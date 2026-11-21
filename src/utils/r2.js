// R2 public bucket base URL — set after you create the bucket
// Format: https://pub-<hash>.r2.dev  OR custom domain
export const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

// Fetch the full song list from a manifest JSON stored in R2
export async function fetchManifest() {
  const res = await fetch(`${R2_PUBLIC_URL}/manifest.json`);
  if (!res.ok) throw new Error('Failed to load manifest');
  return res.json(); // [{ artist, title, file, url }]
}

export function buildSongUrl(key) {
  return `${R2_PUBLIC_URL}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
}
