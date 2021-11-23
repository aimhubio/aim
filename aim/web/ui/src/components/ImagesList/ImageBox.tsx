import React, { memo, useEffect } from 'react';

import { Skeleton } from '@material-ui/lab';

import { batchCollectDelay } from 'config/imagesConfigs/imagesConfig';

const ImageBox = ({
  index,
  style,
  data,
  imagesBlobs,
  addUriToList,
  imageHeight,
}: any): React.FunctionComponentElement<React.ReactNode> => {
  const { format, blob_uri } = data;

  useEffect(() => {
    let timeoutID = setTimeout(() => addUriToList(blob_uri), batchCollectDelay);

    return () => {
      clearTimeout(timeoutID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div key={index} className='ImagesSet__container__imagesBox__imageBox'>
      <div style={style}>
        {imagesBlobs?.[blob_uri] ? (
          <img
            src={`data:image/${format};base64, ${imagesBlobs?.[blob_uri]}`}
            alt=''
          />
        ) : (
          <Skeleton
            variant='rect'
            height={imageHeight - 10}
            width={style.width - 10}
          />
        )}
      </div>
    </div>
  );
};

export default memo(ImageBox);
