import { useEffect, useRef, useState } from 'react';

import { UploadItem, Result } from '@/types/dicom';

export default function UploadDicom() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newItems: UploadItem[] = Array.from(e.target.files).map((file) => ({
      file,
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

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

          return {
            ...item,
            status: result.status,
            message: result.message,
          };
        }),
      );
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

  return (
    <div className=" shadow rounded-2xl p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Upload DICOM Files</h2>

      <div className="border-2 border-dashed rounded-xl p-6 mb-4 text-center text-gray-500">
        Drag & Drop area coming soon
      </div>

      <input type="file" multiple accept=".dcm" onChange={handleFileSelect} />

      <button
        onClick={upload}
        disabled={uploading}
        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

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
