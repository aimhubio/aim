import * as React from 'react';
import { FunctionComponent } from 'react';

import { PipelineStatusEnum } from 'modules/core/engine';
import { IVisualizationsProps } from 'modules/BaseExplorer/types';
import VisualizerPanel from 'modules/BaseExplorerNew/components/VisualizerPanel';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import ProgressBar from '../ProgressBar';

import './Visualizations.scss';

function Visualizations(props: IVisualizationsProps) {
  const {
    engine,
    engine: { pipeline, useStore },
    components,
    visualizers,
  } = props;

  const status = useStore(pipeline.statusSelector);
  console.log(engine);
  const Visualizations = React.useMemo(() => {
    return Object.keys(visualizers).map((name: string, index: number) => {
      const visualizer = visualizers[name];
      const Viz = visualizer.component as FunctionComponent;

      return (
        <Viz
          key={Viz.displayName || name}
          // @ts-ignore
          engine={engine}
          name={name}
          box={visualizer.box.component}
          panelRenderer={() => (
            <VisualizerPanel
              engine={engine}
              // @ts-ignore
              controls={visualizer.controlsContainer} // @TODO need to set "visualization.controls" instead of "components.controls"
              // @ts-ignore
              grouping={index === 0 ? components.grouping : null}
            />
          )}
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
