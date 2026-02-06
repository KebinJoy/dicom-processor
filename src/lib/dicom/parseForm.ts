import formidable from 'formidable';
import fs from 'fs/promises';
import { IncomingMessage } from 'http';

export async function parseMultipart(req: IncomingMessage) {
  const form = formidable({ multiples: true });

  const [, files] = await form.parse(req);

  const uploaded = Array.isArray(files.file) ? files.file : [files.file];

  const buffers = await Promise.all(
    uploaded
      .filter((file): file is formidable.File => file !== undefined)
      .map(async (file: formidable.File) => ({
        fileName: file.originalFilename!,
        buffer: await fs.readFile(file.filepath),
      })),
  );

  return buffers;
}
