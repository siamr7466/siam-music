// Offline music caching using CacheStorage and LocalStorage

const CACHE_NAME = 'siam-music-offline-v1';
const META_KEY = 'siam_offline_songs_meta';

export function getOfflineSongs() {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isSongOffline(key) {
  const songs = getOfflineSongs();
  return songs.some(s => s.key === key);
}

export async function saveSongOffline(song, onProgress) {
  if (isSongOffline(song.key)) return;

  const cache = await caches.open(CACHE_NAME);
  const streamUrl = `/api/stream?key=${encodeURIComponent(song.key)}`;

  const response = await fetch(streamUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch audio stream for offline cache');
  }

  // Clone and put into CacheStorage
  await cache.put(streamUrl, response.clone());

  // Also cache under the direct key for fallback lookup
  await cache.put(song.key, response);

  // Save metadata
  const current = getOfflineSongs();
  const updated = [
    {
      key: song.key,
      title: song.title,
      artist: song.artist,
      file: song.file,
      url: streamUrl,
      downloadedAt: new Date().toISOString()
    },
    ...current.filter(s => s.key !== song.key)
  ];
  localStorage.setItem(META_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeSongOffline(key) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const streamUrl = `/api/stream?key=${encodeURIComponent(key)}`;
    await cache.delete(streamUrl);
    await cache.delete(key);

    const current = getOfflineSongs();
    const updated = current.filter(s => s.key !== key);
    localStorage.setItem(META_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to remove offline song:', e);
  }
}

// Get playable URL: checks offline CacheStorage first, otherwise uses online URL
export async function getPlayableUrl(song) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const streamUrl = `/api/stream?key=${encodeURIComponent(song.key)}`;
    
    let cachedResp = await cache.match(streamUrl);
    if (!cachedResp) {
      cachedResp = await cache.match(song.key);
    }

    if (cachedResp) {
      const blob = await cachedResp.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('Cache lookup failed, using network url:', e);
  }

  return song.url || `/api/stream?key=${encodeURIComponent(song.key)}`;
}
