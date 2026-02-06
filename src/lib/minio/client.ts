import { Client } from 'minio';

declare global {
  var minioClient: Client | undefined;
}

export const minioClient =
  global.minioClient ??
  new Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: Number(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
  });

// Ensure the bucket exists on startup
minioClient
  .bucketExists(process.env.MINIO_BUCKET!)
  .then((exists) => {
    if (!exists) {
      console.log(
        `Bucket "${process.env.MINIO_BUCKET}" does not exist. Creating...`,
      );
      minioClient.makeBucket(process.env.MINIO_BUCKET!, 'us-east-1');
    } else {
      console.log(`Bucket "${process.env.MINIO_BUCKET}" already exists.`);
    }
  })
  .catch((err) => {
    console.error('Error checking/creating bucket:', err);
  });

// For development, attach to global to reuse across hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.minioClient = minioClient;
}
