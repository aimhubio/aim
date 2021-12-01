import React, { useRef, useState } from 'react';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';
import { Button, Icon } from 'components/kit';

import useResizeObserver from 'hooks/window/useResizeObserver';

import { ChartTypeEnum } from 'utils/d3';

import { IImageFullViewPopoverProps } from './types.d';

import './styles.scss';

function ImageFullViewPopover({
  imageData,
  imagesBlobs,
  tooltipContent,
  handleClose,
}: IImageFullViewPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const imageContainerRef = useRef<any>({});
  const [containerHeight, setContainerHeight] = useState(
    imageContainerRef?.current?.offsetHeight || 0,
  );

  useResizeObserver(
    () => setContainerHeight(imageContainerRef.current.offsetHeight),
    imageContainerRef,
  );
  return (
    <div className='ImageFullViewPopover'>
      <div
        ref={imageContainerRef}
        className='ImageFullViewPopover__imageContainer'
      >
        <img
          src={`data:image/${imageData.format};base64, ${
            imagesBlobs?.[imageData.blob_uri]
          }`}
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
