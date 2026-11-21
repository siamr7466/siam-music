import { useState, useRef } from 'react';
import { uploadSongFile } from '../utils/api';
import { UploadCloud, CheckCircle, AlertCircle, Music } from 'lucide-react';
import './Upload.css';

export default function Upload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStatus(null);

    // Auto-parse filename: "Artist - Title.mp3" or "Title.mp3"
    const rawName = selectedFile.name.replace(/\.[^/.]+$/, '');
    if (rawName.includes(' - ')) {
      const parts = rawName.split(' - ');
      setArtist(parts[0].trim());
      setTitle(parts.slice(1).join(' - ').trim());
    } else {
      setTitle(rawName);
      if (!artist) setArtist('Various Artists');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setStatus(null);

    try {
      await uploadSongFile(file, artist, title, (pct) => setProgress(pct));
      setStatus({ type: 'success', message: `"${title}" uploaded & added to ${artist} folder!` });
      setFile(null);
      setArtist('');
      setTitle('');
      if (onUploaded) onUploaded();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <h1 className="page-title">Upload Music</h1>
      <p className="upload-subtitle">Add new songs to your cloud vault — auto-sorted by artist</p>

      <div
        className={`dropzone ${file ? 'dropzone--has-file' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
        {file ? (
          <div className="dropzone__selected">
            <Music size={36} color="#9b6dff" />
            <span className="dropzone__filename">{file.name}</span>
            <span className="dropzone__size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        ) : (
          <div className="dropzone__placeholder">
            <UploadCloud size={44} color="#666" />
            <p>Drag & drop audio file here or <span>browse</span></p>
            <small>Supports MP3, M4A, FLAC, WAV, AAC</small>
          </div>
        )}
      </div>

      {file && (
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Artist / Folder</label>
            <input
              type="text"
              required
              placeholder="e.g. Arijit Singh"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>Song Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Tum Hi Ho"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>Uploading to cloud... {progress}%</span>
            </div>
          )}

          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save & Upload to Cloud'}
          </button>
        </form>
      )}

      {status && (
        <div className={`status-banner status-banner--${status.type}`}>
          {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
