import React from 'react';

import { ImageBoxProps } from 'components/ImageBox';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

function useImageBlobURI({
  engine: { blobURI },
  format,
  caption,
  name,
  step,
  index,
  blobData: blob_uri,
}: ImageBoxProps) {
  const initialBlobData = blobURI.getBlobData(blob_uri);
  const initialSrc =
    initialBlobData && format
      ? `data:image/${format};base64,${initialBlobData}`
      : '';

  const [data, setData] = React.useState({
    blobData: initialBlobData,
    src: initialSrc,
  });

  React.useEffect(() => {
    let timeoutID: number;
    let unsubscribe: () => void;

    const setBlobDataAndSrc = (blobData: string, format: string) => {
      setData({
        blobData,
        src: `data:image/${format};base64,${blobData}`,
      });
    };

    if (data.blobData === null) {
      const currentBlobData = blobURI.getBlobData(blob_uri);
      if (currentBlobData) {
        setBlobDataAndSrc(currentBlobData, format);
      } else {
        unsubscribe = blobURI.on(blob_uri, (blobData: string) => {
          setBlobDataAndSrc(blobData, format);
          unsubscribe();
        });
        timeoutID = window.setTimeout(() => {
          const currentBlobData = blobURI.getBlobData(blob_uri);
          if (currentBlobData) {
            setBlobDataAndSrc(currentBlobData, format);
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
  }, [data.blobData, blobURI, blob_uri, format]);

  return {
    data,
    caption,
    name,
    step,
    index,
  };
}

export default useImageBlobURI;
