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
        width:
          (document.body.getBoundingClientRect().width < imageData.width
            ? document.body.getBoundingClientRect().width
            : imageData.width) +
          230 +
          'px',
        height:
          (document.body.getBoundingClientRect().height < imageData.height
            ? document.body.getBoundingClientRect().width
            : imageData.height) + 'px',
        maxHeight:
          (document.body.getBoundingClientRect().height < imageData.height
            ? document.body.getBoundingClientRect().width
            : imageData.height) -
          64 +
          'px',
      }}
    >
      <img
        src={`data:image/${imageData.format};base64, ${
          imagesBlobs?.[imageData.blob_uri]
        }`}
        alt=''
        style={{
          width:
            (document.body.getBoundingClientRect().width < imageData.width
              ? document.body.getBoundingClientRect().width
              : imageData.width) +
            230 +
            'px',
          height: '100%',
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
