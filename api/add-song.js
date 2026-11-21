import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, BUCKET } from './_b2.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artist, title, key, file } = req.body || {};

  if (!artist || !title || !key) {
    return res.status(400).json({ error: 'Missing required song metadata' });
  }

  try {
    let manifest = [];
    try {
      const data = await s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: 'manifest.json'
      }));
      const body = await data.Body.transformToString();
      manifest = JSON.parse(body);
    } catch (e) {
      manifest = [];
    }

    // Check if duplicate key already exists
    const existingIndex = manifest.findIndex(s => s.key === key);
    const newEntry = { artist, title, key, file: file || key.split('/').pop() };

    if (existingIndex >= 0) {
      manifest[existingIndex] = newEntry;
    } else {
      manifest.unshift(newEntry);
    }

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'manifest.json',
      Body: JSON.stringify(manifest, null, 2),
      ContentType: 'application/json'
    }));

    return res.status(200).json({ success: true, song: newEntry, count: manifest.length });
  } catch (error) {
    console.error('Update manifest error:', error);
    return res.status(500).json({ error: 'Failed to update manifest', details: error.message });
  }
}
