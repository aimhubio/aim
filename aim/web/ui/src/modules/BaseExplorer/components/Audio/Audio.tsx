import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';
import AudioBox from 'components/AudioBox';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

function Audio(props: IBoxContentProps) {
  return (
    <ErrorBoundary>
      <AudioBox
        engine={{ events: props.engine.events, blobURI: props.engine.blobURI }}
        format={props.data.data.format}
        caption={props.data.data.caption}
        name={props.data.audios.name}
        context={props.data.audios.context}
        step={props.data.record.step}
        index={props.data.record.index}
        blobData={props.data.data.blob_uri}
        isFullView={props.isFullView}
      />
    </ErrorBoundary>
  );
}

export default React.memo(Audio);
