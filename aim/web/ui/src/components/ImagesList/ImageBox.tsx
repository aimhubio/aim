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
  focusedState,
  syncHoverState,
}: any): React.FunctionComponentElement<React.ReactNode> => {
  const { format, blob_uri } = data;

  useEffect(() => {
    let timeoutID = setTimeout(() => {
      addUriToList(blob_uri);
    }, batchCollectDelay);

    return () => {
      clearTimeout(timeoutID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO need to add focused image logic
  // function safeSyncHoverState(args: any): void {
  //   if (typeof syncHoverState === 'function') {
  //     syncHoverState(args);
  //   }
  // }
  //
  // function onClick(e: MouseEvent<HTMLDivElement>): void {
  //   if (e?.currentTarget) {
  //     e.stopPropagation();
  //     const clientRect = e.currentTarget.getBoundingClientRect();
  //     safeSyncHoverState({
  //       activePoint: { clientRect, key: data.key, seqKey: data.seqKey },
  //       focusedStateActive: true,
  //     });
  //   }
  // }

  return (
    <div key={index} className='ImagesSet__container__imagesBox__imageBox'>
      <div
        style={style}
        className={`ImagesSet__container__imagesBox__imageBox__image ${
          focusedState.key === data.key
            ? focusedState?.active
              ? ' focus'
              : ' active'
            : ''
        }`}
        data-key={`${data.key}`}
        data-seqkey={`${data.seqKey}`}
        // onClick={onClick}
      >
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
