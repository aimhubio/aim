import React, { useCallback, useRef, useState } from 'react';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';
import { Button, Icon } from 'components/kit';

import useResizeObserver from 'hooks/window/useResizeObserver';

import blobsURIModel from 'services/models/media/blobsURIModel';

import { ChartTypeEnum } from 'utils/d3';

import { IImageFullViewPopoverProps } from './types.d';

import './styles.scss';

function ImageFullViewPopover({
  imageRendering,
  imageData,
  tooltipContent,
  handleClose,
}: IImageFullViewPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const blobData = blobsURIModel.getState()[imageData?.blob_uri];
  const imageContainerRef = useRef<any>({});
  const [containerHeight, setContainerHeight] = useState(
    imageContainerRef?.current?.offsetHeight || 0,
  );

  const setContainerHeightMemo = useCallback(
    () => setContainerHeight(imageContainerRef?.current?.offsetHeight || 0),
    [setContainerHeight],
  );

  useResizeObserver(setContainerHeightMemo, imageContainerRef);

  return (
    <div className='ImageFullViewPopover'>
      <div
        ref={imageContainerRef}
        className={`ImageFullViewPopover__imageContainer ImageFullViewPopover__imageContainer--${imageRendering}`}
      >
        <img
          src={`data:image/${imageData.format};base64, ${blobData}`}
          alt=''
          style={{
            maxHeight: containerHeight,
          }}
        />
      </div>

      <div className='ImageFullViewPopover__detailContainer'>
        <div className='ImageFullViewPopover__detailContainer__closeButtonContainer'>
          <Button
            withOnlyIcon
            size='small'
            onClick={handleClose}
            color='inherit'
          >
            <Icon name='close' />
          </Button>
        </div>
        <div className='ImageFullViewPopover__detailContainer__content'>
          <PopoverContent
            chartType={ChartTypeEnum.ImageSet}
            tooltipContent={tooltipContent}
            focusedState={{ active: true, key: null }}
          />
        </div>
      </div>
    </div>
  );
}

ImageFullViewPopover.displayName = 'ImageFullViewPopover';

export default React.memo<IImageFullViewPopoverProps>(ImageFullViewPopover);
