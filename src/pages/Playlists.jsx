import { useState, useEffect } from "react";
import { fetchPlaylists, savePlaylists } from "../utils/api";
import { usePlayer } from "../context/PlayerContext";
import SongList from "../components/SongList";
import { ListMusic, Plus, Play, Shuffle, Trash2 } from "lucide-react";
import "./Playlists.css";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const { play } = usePlayer();

  const loadData = async () => {
    try {
      const data = await fetchPlaylists();
      setPlaylists(data || []);
      if (!selectedId && data && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentPlaylist = playlists.find(p => p.id === selectedId) || null;

  const handleCreate = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const newPl = {
      id: "pl_" + Date.now(),
      name: title,
      createdAt: new Date().toISOString(),
      songs: []
    };

    const updated = [newPl, ...playlists];
    setPlaylists(updated);
    setSelectedId(newPl.id);
    setNewTitle("");
    await savePlaylists(updated);
  };

  const handleDeletePlaylist = async (id) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    const updated = playlists.filter(p => p.id !== id);
    setPlaylists(updated);
    if (selectedId === id) {
      setSelectedId(updated[0]?.id || null);
    }
    await savePlaylists(updated);
  };

  const handleSongDeleted = (deletedKey) => {
    // If a song was deleted from vault, remove from playlists
    const updated = playlists.map(p => ({
      ...p,
      songs: p.songs.filter(s => s.key !== deletedKey)
    }));
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const playAll = () => {
    if (currentPlaylist && currentPlaylist.songs.length > 0) {
      const playable = currentPlaylist.songs.map(s => ({
        ...s,
        url: `/api/stream?key=${encodeURIComponent(s.key)}`
      }));
      play(playable, 0);
    }
  };

  const playShuffle = () => {
    if (currentPlaylist && currentPlaylist.songs.length > 0) {
      const playable = currentPlaylist.songs.map(s => ({
        ...s,
        url: `/api/stream?key=${encodeURIComponent(s.key)}`
      }));
      const shuffled = [...playable].sort(() => Math.random() - 0.5);
      play(shuffled, 0);
    }
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  return (
    <div className="playlists-page">
      <div className="playlists-sidebar">
        <h2 className="section-title">Playlists</h2>

        <form className="create-pl-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="New playlist..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button type="submit" disabled={!newTitle.trim()}>
            <Plus size={16} />
          </button>
        </form>

        <div className="pl-tabs">
          {playlists.map(pl => (
            <button
              key={pl.id}
              className={`pl-tab ${pl.id === selectedId ? "pl-tab--active" : ""}`}
              onClick={() => setSelectedId(pl.id)}
            >
              <ListMusic size={16} />
              <span className="pl-tab__name">{pl.name}</span>
              <span className="pl-tab__count">{pl.songs.length}</span>
            </button>
          ))}
          {playlists.length === 0 && (
            <div className="pl-empty-hint">Create your first playlist above</div>
          )}
        </div>
      </div>

      <div className="playlists-content">
        {currentPlaylist ? (
          <>
            <div className="pl-hero">
              <div className="pl-hero__meta">
                <span className="pl-tag">PLAYLIST</span>
                <h1>{currentPlaylist.name}</h1>
                <p>{currentPlaylist.songs.length} songs</p>
              </div>

              <div className="pl-actions">
                <button
                  className="btn-primary"
                  onClick={playAll}
                  disabled={currentPlaylist.songs.length === 0}
                >
                  <Play size={16} /> Play
                </button>
                <button
                  className="btn-secondary"
                  onClick={playShuffle}
                  disabled={currentPlaylist.songs.length === 0}
                >
                  <Shuffle size={16} /> Shuffle
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeletePlaylist(currentPlaylist.id)}
                  title="Delete playlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {currentPlaylist.songs.length === 0 ? (
              <div className="pl-no-songs">
                This playlist is empty.<br />
                Browse your songs on Home or Artists and click <strong>+</strong> to add them here!
              </div>
            ) : (
              <SongList
                songs={currentPlaylist.songs.map(s => ({
                  ...s,
                  url: `/api/stream?key=${encodeURIComponent(s.key)}`
                }))}
                onSongDeleted={handleSongDeleted}
              />
            )}
          </>
        ) : (
          <div className="pl-no-selection">
            <ListMusic size={48} color="#444" />
            <p>Select or create a playlist to view songs</p>
          </div>
        )}
      </div>
    </div>
  );
}
