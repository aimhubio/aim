import * as React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine/types';
import { IVisualizationsProps } from 'modules/BaseExplorer/types';
import VisualizerPanel from 'modules/BaseExplorer/components/VisualizerPanel';
import VisualizerRangePanel from 'modules/BaseExplorer/components/RangePanel';

import ProgressBar from '../ProgressBar';

import './Visualizations.scss';

function Visualizations(props: IVisualizationsProps) {
  const {
    engine,
    engine: { pipeline, useStore },
    components,
    visualizers,
    getStaticContent,
  } = props;

  const status: PipelineStatusEnum = useStore(pipeline.statusSelector);

  const Visualizations: React.ReactNode = React.useMemo(
    () =>
      Object.keys(visualizers).map((name: string, index: number) => {
        const visualizer = visualizers[name];
        const VisualizerComponent = visualizer.component;

        return VisualizerComponent ? (
          <VisualizerComponent
            key={VisualizerComponent.displayName || name}
            engine={engine}
            name={name}
            box={visualizer.box.component}
            boxStacking={visualizer.box.stacking}
            topPanelRenderer={() => (
              <VisualizerPanel
                engine={engine}
                controls={visualizer.controlsContainer}
                grouping={index === 0 ? components.grouping : null}
                visualizationName={name}
              />
            )}
            bottomPanelRenderer={() => <VisualizerRangePanel engine={engine} />}
            widgets={visualizer.widgets}
          />
        ) : null;
      }),
    [components, engine, visualizers],
  );

  const Content = React.useMemo(() => {
    if (typeof getStaticContent === 'function') {
      return getStaticContent(status) || Visualizations;
    }
    return Visualizations;
  }, [status, Visualizations, getStaticContent]);

  return (
    <div className='Visualizations'>
      <ProgressBar engine={engine} />
      {Content}
    </div>
  );
}

Visualizations.displayName = 'Visualizations';

export default React.memo<IVisualizationsProps>(Visualizations);
