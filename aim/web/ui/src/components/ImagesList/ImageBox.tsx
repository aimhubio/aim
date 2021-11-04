import React, { memo, useEffect } from 'react';

import { Skeleton } from '@material-ui/lab';

const ImageBox = ({
  index,
  style,
  data,
  imagesBlobs,
  addUriToList,
}: any): React.FunctionComponentElement<React.ReactNode> => {
  const { format, blob_uri, height, width } = data;

  useEffect(() => {
    addUriToList(blob_uri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div key={index} className='ImagesSet__container__imagesBox__imageBox'>
      <div style={style}>
        {imagesBlobs?.[blob_uri] ? (
          <img
            style={{ height, width }}
            src={`data:image/${format};base64, ${imagesBlobs?.[blob_uri]}`}
            alt=''
          />
        ) : (
          <Skeleton variant='rect' height={height} width={width} />
        )}
      </div>
    </div>
  );
};

export default memo(ImageBox);
