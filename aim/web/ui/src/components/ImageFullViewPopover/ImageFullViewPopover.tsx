import React from 'react';

import { IImageFullViewPopoverProps } from './types.d';

import './styles.scss';

function ImageFullViewPopover({
  imageData,
  imagesBlobs,
}: IImageFullViewPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div
      className='ImageFullViewPopover'
      style={{
        width:
          (document.body.getBoundingClientRect().width < imageData.width + 100
            ? document.body.getBoundingClientRect().width
            : imageData.width) +
          100 +
          'px',
        height:
          (document.body.getBoundingClientRect().height < imageData.height + 100
            ? document.body.getBoundingClientRect().width
            : imageData.height) +
          100 +
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
              : imageData.width) + 'px',
          height:
            (document.body.getBoundingClientRect().height < imageData.height
              ? document.body.getBoundingClientRect().width
              : imageData.height) + 'px',
          objectFit: 'fill',
        }}
      />
    </div>
  );
}

ImageFullViewPopover.displayName = 'ImageFullViewPopover';

export default React.memo<IImageFullViewPopoverProps>(ImageFullViewPopover);
