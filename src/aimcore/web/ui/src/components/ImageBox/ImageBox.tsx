import React from 'react';
import { useImageBlobURI } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary';
import { Spinner } from 'components/kit';

import { ImageBoxProps } from './';

function ImageBox(props: ImageBoxProps) {
  const { data, caption } = useImageBlobURI(props);

  return (
    <ErrorBoundary>
      <div style={props.style}>
        {data.src ? (
          <img
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            src={data.src}
            alt={caption}
          />
        ) : (
          <Spinner size={24} thickness={2} />
        )}
      </div>
    </ErrorBoundary>
  );
}
export default ImageBox;
