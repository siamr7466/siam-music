import { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { deleteSong } from "../utils/api";
import { isSongOffline, saveSongOffline, removeSongOffline } from "../utils/offline";
import AddToPlaylistModal from "./AddToPlaylistModal";
import { Play, Music2, Plus, Trash2, ArrowDownToLine, Check, Loader2 } from "lucide-react";
import "./SongList.css";

export default function SongList({ songs, queueSongs, onSongDeleted }) {
  const { play, current, isPlaying } = usePlayer();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [playlistModalSong, setPlaylistModalSong] = useState(null);
  const [downloadingKeys, setDownloadingKeys] = useState({});
  const [offlineMap, setOfflineMap] = useState({});

  const allSongs = queueSongs || songs;

  useEffect(() => {
    const map = {};
    songs.forEach(s => {
      map[s.key] = isSongOffline(s.key);
    });
    setOfflineMap(map);
  }, [songs]);

  const handleToggleOffline = async (e, song) => {
    e.stopPropagation();
    const isDownloaded = offlineMap[song.key];

    if (isDownloaded) {
      if (confirm(`Remove "${song.title}" from offline downloads?`)) {
        await removeSongOffline(song.key);
        setOfflineMap(prev => ({ ...prev, [song.key]: false }));
      }
      return;
    }

    setDownloadingKeys(prev => ({ ...prev, [song.key]: true }));
    try {
      await saveSongOffline(song);
      setOfflineMap(prev => ({ ...prev, [song.key]: true }));
    } catch (err) {
      alert(`Failed to download "${song.title}" for offline: ${err.message}`);
    } finally {
      setDownloadingKeys(prev => ({ ...prev, [song.key]: false }));
    }
  };

  const handleDelete = async (e, song) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${song.title}" from your cloud vault?`)) {
      return;
    }

    try {
      await deleteSong(song.key);
      await removeSongOffline(song.key);
      if (onSongDeleted) {
        onSongDeleted(song.key);
      }
    } catch (err) {
      alert(`Failed to delete song: ${err.message}`);
    }
  };

  return (
    <div className="song-list">
      {songs.map((song, idx) => {
        const queueIdx = allSongs.findIndex(s => s.key === song.key || s.url === song.url);
        const isActive = current?.key ? current.key === song.key : current?.url === song.url;
        const isOffline = offlineMap[song.key];
        const isDownloading = downloadingKeys[song.key];

        return (
          <div
            key={song.key || song.url || idx}
            className={`song-row ${isActive ? "song-row--active" : ""}`}
            onClick={() => play(allSongs, queueIdx >= 0 ? queueIdx : idx)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="song-row__num">
              {hoveredIdx === idx || isActive ? (
                isActive && isPlaying
                  ? <span className="eq-bars"><span/><span/><span/></span>
                  : <Play size={14} />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>

            <div className="song-row__icon">
              <Music2 size={16} />
            </div>

            <div className="song-row__info">
              <div className="song-row__title-wrap">
                <span className="song-row__title">{song.title}</span>
                {isOffline && (
                  <span className="offline-badge" title="Saved offline">
                    <Check size={11} /> Offline
                  </span>
                )}
              </div>
              <span className="song-row__artist">{song.artist}</span>
            </div>

            <div className="song-row__actions" onClick={e => e.stopPropagation()}>
              <button
                className={`action-btn ${isOffline ? "action-btn--active" : ""}`}
                title={isOffline ? "Downloaded (Click to remove)" : "Download for offline listening"}
                onClick={e => handleToggleOffline(e, song)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 size={15} className="spin-icon" />
                ) : isOffline ? (
                  <Check size={15} color="#4ade80" />
                ) : (
                  <ArrowDownToLine size={15} />
                )}
              </button>

              <button
                className="action-btn"
                title="Add to playlist"
                onClick={() => setPlaylistModalSong(song)}
              >
                <Plus size={16} />
              </button>

              <button
                className="action-btn action-btn--danger"
                title="Delete song"
                onClick={e => handleDelete(e, song)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}

      {playlistModalSong && (
        <AddToPlaylistModal
          song={playlistModalSong}
          onClose={() => setPlaylistModalSong(null)}
        />
      )}
    </div>
  );
}
