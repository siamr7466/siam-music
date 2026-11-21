import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3, BUCKET } from './_b2.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const data = await s3.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: 'manifest.json'
    }));

    const bodyString = await data.Body.transformToString();
    const manifest = JSON.parse(bodyString);
    return res.status(200).json(manifest);
  } catch (error) {
    console.error('Manifest fetch error:', error);
    return res.status(500).json({ error: 'Failed to retrieve manifest', details: error.message });
  }
}
