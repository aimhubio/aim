import * as React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine';
import { IVisualizationsProps } from 'modules/BaseExplorer/types';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import ProgressBar from '../ProgressBar';
import VisualizerPanel from '../VisualizerPanel';

import './Visualizations.scss';

function Visualizations(props: IVisualizationsProps) {
  const {
    engine,
    engine: { pipelineStatusSelector, useStore },
    components,
  } = props;

  const status = useStore(pipelineStatusSelector);

  const Visualizations = React.useMemo(
    () =>
      components.visualizations.map((Viz, index) => (
        <Viz
          key={Viz.displayName}
          engine={engine}
          box={components.box}
          panelRenderer={() => (
            <VisualizerPanel
              engine={engine}
              controls={components.controls} // @TODO need to set "visualization.controls" instead of "components.controls"
              grouping={index === 0 ? components.grouping : null}
            />
          )}
        />
      )),
    [
      engine,
      components.box,
      components.controls,
      components.visualizations,
      components.grouping,
    ],
  );

  const renderIllustration = React.useMemo(
    () =>
      [
        PipelineStatusEnum.NeverExecuted,
        PipelineStatusEnum.Empty,
        PipelineStatusEnum.Insufficient_Resources,
      ].indexOf(status) !== -1,
    [status],
  );

  return (
    <div className='Visualizations'>
      <ProgressBar engine={engine} />
      {renderIllustration ? (
        <IllustrationBlock size='xLarge' page='figures' type={status} />
      ) : (
        Visualizations
      )}
    </div>
  );
}

Visualizations.displayName = 'Visualizations';

export default React.memo<IVisualizationsProps>(Visualizations);
