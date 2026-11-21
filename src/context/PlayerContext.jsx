import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { getPlayableUrl } from '../utils/offline';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // none | one | all
  const audioRef = useRef(new Audio());

  const current = queue[currentIndex] || null;

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => handleNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [queue, currentIndex, shuffle, repeat]);

  // MediaSession API setup for lock screen / background controls
  useEffect(() => {
    if ('mediaSession' in navigator && current) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title || 'Unknown Title',
        artist: current.artist || 'Unknown Artist',
        album: "Siam's Music Library"
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current.play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrev();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNext();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
    }
  }, [current, queue, currentIndex]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const loadAndPlaySong = async (song) => {
    const audio = audioRef.current;
    try {
      const srcUrl = await getPlayableUrl(song);
      audio.src = srcUrl;
      audio.load();
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Playback error:', err);
    }
  };

  const play = async (songs, index = 0) => {
    setQueue(songs);
    setCurrentIndex(index);
    if (songs[index]) {
      await loadAndPlaySong(songs[index]);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const handleNext = async () => {
    if (repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }
    if (shuffle) {
      const next = Math.floor(Math.random() * queue.length);
      setCurrentIndex(next);
      if (queue[next]) await loadAndPlaySong(queue[next]);
    } else {
      if (currentIndex < queue.length - 1) {
        const next = currentIndex + 1;
        setCurrentIndex(next);
        if (queue[next]) await loadAndPlaySong(queue[next]);
      } else if (repeat === 'all' && queue.length > 0) {
        setCurrentIndex(0);
        if (queue[0]) await loadAndPlaySong(queue[0]);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handlePrev = async () => {
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      if (queue[prev]) await loadAndPlaySong(queue[prev]);
    }
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <PlayerContext.Provider value={{
      current, queue, currentIndex, isPlaying, progress, duration,
      volume, shuffle, repeat,
      play, togglePlay, handleNext, handlePrev, seek,
      setVolume, setShuffle, setRepeat
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
