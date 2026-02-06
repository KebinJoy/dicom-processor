import { minioClient } from './client';

export async function getDownloadUrl(objectKey: string) {
  // valid for 1 hour (3600 sec)
  return minioClient.presignedGetObject(
    process.env.MINIO_BUCKET!,
    objectKey,
    60 * 60,
  );
}
