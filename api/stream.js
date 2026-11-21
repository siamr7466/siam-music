import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET } from './_b2.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { key, format } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: decodeURIComponent(key)
    });

    // 6 hours valid
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 21600 });

    if (format === 'json') {
      return res.status(200).json({ url: presignedUrl });
    }

    // Redirect to Backblaze B2 presigned download URL
    res.setHeader('Location', presignedUrl);
    return res.status(307).end();
  } catch (error) {
    console.error('Stream error:', error);
    return res.status(500).json({ error: 'Failed to generate stream url', details: error.message });
  }
}
