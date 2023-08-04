import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';
import ImageBox from 'components/ImageBox';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

function Image(props: IBoxContentProps) {
  return (
    <ErrorBoundary>
      <ImageBox
        engine={{ blobURI: props.engine.blobURI }}
        format={props.data.data.format}
        caption={props.data.data.caption}
        name={props.data.sequence.name}
        context={props.data.sequence.context}
        step={props.data.record.step}
        index={props.data.record.index}
        blobData={props.data.data.blobs.data}
        isFullView={props.isFullView}
      />
    </ErrorBoundary>
  );
}

export default React.memo(Image);
