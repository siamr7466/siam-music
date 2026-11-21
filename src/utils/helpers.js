export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function groupByArtist(songs) {
  return songs.reduce((acc, song) => {
    const artist = song.artist || 'Unknown';
    if (!acc[artist]) acc[artist] = [];
    acc[artist].push(song);
    return acc;
  }, {});
}
