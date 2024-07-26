import * as React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';
import FigureBox from 'components/FigureBox';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

function Figure(props: IBoxContentProps) {
  return (
    <ErrorBoundary>
      <FigureBox
        engine={{ blobURI: props.engine.blobURI }}
        format={props.data.data.format}
        name={props.data.sequence.name}
        context={props.data.sequence.context}
        step={props.data.record.step}
        blobData={props.data.data.blobs.data}
        isFullView={props.isFullView}
      />
    </ErrorBoundary>
  );
}

export default React.memo(Figure);
