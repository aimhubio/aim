import * as React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine';
import { IVisualizationsProps } from 'modules/BaseExplorer/types';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import ProgressBar from '../ProgressBar';

import './Visualizations.scss';

function Visualizations(props: IVisualizationsProps) {
  const {
    engine,
    engine: { pipelineStatusSelector, useStore },
    components,
  } = props;

  const status = useStore(pipelineStatusSelector);

  const Visualizations = React.useMemo(() => {
    return components.visualizations.map((Viz) => (
      <Viz
        key={Viz.displayName}
        engine={engine}
        box={components.box}
        controlComponent={components.controls}
      />
    ));
  }, [engine, components.box, components.controls, components.visualizations]);

  return (
    <div className='Visualizations'>
      <ProgressBar engine={engine} />
      {status === PipelineStatusEnum.NeverExecuted ||
      status === PipelineStatusEnum.Empty ||
      status === PipelineStatusEnum.Insufficient_Resources ? (
        <IllustrationBlock size='xLarge' page='figures' type={status} />
      ) : (
        Visualizations
      )}
    </div>
  );
}

Visualizations.displayName = 'Visualizations';

export default React.memo<IVisualizationsProps>(Visualizations);
