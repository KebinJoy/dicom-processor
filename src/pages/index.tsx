import DicomList from '@/components/DicomList';
import UploadDicom from '@/components/DicomUploader';
import { DicomFile } from '@/types/dicom';
import { GetServerSideProps } from 'next';

type Props = {
  initialFiles: DicomFile[];
};

export default function DicomPage({ initialFiles }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <DicomList initialFiles={initialFiles} />
      <UploadDicom />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/dicom-files`);
  const data = await res.json();

  return {
    props: {
      initialFiles: data,
    },
  };
};
