import React from 'react';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';
import { Button, Icon } from 'components/kit';

import { ChartTypeEnum } from 'utils/d3';

import { IImageFullViewPopoverProps } from './types.d';

import './styles.scss';

function ImageFullViewPopover({
  imageData,
  imagesBlobs,
  tooltipContent,
  handleClose,
}: IImageFullViewPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div
      className='ImageFullViewPopover'
      style={{
        height: 'auto',
        maxHeight:
          (document.body.getBoundingClientRect().height - 64 < imageData.height
            ? document.body.getBoundingClientRect().height - 64
            : imageData.height) + 'px',
      }}
    >
      <img
        src={`data:image/${imageData.format};base64, ${
          imagesBlobs?.[imageData.blob_uri]
        }`}
        alt=''
        style={{
          maxHeight:
            (document.body.getBoundingClientRect().height - 64 <
            imageData.height
              ? document.body.getBoundingClientRect().height - 64
              : imageData.height) + 'px',
          maxWidth: 'calc(100% - 230px)',
          objectFit: 'fill',
        }}
      />
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

        <PopoverContent
          chartType={ChartTypeEnum.ImageSet}
          tooltipContent={tooltipContent}
          focusedState={{ active: true, key: null }}
        />
      </div>
    </div>
  );
}

ImageFullViewPopover.displayName = 'ImageFullViewPopover';

export default React.memo<IImageFullViewPopoverProps>(ImageFullViewPopover);
