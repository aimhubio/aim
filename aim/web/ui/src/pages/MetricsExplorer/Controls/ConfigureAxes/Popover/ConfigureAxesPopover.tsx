import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';

import { Alignment, IConfigureAxesPopoverProps } from './';

import './ConfigureAxesPopover.scss';

export const RANGE_DEBOUNCE_DELAY = 300;

function ConfigureAxesPopover(props: IConfigureAxesPopoverProps) {
  const {
    visualizationName,
    engine,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const updateAxesProps = vizEngine.controls.axesProperties.methods.update;
  const axesProps = useStore(vizEngine.controls.axesProperties.stateSelector);

  return (
    <ErrorBoundary>
      <div className='ConfigureAxesPopover'>
        <Alignment engine={engine} visualizationName={visualizationName} />
      </div>
    </ErrorBoundary>
  );
}

ConfigureAxesPopover.displayName = 'ConfigureAxesPopover';

export default React.memo(ConfigureAxesPopover);
