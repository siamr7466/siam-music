import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/helpers';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Music2
} from 'lucide-react';
import './Player.css';

export default function Player() {
  const {
    current, isPlaying, progress, duration, volume, shuffle, repeat,
    togglePlay, handleNext, handlePrev, seek, setVolume, setShuffle, setRepeat
  } = usePlayer();

  const cycleRepeat = () => {
    if (repeat === 'none') setRepeat('all');
    else if (repeat === 'all') setRepeat('one');
    else setRepeat('none');
  };

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  if (!current) return (
    <div className="player player--empty">
      <Music2 size={20} />
      <span>Pick a song to play</span>
    </div>
  );

  return (
    <div className="player">
      {/* Song info */}
      <div className="player__info">
        <div className="player__thumb">
          <Music2 size={22} />
        </div>
        <div className="player__meta">
          <span className="player__title">{current.title}</span>
          <span className="player__artist">{current.artist}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="player__center">
        <div className="player__controls">
          <button
            className={`ctrl-btn ${shuffle ? 'active' : ''}`}
            onClick={() => setShuffle(s => !s)}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button className="ctrl-btn" onClick={handlePrev} title="Previous">
            <SkipBack size={20} />
          </button>
          <button className="ctrl-btn ctrl-btn--play" onClick={togglePlay}>
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button className="ctrl-btn" onClick={handleNext} title="Next">
            <SkipForward size={20} />
          </button>
          <button
            className={`ctrl-btn ${repeat !== 'none' ? 'active' : ''}`}
            onClick={cycleRepeat}
            title="Repeat"
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="player__progress">
          <span className="player__time">{formatTime(progress)}</span>
          <input
            type="range"
            className="progress-bar"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={e => seek(Number(e.target.value))}
          />
          <span className="player__time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="player__right">
        <button className="ctrl-btn" onClick={() => setVolume(v => v > 0 ? 0 : 0.8)}>
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          className="volume-bar"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
