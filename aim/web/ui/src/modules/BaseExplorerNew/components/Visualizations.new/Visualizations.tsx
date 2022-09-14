import * as React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine';
import { IVisualizationsProps } from 'modules/BaseExplorer/types';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import ProgressBar from '../ProgressBar';

import './Visualizations.scss';

function Visualizations(props: IVisualizationsProps) {
  const {
    engine,
    engine: { pipeline, useStore },
    visualizers,
  } = props;

  const status = useStore(pipeline.statusSelector);

  const Visualizations = React.useMemo(() => {
    return Object.keys(visualizers).map((name: string) => {
      const visualizer = visualizers[name];
      const Viz = visualizer.component;

      return (
        /* @ts-ignore*/
        <Viz
          /* @ts-ignore*/
          key={Viz.displayName || name}
          engine={engine}
          box={visualizer.box.component}
          controlComponent={visualizer.controlsContainer}
        />
      );
    });
  }, [engine, visualizers]);

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
