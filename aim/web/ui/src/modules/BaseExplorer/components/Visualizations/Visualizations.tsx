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
