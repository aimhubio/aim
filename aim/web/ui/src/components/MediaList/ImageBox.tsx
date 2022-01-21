import React from 'react';
import classNames from 'classnames';

import { Skeleton } from '@material-ui/lab';
import { Dialog } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ImageFullViewPopover from 'components/ImageFullViewPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';
import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

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
        }, BATCH_COLLECT_DELAY);
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

  const skeletonSize = {
    width: style.width - 6, // 6px -> 0.375rem gap
    height:
      (additionalProperties.alignmentType !== MediaItemAlignmentEnum.Height
        ? style.width / (data.width / data.height)
        : mediaItemHeight - 10) - 6, // 6px -> 0.375rem gap,
  };
  return (
    <ErrorBoundary>
      <div className='MediaSet__container__mediaItemsList__imageBox'>
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
          data-seqkey={`${data.seqKey}`}
          data-mediasetitem='mediaSetItem'
        >
          <div className='MediaSet__container__mediaItemsList__imageBox__imageWrapper'>
            <div
              className={`MediaSet__container__mediaItemsList__imageBox__imageWrapper-item ${
                additionalProperties.alignmentType ===
                MediaItemAlignmentEnum.Height
                  ? 'MediaSet__container__mediaItemsList__imageBox__imageWrapper-item-heightAlign'
                  : ''
              }`}
            >
              {blobData ? (
                <img
                  src={`data:image/${format};base64, ${blobData}`}
                  alt={data.caption}
                />
              ) : (
                <Skeleton
                  variant='rect'
                  height={skeletonSize.height}
                  width={skeletonSize.width}
                />
              )}
              <Text style={{ maxWidth: style.width }} size={10} weight={400}>
                {data.caption}
              </Text>
            </div>
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
        </div>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default ImageBox;
