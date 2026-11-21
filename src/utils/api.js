// API helpers for streaming, library management, and playlists

export async function fetchManifest() {
  const res = await fetch('/api/manifest');
  if (!res.ok) {
    throw new Error(`Failed to load music manifest (${res.status})`);
  }
  const data = await res.json();
  return data.map(item => ({
    ...item,
    url: `/api/stream?key=${encodeURIComponent(item.key)}`
  }));
}

export async function deleteSong(key) {
  const res = await fetch('/api/delete-song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete song');
  }
  return res.json();
}

export async function fetchPlaylists() {
  try {
    const res = await fetch('/api/playlists');
    if (!res.ok) throw new Error('Failed to load playlists');
    return res.json();
  } catch (e) {
    // Fallback to local storage if offline
    const local = localStorage.getItem('siam_playlists');
    return local ? JSON.parse(local) : [];
  }
}

export async function savePlaylists(playlists) {
  // Sync locally first
  localStorage.setItem('siam_playlists', JSON.stringify(playlists));

  // Sync to B2 cloud
  try {
    await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlists })
    });
  } catch (e) {
    console.warn('Failed to sync playlists to cloud:', e);
  }
}

export async function uploadSongFile(file, artist, title, onProgress) {
  const cleanArtist = artist.trim() || 'Various Artists';
  const cleanTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');
  
  const initRes = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artist: cleanArtist,
      filename: file.name,
      contentType: file.type || 'audio/mpeg'
    })
  });

  if (!initRes.ok) {
    throw new Error('Failed to get upload authorization');
  }

  const { uploadUrl, key } = await initRes.json();

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'audio/mpeg');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });

  const addRes = await fetch('/api/add-song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artist: cleanArtist,
      title: cleanTitle,
      key,
      file: file.name
    })
  });

  if (!addRes.ok) {
    throw new Error('Song uploaded, but failed to register in library');
  }

  return addRes.json();
}
