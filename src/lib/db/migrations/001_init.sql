CREATE TABLE IF NOT EXISTS dicom_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_hash TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  object_key TEXT NOT NULL,
  patient_id TEXT,
  patient_name TEXT,
  patient_birth_date TEXT,
  study_instance_uid TEXT,
  series_instance_uid TEXT,
  sop_instance_uid TEXT,
  modality TEXT,
  study_date TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);