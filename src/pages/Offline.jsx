import { useState, useEffect } from "react";
import { getOfflineSongs, removeSongOffline } from "../utils/offline";
import { usePlayer } from "../context/PlayerContext";
import SongList from "../components/SongList";
import { HardDriveDownload, Play, Shuffle, Trash2 } from "lucide-react";
import "./Offline.css";

export default function Offline() {
  const [offlineSongs, setOfflineSongs] = useState([]);
  const { play } = usePlayer();

  const loadOffline = () => {
    const list = getOfflineSongs();
    setOfflineSongs(list);
  };

  useEffect(() => {
    loadOffline();
  }, []);

  const handleSongDeleted = async (key) => {
    await removeSongOffline(key);
    loadOffline();
  };

  const clearAllOffline = async () => {
    if (!confirm("Clear all downloaded offline songs from this device?")) return;
    try {
      if ("caches" in window) {
        await caches.delete("siam-music-offline-v1");
      }
      localStorage.removeItem("siam_offline_songs_meta");
      setOfflineSongs([]);
    } catch (e) {
      console.error(e);
    }
  };

  const playAll = () => {
    if (offlineSongs.length > 0) {
      play(offlineSongs, 0);
    }
  };

  const playShuffle = () => {
    if (offlineSongs.length > 0) {
      const shuffled = [...offlineSongs].sort(() => Math.random() - 0.5);
      play(shuffled, 0);
    }
  };

  return (
    <div className="offline-page">
      <div className="offline-hero">
        <div className="offline-hero__meta">
          <span className="offline-tag">DEVICE STORAGE</span>
          <h1>Offline Downloads</h1>
          <p>{offlineSongs.length} songs saved on this device (No internet required)</p>
        </div>

        {offlineSongs.length > 0 && (
          <div className="offline-actions">
            <button className="btn-primary" onClick={playAll}>
              <Play size={16} /> Play All
            </button>
            <button className="btn-secondary" onClick={playShuffle}>
              <Shuffle size={16} /> Shuffle
            </button>
            <button className="btn-secondary btn-danger-text" onClick={clearAllOffline}>
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        )}
      </div>

      {offlineSongs.length === 0 ? (
        <div className="offline-empty">
          <HardDriveDownload size={48} color="#444" />
          <h3>No offline downloads yet</h3>
          <p>Click the download icon next to any song to save it for offline listening.</p>
        </div>
      ) : (
        <SongList
          songs={offlineSongs}
          queueSongs={offlineSongs}
          onSongDeleted={handleSongDeleted}
        />
      )}
    </div>
  );
}
