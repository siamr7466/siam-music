import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readdirSync, statSync, createReadStream, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const MUSIC_DIR = 'C:/Users/siamr/Desktop/Music';
const BUCKET = 'siam-music-vault';
const PROGRESS_FILE = 'upload_progress.json';

const client = new S3Client({
  endpoint: 'https://s3.us-east-005.backblazeb2.com',
  region: 'us-east-005',
  credentials: {
    accessKeyId: '005b3102e972c860000000001',
    secretAccessKey: 'K005iOeq7dxCyzsr9e64MlnuxQT6GxM'
  }
});

const MIME_TYPES = {
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac'
};

function getAllSongs(dir, artist = '') {
  const songs = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      songs.push(...getAllSongs(full, entry));
    } else {
      const ext = extname(entry).toLowerCase();
      if (MIME_TYPES[ext]) {
        const title = basename(entry, ext);
        const key = `music/${artist}/${entry}`;
        songs.push({
          fullPath: full,
          artist: artist || 'Various Artists',
          title,
          file: entry,
          key,
          size: stat.size,
          contentType: MIME_TYPES[ext]
        });
      }
    }
  }
  return songs;
}

let progress = {};
if (existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
  } catch (e) {
    progress = {};
  }
}

async function uploadSong(song) {
  if (progress[song.key] === 'done') {
    return { status: 'skipped', song };
  }

  const stream = createReadStream(song.fullPath);
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: song.key,
    Body: stream,
    ContentType: song.contentType,
    ContentLength: song.size
  }));

  progress[song.key] = 'done';
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  return { status: 'uploaded', song };
}

// Concurrency pool
async function uploadAll(songs, concurrency = 4) {
  console.log(`Starting upload of ${songs.length} songs (concurrency: ${concurrency})...`);
  let completed = 0;
  let totalBytes = songs.reduce((sum, s) => sum + s.size, 0);
  let uploadedBytes = 0;

  const queue = [...songs];
  const workers = Array(concurrency).fill(0).map(async (_, idx) => {
    while (queue.length > 0) {
      const song = queue.shift();
      try {
        const res = await uploadSong(song);
        completed++;
        uploadedBytes += song.size;
        const pct = ((completed / songs.length) * 100).toFixed(1);
        const mb = (uploadedBytes / (1024 * 1024)).toFixed(1);
        const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
        console.log(`[${completed}/${songs.length}] (${pct}%) [${mb}/${totalMb} MB] ${res.status}: ${song.artist} - ${song.title}`);
      } catch (err) {
        console.error(`Failed: ${song.key}`, err.message);
      }
    }
  });

  await Promise.all(workers);
  console.log('All music files uploaded!');

  // Generate manifest with clean metadata
  const manifest = songs.map(s => ({
    artist: s.artist,
    title: s.title,
    key: s.key,
    file: s.file
  }));

  console.log('Uploading manifest.json to B2...');
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'manifest.json',
    Body: JSON.stringify(manifest, null, 2),
    ContentType: 'application/json'
  }));
  console.log('Manifest uploaded successfully!');
}

const allSongs = getAllSongs(MUSIC_DIR);
uploadAll(allSongs, 4).catch(console.error);
