import { NextApiRequest, NextApiResponse } from 'next';
import { parseMultipart } from '@/lib/dicom/parseForm';
import { isDicomFile } from '@/lib/dicom/validateDicom';
import { extractMetadata } from '@/lib/dicom/extractMetadata';
import { sha256 } from '@/lib/dicom/hashFile';
import { minioClient } from '@/lib/minio/client';
import {
  findByHash,
  insertDicomRecord,
  getAllDicomFiles,
} from '@/lib/db/dicomRepository';
import { getDownloadUrl } from '@/lib/minio/presign';

export const config = {
  api: { bodyParser: false, sizeLimit: '20mb' },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    const files = await parseMultipart(req);

    if (!files.length) {
      console.log('⚠️ No files uploaded');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    console.log(
      '📁 Received files:',
      files.map((f) => f.fileName),
    );

    const results = [];

    for (const file of files) {
      try {
        // 1️⃣ validate dicom
        console.log(`🔍 Starting validation for: ${file.fileName}`);
        const isValid = isDicomFile(file.fileName, file.buffer);
        console.log(`📋 Validation result: ${isValid} for ${file.fileName}`);

        if (!isValid) {
          throw new Error('Invalid DICOM file');
        }

        // 2️⃣ idempotency check
        const hash = sha256(file.buffer);
        const existing = await findByHash(hash);
        if (existing) throw new Error('Duplicate file');

        console.log(`Processing file: ${file.fileName}, hash: ${hash}`);

        // 3️⃣ extract metadata
        const metadata = extractMetadata(file.buffer);

        // 4️⃣ upload to MinIO
        const objectKey = `${hash}.dcm`;
        await minioClient.putObject(
          process.env.MINIO_BUCKET!,
          objectKey,
          file.buffer,
        );

        console.log(`Uploaded file: ${file.fileName}`);

        // 5️⃣ save to DB
        await insertDicomRecord({
          hash,
          fileName: file.fileName,
          objectKey,
          metadata,
        });

        console.log(`Saved record for file: ${file.fileName}`);

        results.push({ file: file.fileName, status: 'success' });
      } catch (err: unknown) {
        console.error(`❌ Error processing ${file.fileName}:`, err);
        results.push({
          file: file.fileName,
          status: 'error',
          message: (err as Error).message,
        });
      }
    }
    res.status(200).json({ results });
  } else if (req.method == 'GET') {
    try {
      const files = await getAllDicomFiles();

      // generate signed URLs in parallel
      const filesWithUrls = await Promise.all(
        files.map(async (file) => ({
          id: file.id,
          fileName: file.file_name,
          patientId: file.patient_id,
          modality: file.modality,
          studyDate: file.study_date,
          createdAt: file.created_at,
          downloadUrl: await getDownloadUrl(file.object_key),
        })),
      );

      res.status(200).json(filesWithUrls);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch files' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
