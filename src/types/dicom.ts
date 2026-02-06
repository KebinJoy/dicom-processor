export type DicomFile = {
  id: string;
  fileName: string;
  patientId?: string;
  modality?: string;
  studyDate?: string;
  downloadUrl: string;
};

export type Result = {
  file: string;
  status: 'success' | 'error';
  message?: string;
};

export type UploadItem = {
  file: File;
  status?: 'success' | 'error' | 'uploading';
  message?: string;
};
