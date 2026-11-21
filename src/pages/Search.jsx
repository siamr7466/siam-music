import { useState, useEffect } from 'react';
import { fetchManifest } from '../utils/api';
import SongList from '../components/SongList';
import { Search as SearchIcon } from 'lucide-react';
import './Search.css';

export default function Search() {
  const [allSongs, setAllSongs] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchManifest().then(setAllSongs).catch(() => {});
  }, []);

  const results = query.trim()
    ? allSongs.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="search-page">
      <h1 className="page-title">Search</h1>
      <div className="search-box">
        <SearchIcon size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Songs, artists..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      {query && results.length === 0 && (
        <div className="no-results">No results for "{query}"</div>
      )}
      {results.length > 0 && (
        <SongList songs={results} queueSongs={results} />
      )}
      {!query && (
        <div className="search-hint">Start typing to search your library</div>
      )}
    </div>
  );
}
