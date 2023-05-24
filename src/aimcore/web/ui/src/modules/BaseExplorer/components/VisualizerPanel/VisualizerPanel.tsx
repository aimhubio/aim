import * as React from 'react';

import { IVisualizerPanelProps } from '.';

import './VisualizerPanel.scss';

function VisualizerPanel(props: IVisualizerPanelProps) {
  const {
    grouping: Grouping,
    controls: Controls,
    engine,
    visualizationName,
  } = props;
  return (
    <div className='VisualizerPanel'>
      {Grouping && <Grouping engine={engine} />}
      {Controls && (
        <Controls engine={engine} visualizationName={visualizationName} />
      )}
    </div>
  );
}

VisualizerPanel.displayName = 'VisualizerPanel';

export default React.memo(VisualizerPanel);
