import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

  const { artist = 'Various Artists', filename, contentType = 'audio/mpeg' } = req.body || {};

  if (!filename) {
    return res.status(400).json({ error: 'Missing filename' });
  }

  const safeArtist = artist.trim() || 'Various Artists';
  const safeFilename = filename.trim();
  const key = `music/${safeArtist}/${safeFilename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return res.status(200).json({ uploadUrl, key });
  } catch (error) {
    console.error('Upload URL error:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
  }
}
