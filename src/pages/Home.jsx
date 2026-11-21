import { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import SongList from "../components/SongList";
import { fetchManifest } from "../utils/api";
import { Play, Shuffle } from "lucide-react";
import "./Home.css";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { play } = usePlayer();

  const loadSongs = () => {
    fetchManifest()
      .then(setSongs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const handleSongDeleted = (deletedKey) => {
    setSongs(prev => prev.filter(s => s.key !== deletedKey));
  };

  const playAll = () => play(songs, 0);
  const playShuffle = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    play(shuffled, 0);
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (error) return <div className="page-center error">Error: {error}<br/>Make sure your B2 credentials are set on Vercel.</div>;

  return (
    <div className="home">
      <div className="home__hero">
        <h1>Your Music</h1>
        <p>{songs.length} songs</p>
        <div className="home__actions">
          <button className="btn-primary" onClick={playAll}>
            <Play size={16} /> Play All
          </button>
          <button className="btn-secondary" onClick={playShuffle}>
            <Shuffle size={16} /> Shuffle
          </button>
        </div>
      </div>
      <SongList songs={songs} queueSongs={songs} onSongDeleted={handleSongDeleted} />
    </div>
  );
}
