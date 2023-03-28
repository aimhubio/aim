import React from 'react';

import { Divider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';

import {
  Alignment,
  IConfigureAxesPopoverProps,
  AxesRange,
  AxesType,
} from './index';

import './ConfigureAxesPopover.scss';

function ConfigureAxesPopover(props: IConfigureAxesPopoverProps) {
  const {
    visualizationName,
    engine,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const axesProps = useStore(vizEngine.controls.axesProperties.stateSelector);

  return (
    <ErrorBoundary>
      <div className='ConfigureAxesPopover'>
        <Alignment
          engine={engine}
          visualizationName={visualizationName}
          alignmentConfig={axesProps.alignment}
        />
        <Divider className='ConfigureAxesPopover__divider' />
        <AxesRange
          engine={engine}
          visualizationName={visualizationName}
          axesRangeConfig={axesProps.axesScaleRange}
        />
        <Divider className='ConfigureAxesPopover__divider' />
        <AxesType
          engine={engine}
          visualizationName={visualizationName}
          axesTypeConfig={axesProps.axesScaleType}
        />
      </div>
    </ErrorBoundary>
  );
}

ConfigureAxesPopover.displayName = 'ConfigureAxesPopover';

export default React.memo(ConfigureAxesPopover);
