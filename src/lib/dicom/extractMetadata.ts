import dicomParser from 'dicom-parser';

export function extractMetadata(buffer: Buffer) {
  try {
    const byteArray = new Uint8Array(buffer);
    const dataSet = dicomParser.parseDicom(byteArray);

    console.log('🔍 extractMetadata - Extracting metadata...');

    // Helper function to safely extract string fields without throwing
    const getString = (tag: string): string | undefined => {
      try {
        return dataSet.string(tag);
      } catch (err) {
        console.log(`⚠️ Field ${tag} not found or error reading it`);
        return undefined;
      }
    };

    const metadata = {
      patientId: getString('x00100020'),
      patientName: getString('x00100010'),
      patientBirthDate: getString('x00100030'),
      studyInstanceUID: getString('x0020000d'),
      seriesInstanceUID: getString('x0020000e'),
      sopInstanceUID: getString('x00080018'),
      modality: getString('x00080060'),
      studyDate: getString('x00080020'),
    };

    console.log('✅ extractMetadata - Metadata extracted:', metadata);
    return metadata;
  } catch (err) {
    console.error('❌ extractMetadata - Error parsing DICOM:', err);
    throw new Error('Failed to parse DICOM file: ' + (err as Error).message);
  }
}
