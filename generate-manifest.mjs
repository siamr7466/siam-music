#!/usr/bin/env node
/**
 * generate-manifest.js
 * Scans the Music folder and generates manifest.json for R2 upload.
 * Run: node generate-manifest.js
 */
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const MUSIC_DIR = process.argv[2] || 'C:/Users/siamr/Desktop/Music';
const R2_PUBLIC_URL = process.env.VITE_R2_PUBLIC_URL || 'YOUR_R2_URL_HERE';
const AUDIO_EXTS = new Set(['.mp3', '.flac', '.m4a', '.wav', '.ogg', '.aac']);

function scan(dir, artist = '') {
  const songs = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      songs.push(...scan(full, entry));
    } else if (AUDIO_EXTS.has(extname(entry).toLowerCase())) {
      const title = basename(entry, extname(entry));
      const key = `music/${artist}/${entry}`;
      songs.push({
        artist,
        title,
        file: entry,
        key,
        url: `${R2_PUBLIC_URL}/${encodeURIComponent(key).replace(/%2F/g, '/')}`
      });
    }
  }
  return songs;
}

const songs = scan(MUSIC_DIR);
writeFileSync('manifest.json', JSON.stringify(songs, null, 2));
console.log(`Generated manifest.json with ${songs.length} songs.`);
