import { pool } from './postgres';

export async function findByHash(hash: string) {
  try {
    console.log('🔍 Querying database for hash:', hash);
    const res = await pool.query(
      'SELECT * FROM dicom_files WHERE file_hash = $1',
      [hash],
    );
    console.log('✅ Query successful:', res.rows.length, 'rows found');
    return res.rows[0];
  } catch (err) {
    console.error('❌ Database query error:', err);
    throw err;
  }
}

type DicomFileRecord = {
  hash: string;
  fileName: string;
  objectKey: string;
  metadata: {
    patientId?: string;
    patientName?: string;
    patientBirthDate?: string;
    studyInstanceUID?: string;
    seriesInstanceUID?: string;
    sopInstanceUID?: string;
    modality?: string;
    studyDate?: string;
  };
};

export async function insertDicomRecord(record: DicomFileRecord) {
  try {
    await pool.query(
      `INSERT INTO dicom_files
       (file_hash, file_name, object_key, patient_id, patient_name, patient_birth_date,
        study_instance_uid, series_instance_uid, sop_instance_uid, modality, study_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        record.hash,
        record.fileName,
        record.objectKey,
        record.metadata.patientId,
        record.metadata.patientName,
        record.metadata.patientBirthDate,
        record.metadata.studyInstanceUID,
        record.metadata.seriesInstanceUID,
        record.metadata.sopInstanceUID,
        record.metadata.modality,
        record.metadata.studyDate,
      ],
    );
  } catch (err) {
    console.error('❌ Database insert error:', err);
    throw err;
  }
}
