import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

  const { key } = req.body || {};
  if (!key) {
    return res.status(400).json({ error: 'Missing song key' });
  }

  try {
    // 1. Delete audio file from B2 bucket
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key
    }));

    // 2. Remove song from manifest.json
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

    const updatedManifest = manifest.filter(s => s.key !== key);

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'manifest.json',
      Body: JSON.stringify(updatedManifest, null, 2),
      ContentType: 'application/json'
    }));

    return res.status(200).json({ success: true, count: updatedManifest.length });
  } catch (error) {
    console.error('Delete song error:', error);
    return res.status(500).json({ error: 'Failed to delete song', details: error.message });
  }
}
