import { useState, useEffect } from 'react';
import { DicomFile } from '@/types/dicom';

export default function DicomList({
  initialFiles,
}: {
  initialFiles: DicomFile[];
}) {
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function refetch() {
      const res = await fetch('/api/dicom-files');
      const data = await res.json();
      setFiles(data);
    }
    refetch();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  return (
    <div className="shadow rounded-2xl p-4 h-105 flex flex-col">
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold">DICOM Files</h2>
        <span className="text-sm text-gray-500">Selected: {selected.size}</span>
      </div>

      <div className="overflow-y-auto flex-1 border rounded-lg">
        {files.length === 0 && (
          <div className="p-4 text-gray-500">No files uploaded yet</div>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 border-b hover:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.has(file.id)}
                onChange={() => toggleSelect(file.id)}
              />

              <div>
                <div className="font-medium">{file.fileName}</div>
                <div className="text-sm text-gray-300">
                  {file.modality} • {file.studyDate} • {file.patientId}
                </div>
              </div>
            </div>

            <a
              href={file.downloadUrl}
              target="_blank"
              className="text-blue-600 text-sm"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
