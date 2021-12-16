import React from 'react';
import classNames from 'classnames';

import { Skeleton } from '@material-ui/lab';
import { Dialog } from '@material-ui/core';

import { Button, Icon } from 'components/kit';
import ImageFullViewPopover from 'components/ImageFullViewPopover';

import { batchCollectDelay } from 'config/imagesConfigs/imagesConfig';

import blobsURIModel from 'services/models/media/blobsURIModel';

import { IImageBoxProps } from './MediaList.d';

const ImageBox = ({
  index,
  style,
  data,
  addUriToList,
  mediaItemHeight,
  focusedState,
  tooltip,
  syncHoverState,
  additionalProperties,
}: IImageBoxProps): React.FunctionComponentElement<React.ReactNode> => {
  const { format, blob_uri } = data;
  const [isImageFullViewPopupOpened, setIsImageFullViewPopupOpened] =
    React.useState<boolean>(false);
  let [blobData, setBlobData] = React.useState<string>(
    blobsURIModel.getState()[blob_uri] ?? null,
  );

  React.useEffect(() => {
    let timeoutID: number;
    let subscription: any;

    if (blobData === null) {
      if (blobsURIModel.getState()[blob_uri]) {
        setBlobData(blobsURIModel.getState()[blob_uri]);
      } else {
        subscription = blobsURIModel.subscribe(blob_uri, (data) => {
          setBlobData(data[blob_uri]);
          subscription.unsubscribe();
        });
        timeoutID = window.setTimeout(() => {
          if (blobsURIModel.getState()[blob_uri]) {
            setBlobData(blobsURIModel.getState()[blob_uri]);
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
    setIsImageFullViewPopupOpened(true);
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
    <div key={index} className='MediaSet__container__mediaItemsList__imageBox'>
      <div
        style={style}
        className={`MediaSet__container__mediaItemsList__imageBox__image MediaSet__container__mediaItemsList__imageBox__image--${
          additionalProperties.imageRendering
        } ${
          focusedState.key === data.key
            ? focusedState?.active
              ? ' focus'
              : ' active'
            : ''
        }`}
        data-key={`${data.key}`}
        //@ts-ignore
        data-seqkey={`${data.seqKey}`}
        data-mediasetitem={'mediaSetItem'}
        // onClick={onClick}
      >
        {blobData ? (
          <div className='MediaSet__container__mediaItemsList__imageBox__imageWrapper'>
            <img src={`data:image/${format};base64, ${blobData}`} alt='' />
            <Button
              withOnlyIcon
              size='small'
              className={classNames(
                'MediaSet__container__mediaItemsList__imageBox__imageWrapper__zoomIconWrapper',
                {
                  isHidden: !(focusedState.key === data.key),
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
            height={mediaItemHeight - 10}
            width={style?.width - 10}
          />
        )}
      </div>
      <Dialog
        onClose={() => setIsImageFullViewPopupOpened(false)}
        aria-labelledby='customized-dialog-title'
        className='MediaPanel__Container__imageFullViewPopup'
        open={isImageFullViewPopupOpened}
      >
        <ImageFullViewPopover
          imageRendering={additionalProperties?.imageRendering}
          tooltipContent={
            tooltip?.content || {
              caption: data.caption,
              images_name: data.images_name,
              context: data.context,
              step: data.step,
              index: data.index,
            }
          }
          imageData={data}
          handleClose={() => setIsImageFullViewPopupOpened(false)}
        />
      </Dialog>
    </div>
  );
};

export default ImageBox;
