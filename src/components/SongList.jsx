import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Music2 } from 'lucide-react';
import './SongList.css';

export default function SongList({ songs, queueSongs }) {
  const { play, current, isPlaying } = usePlayer();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const allSongs = queueSongs || songs;

  return (
    <div className="song-list">
      {songs.map((song, idx) => {
        const queueIdx = allSongs.findIndex(s => s.url === song.url);
        const isActive = current?.url === song.url;

        return (
          <div
            key={song.url}
            className={`song-row ${isActive ? 'song-row--active' : ''}`}
            onClick={() => play(allSongs, queueIdx)}
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
              <span className="song-row__title">{song.title}</span>
              <span className="song-row__artist">{song.artist}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
