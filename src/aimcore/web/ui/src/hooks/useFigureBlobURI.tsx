import React from 'react';
import { PlotParams } from 'react-plotly.js';

import { FigureBoxProps } from 'components/FigureBox';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

function useFigureBlobURI({
  engine: { blobURI },
  format,
  blobData: blob_uri,
  isFullView,
}: FigureBoxProps) {
  const initialBlobData = blobURI.getBlobData(blob_uri);

  const [data, setData] = React.useState<PlotParams | null>(
    initialBlobData ? JSON.parse(initialBlobData) : null,
  );

  React.useEffect(() => {
    let timeoutID: number;
    let unsubscribe: () => void;

    const setBlobData = (blobData: string) => {
      setData(blobData ? JSON.parse(blobData) : null);
    };

    if (data === null) {
      const currentBlobData = blobURI.getBlobData(blob_uri);
      if (currentBlobData) {
        setBlobData(currentBlobData);
      } else {
        unsubscribe = blobURI.on(blob_uri, (blobData: string) => {
          setBlobData(blobData);
          unsubscribe();
        });
        timeoutID = window.setTimeout(() => {
          const currentBlobData = blobURI.getBlobData(blob_uri);
          if (currentBlobData) {
            setBlobData(currentBlobData);
            unsubscribe();
          } else {
            blobURI.addUriToQueue(blob_uri);
          }
        }, BATCH_COLLECT_DELAY);
      }
    }

    return () => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [blob_uri, data, blobURI, format, isFullView]);

  return {
    data,
  };
}

export default useFigureBlobURI;
