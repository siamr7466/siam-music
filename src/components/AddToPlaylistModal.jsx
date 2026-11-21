import { useState, useEffect } from 'react';
import { fetchPlaylists, savePlaylists } from '../utils/api';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import './AddToPlaylistModal.css';

export default function AddToPlaylistModal({ song, onClose, onUpdated }) {
  const [playlists, setPlaylists] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists().then(data => {
      setPlaylists(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleSongInPlaylist = async (playlistId) => {
    const updated = playlists.map(pl => {
      if (pl.id !== playlistId) return pl;
      const exists = pl.songs.some(s => s.key === song.key);
      const newSongs = exists
        ? pl.songs.filter(s => s.key !== song.key)
        : [...pl.songs, { key: song.key, title: song.title, artist: song.artist, file: song.file }];
      return { ...pl, songs: newSongs };
    });

    setPlaylists(updated);
    await savePlaylists(updated);
    if (onUpdated) onUpdated();
  };

  const createAndAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const newPl = {
      id: 'pl_' + Date.now(),
      name: title,
      createdAt: new Date().toISOString(),
      songs: [{ key: song.key, title: song.title, artist: song.artist, file: song.file }]
    };

    const updated = [newPl, ...playlists];
    setPlaylists(updated);
    setNewTitle('');
    await savePlaylists(updated);
    if (onUpdated) onUpdated();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__info">
            <ListMusic size={20} color="#9b6dff" />
            <div>
              <h3>Add to Playlist</h3>
              <p>{song.title} — {song.artist}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-create-row" onSubmit={createAndAdd}>
          <input
            type="text"
            placeholder="New playlist name..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button type="submit" className="modal-create-btn" disabled={!newTitle.trim()}>
            <Plus size={16} /> Create
          </button>
        </form>

        <div className="modal-list">
          {loading ? (
            <div className="modal-empty">Loading playlists...</div>
          ) : playlists.length === 0 ? (
            <div className="modal-empty">No playlists yet. Create one above!</div>
          ) : (
            playlists.map(pl => {
              const inPlaylist = pl.songs.some(s => s.key === song.key);
              return (
                <div
                  key={pl.id}
                  className={`modal-item ${inPlaylist ? 'modal-item--selected' : ''}`}
                  onClick={() => toggleSongInPlaylist(pl.id)}
                >
                  <div className="modal-item__meta">
                    <span className="modal-item__name">{pl.name}</span>
                    <span className="modal-item__count">{pl.songs.length} songs</span>
                  </div>
                  <div className={`modal-check ${inPlaylist ? 'checked' : ''}`}>
                    {inPlaylist && <Check size={14} />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
