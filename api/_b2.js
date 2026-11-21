import { S3Client } from '@aws-sdk/client-s3';

export const BUCKET = process.env.B2_BUCKET || 'siam-music-vault';

export const s3 = new S3Client({
  endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
  region: process.env.B2_REGION || 'us-east-005',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID || '005b3102e972c860000000001',
    secretAccessKey: process.env.B2_APPLICATION_KEY || 'K005iOeq7dxCyzsr9e64MlnuxQT6GxM'
  }
});
