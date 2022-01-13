import React from 'react';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { ITraceVisualizationContainerProps } from '../types';

/**
 * Higher order component for trace visualization component
 * @param TraceComponent
 */
function withEmptyTraceCheck(
  TraceComponent: (
    p: ITraceVisualizationContainerProps,
  ) => React.FunctionComponentElement<React.ReactNode>,
) {
  // eslint-disable-next-line react/display-name
  return (
    props: ITraceVisualizationContainerProps,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const traces = props?.traceInfo ? props?.traceInfo[props.traceType] : null;
    const emptyText = `No tracked ${props.traceType}`;
    if (!traces || !traces.length) {
      return (
        <IllustrationBlock
          size='large'
          className='TraceEmptyVisualizer'
          content={emptyText}
        />
      );
    }

    return <TraceComponent {...props} />;
  };
}

export default withEmptyTraceCheck;
