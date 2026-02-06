import { Roboto } from 'next/font/google';
import { useEffect } from 'react';

const roboto = Roboto();

export default function OHIFViewerRemote() {
  const containerId = 'ohif';
  const config = {
    routerBasename: '/dicom/remote',
    servers: {
      dicomWeb: [
        {
          name: 'dicomweb',
          wadoUriRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
          qidoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
          wadoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
          qidoSupportsIncludeField: true,
          imageRendering: 'wadors',
          thumbnailRendering: 'wadors',
        },
      ],
    },
  };

  const componentRenderedOrUpdatedCallback = function () {
    console.log('OHIF Viewer rendered successfully');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // window.config = config;
      (async () => {
        const { installViewer } = await import('@ohif/viewer');

        installViewer(config, containerId, componentRenderedOrUpdatedCallback);
      })();
    }
  }, []);

  return (
    <div className={roboto.className}>
      <div id={containerId} style={{ width: '100%' }}></div>
    </div>
  );
}
