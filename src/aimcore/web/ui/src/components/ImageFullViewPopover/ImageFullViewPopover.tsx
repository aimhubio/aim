import React from 'react';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';
import { Button, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import blobsURIModel from 'services/models/media/blobsURIModel';

import { ChartTypeEnum } from 'utils/d3';

import { IImageFullViewPopoverProps } from './types.d';

import './styles.scss';

function ImageFullViewPopover({
  imageRendering,
  imageData,
  tooltipContent,
  handleClose,
  selectOptions,
  onRunsTagsChange,
}: IImageFullViewPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const blobData = blobsURIModel.getState()[imageData?.blob_uri];

  return (
    <ErrorBoundary>
      <div className='ImageFullViewPopover'>
        <div
          className={`ImageFullViewPopover__imageContainer ImageFullViewPopover__imageContainer--${imageRendering}`}
        >
          <div className='ImageFullViewPopover__imageContainer__imageBox'>
            <img
              src={`data:image/${imageData.format};base64, ${blobData}`}
              style={{
                maxWidth: imageData.width,
                maxHeight: imageData.height,
              }}
              alt={imageData.caption}
            />
          </div>
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
            <ErrorBoundary>
              <PopoverContent
                chartType={ChartTypeEnum.ImageSet}
                tooltipContent={tooltipContent}
                focusedState={{ active: true, key: null }}
                selectOptions={selectOptions}
                onRunsTagsChange={onRunsTagsChange}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

ImageFullViewPopover.displayName = 'ImageFullViewPopover';

export default React.memo<IImageFullViewPopoverProps>(ImageFullViewPopover);
