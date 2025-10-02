import { S3Client } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 S3-compatible client configuration.
 * All secrets are read from environment variables – never hardcode credentials.
 * Required env vars (see .env.example.r2):
 *   R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
 *   R2_ACCESS_KEY_ID=...
 *   R2_SECRET_ACCESS_KEY=...
 *   R2_BUCKET=doneplayavatars
 *   R2_PUBLIC_BASE=https://cdn.doneplay.site   (your custom domain, no trailing slash)
 */
let _r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  // Re-read env at call time to ensure ConfigModule has loaded .env
  if (!_r2Client) {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!endpoint) {
      throw new Error('R2 endpoint not configured (R2_ENDPOINT missing)');
    }
    if (!accessKey || !secretKey) {
      throw new Error(
        'R2 credentials missing (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)',
      );
    }
    _r2Client = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
  }
  return _r2Client;
}

export function r2IsConfigured() {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );
}
