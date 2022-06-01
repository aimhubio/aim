import React from 'react';
import { isEmpty } from 'lodash-es';
import classNames from 'classnames';

import { Skeleton } from '@material-ui/lab';
import { Dialog } from '@material-ui/core';

import { throttle } from 'components/Table/utils';
import { Button, Icon, Text } from 'components/kit';

import {
  BATCH_COLLECT_DELAY,
  BATCH_SEND_DELAY,
} from 'config/mediaConfigs/mediaConfigs';

import blobsURIModel from 'services/models/media/blobsURIModel';
import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';

import ImageFullViewPopover from '../../../components/ImageFullViewPopover';

import 'components/MediaSet/MediaSet.scss';

const getBlobsData = imagesExploreAppModel.getImagesBlobsData;

const blobUriArray: { current: string[] } = {
  current: [],
};

const timeoutID: { current: number } = {
  current: 0,
};

const requestRef: { current: any } = {
  current: null,
};

function addUriToList(blobUrl: string) {
  if (!blobsURIModel.getState()[blobUrl]) {
    blobUriArray.current.push(blobUrl);
    getBatch();
  }
}

const getBatch = throttle(() => {
  if (timeoutID.current) {
    // @ts-ignore
    window.clearTimeout(timeoutID.current);
  }
  timeoutID.current = window.setTimeout(() => {
    if (!isEmpty(blobUriArray.current)) {
      requestRef.current = getBlobsData(blobUriArray.current);
      requestRef.current.call().then(() => {
        blobUriArray.current = [];
      });
    }
  }, BATCH_SEND_DELAY);
}, BATCH_SEND_DELAY);

function Image(props: any) {
  const { format, blob_uri } = props.data;
  const [isImageFullViewPopupOpened, setIsImageFullViewPopupOpened] =
    React.useState<boolean>(false);
  let [blobData, setBlobData] = React.useState<string>(
    blobsURIModel.getState()[blob_uri] ?? null,
  );

  function onImageFullSizeModeButtonClick(e: React.ChangeEvent<any>): void {
    e.stopPropagation();
    setIsImageFullViewPopupOpened(true);
  }

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
  }, [addUriToList, blobData, blob_uri]);

  return (
    <div
      className='ImageBox__image ImageBox__image'
      data-mediasetitem='mediaSetItem'
    >
      <div className='ImageBox__imageWrapper'>
        <div className='ImageBox__imageWrapper-item'>
          {blobData ? (
            <img
              src={`data:image/${format};base64, ${blobData}`}
              alt={props.data.caption}
            />
          ) : (
            <div
              style={{
                height: props.visuals.height,
                width: props.visuals.width,
              }}
              className='skeletonContainer'
            >
              <Skeleton
                variant='rect'
                height={props.visuals.height}
                width={props.visuals.width}
              />
            </div>
          )}
          <Text
            style={{ maxWidth: props.visuals.width }}
            size={10}
            weight={400}
          >
            {props.data.caption}
          </Text>
        </div>
        <Button
          withOnlyIcon
          size='small'
          className={classNames('ImageBox__imageWrapper__zoomIconWrapper', {
            isHidden: false,
          })}
          onClick={onImageFullSizeModeButtonClick}
          color='inherit'
        >
          <Icon name='zoom-in' fontSize={14} />
        </Button>
        <Dialog
          onClose={() => setIsImageFullViewPopupOpened(false)}
          aria-labelledby='customized-dialog-title'
          className='MediaPanel__Container__imageFullViewPopup'
          open={isImageFullViewPopupOpened}
        >
          <ImageFullViewPopover
            imageRendering={'r'}
            tooltipContent={{
              context: props.images,
              mediaContent: {
                step: props.data.step,
                index: props.data.index,
                caption: props.data.caption,
                images_name: props.images.name,
              },
            }}
            imageData={props.data}
            handleClose={() => setIsImageFullViewPopupOpened(false)}
          />
        </Dialog>
      </div>
    </div>
  );
}

export default Image;
