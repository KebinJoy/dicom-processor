import { useCallback, useEffect, useRef, useState } from 'react';

import { UploadItem, Result } from '@/types/dicom';

function fingerprint(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function UploadDicom({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = useCallback((fileList: FileList | File[] | null) => {
    if (!fileList) return;
    setItems((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const next: UploadItem[] = [...prev];

      Array.from(fileList).forEach((file) => {
        const id = fingerprint(file);
        if (!existingIds.has(id)) {
          next.push({ id, file });
          existingIds.add(id);
        }
      });

      return next;
    });
  }, []);
  const upload = async () => {
    if (!items.length || uploading) return;

    setUploading(true);
    abortRef.current = new AbortController();

    const formData = new FormData();
    items.forEach((i) => formData.append('file', i.file));
    setItems((prev) => prev.map((i) => ({ ...i, status: 'uploading' })));

    try {
      const res = await fetch('/api/dicom-files', {
        method: 'POST',
        body: formData,
        signal: abortRef.current.signal,
      });

      const data = await res.json();

      setItems((prev) =>
        prev.map((item) => {
          const result = data.results.find(
            (r: Result) => r.file === item.file.name,
          );
          if (!result) return item;
          return { ...item, status: result.status, message: result?.message };
        }),
      );

      onUploadSuccess();
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(err);
      }
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="shadow rounded-2xl p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Upload DICOM Files</h2>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-gray-900 mb-3">
          Drag & Drop DICOM files or click to select
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            upload();
          }}
          disabled={uploading}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".dcm"
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span
              className={
                item.status === 'error'
                  ? 'text-red-600'
                  : item.status === 'success'
                    ? 'text-green-600'
                    : ''
              }
            >
              {item.file.name}
            </span>
            <span className="text-gray-500">{item.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
