import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchManifest } from '../utils/api';
import { groupByArtist } from '../utils/helpers';
import SongList from '../components/SongList';
import { usePlayer } from '../context/PlayerContext';
import { Play, ChevronDown, ChevronRight } from 'lucide-react';
import './Artists.css';

export default function Artists() {
  const [grouped, setGrouped] = useState({});
  const [openArtist, setOpenArtist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { play } = usePlayer();

  useEffect(() => {
    fetchManifest().then(songs => {
      setAllSongs(songs);
      setGrouped(groupByArtist(songs));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = (artist) => setOpenArtist(o => o === artist ? null : artist);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  const artists = Object.keys(grouped).sort();

  return (
    <div className="artists">
      <h1 className="page-title">Artists</h1>
      <div className="artist-list">
        {artists.map(artist => {
          const songs = grouped[artist];
          const isOpen = openArtist === artist;
          return (
            <div key={artist} className="artist-item">
              <div className="artist-header" onClick={() => toggle(artist)}>
                <div className="artist-header__left">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="artist-name">{artist}</span>
                  <span className="artist-count">{songs.length} songs</span>
                </div>
                <button
                  className="artist-play"
                  onClick={e => { e.stopPropagation(); play(songs, 0); }}
                >
                  <Play size={14} /> Play
                </button>
              </div>
              {isOpen && (
                <div className="artist-songs">
                  <SongList songs={songs} queueSongs={songs} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
