import React from 'react';
import classNames from 'classnames';

import { Skeleton } from '@material-ui/lab';

import { Button, Icon } from 'components/kit';

import { batchCollectDelay } from 'config/imagesConfigs/imagesConfig';

import imagesURIModel from 'services/models/imagesExplore/imagesURIModel';

const ImageBox = ({
  index,
  style,
  data,
  addUriToList,
  imageHeight,
  focusedState,
  syncHoverState,
  hoveredImageKey,
  setImageFullMode,
  setImageFullModeData,
}: any): React.FunctionComponentElement<React.ReactNode> => {
  const { format, blob_uri } = data;

  let [blobData, setBlobData] = React.useState<string>(
    imagesURIModel.getState()[blob_uri] ?? null,
  );

  React.useEffect(() => {
    let timeoutID: number;
    let subscription: any;

    if (blobData === null) {
      if (imagesURIModel.getState()[blob_uri]) {
        setBlobData(imagesURIModel.getState()[blob_uri]);
      } else {
        subscription = imagesURIModel.subscribe(blob_uri, (data) => {
          setBlobData(data[blob_uri]);
          subscription.unsubscribe();
        });
        timeoutID = window.setTimeout(() => {
          if (imagesURIModel.getState()[blob_uri]) {
            setBlobData(imagesURIModel.getState()[blob_uri]);
            subscription.unsubscribe();
          } else {
            addUriToList(blob_uri);
          }
        }, batchCollectDelay);
      }
    }

    return () => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  function onImageFullSizeModeButtonClick(e: React.ChangeEvent<any>): void {
    e.stopPropagation();
    setImageFullMode(true);
    setImageFullModeData(data);
  }
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
        {blobData ? (
          <div className='ImagesSet__container__imagesBox__imageBox__imageWrapper'>
            <img src={`data:image/${format};base64, ${blobData}`} alt='' />
            <Button
              withOnlyIcon
              size='small'
              className={classNames(
                'ImagesSet__container__imagesBox__imageBox__imageWrapper__zoomIconWrapper',
                {
                  isHidden: !(hoveredImageKey === data.key),
                },
              )}
              onClick={onImageFullSizeModeButtonClick}
              color='inherit'
            >
              <Icon name='zoom-in' fontSize={14} />
            </Button>
          </div>
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

export default ImageBox;
