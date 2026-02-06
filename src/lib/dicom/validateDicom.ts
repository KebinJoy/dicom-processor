export function isDicomFile(fileName: string, _buffer: Buffer) {
  console.log('🔍 validateDicom - fileName:', fileName);

  const lowerFileName = fileName.toLowerCase();
  if (!lowerFileName.endsWith('.dcm')) {
    console.log('❌ validateDicom - Failed: File does not end with .dcm');
    return false;
  }

  // disable signature check for now since some files may not have it

  // // DICOM signature: bytes 128–131 should be "DICM"
  // const signature = _buffer.toString('utf8', 128, 132);
  // console.log('🔍 validateDicom - signature check:', { signature, expected: 'DICM', matches: signature === 'DICM' });

  // if (signature !== 'DICM') {
  //   console.log('❌ validateDicom - Failed: Invalid DICOM signature');
  //   return false;
  // }

  console.log('✅ validateDicom - Passed');
  return true;
}
