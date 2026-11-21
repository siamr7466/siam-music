import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, BUCKET } from './_b2.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const data = await s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: 'playlists.json'
      }));
      const body = await data.Body.transformToString();
      return res.status(200).json(JSON.parse(body));
    } catch (e) {
      // If file doesn't exist yet, return empty list
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const { playlists } = req.body || {};
    if (!Array.isArray(playlists)) {
      return res.status(400).json({ error: 'Playlists must be an array' });
    }

    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: 'playlists.json',
        Body: JSON.stringify(playlists, null, 2),
        ContentType: 'application/json'
      }));
      return res.status(200).json({ success: true, count: playlists.length });
    } catch (error) {
      console.error('Save playlists error:', error);
      return res.status(500).json({ error: 'Failed to save playlists', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
