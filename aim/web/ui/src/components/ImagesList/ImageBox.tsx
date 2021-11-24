import React, { memo, MouseEvent, useEffect, useRef } from 'react';
import { isEqual } from 'lodash-es';

import { Skeleton } from '@material-ui/lab';

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
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutID = setTimeout(() => addUriToList(blob_uri), 900);

    return () => {
      clearTimeout(timeoutID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function safeSyncHoverState(args: any): void {
    if (typeof syncHoverState === 'function') {
      syncHoverState(args);
    }
  }

  function onClick(e: MouseEvent<HTMLDivElement>): void {
    if (e?.currentTarget) {
      e.stopPropagation();
      const clientRect = e.currentTarget.getBoundingClientRect();
      safeSyncHoverState({
        activePoint: { clientRect, key: data.key, seqKey: data.seqKey },
        focusedStateActive: true,
      });
    }
  }

  function onMouseEnter(e: MouseEvent<HTMLDivElement>): void {
    if (e?.currentTarget && !focusedState?.active) {
      const clientRect = e.currentTarget.getBoundingClientRect();
      safeSyncHoverState({
        activePoint: { clientRect, key: data.key, seqKey: data.seqKey },
      });
    }
  }

  function onMouseLeave(e: MouseEvent<HTMLDivElement>): void {
    if (!focusedState?.active) {
      safeSyncHoverState({ activePoint: null });
    }
  }

  return (
    <div key={index} className='ImagesSet__container__imagesBox__imageBox'>
      <div
        ref={boxRef}
        style={style}
        className={
          focusedState?.active && focusedState.key === data.key ? 'active' : ''
        }
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
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
