import * as React from 'react';
import _ from 'lodash-es';

import VisualizationLegends from 'components/VisualizationLegends';
import ResizeElement, {
  ResizableElement,
  ResizableSideEnum,
} from 'components/ResizeElement';
import ResizingFallback from 'components/ResizingFallback';

import { IVisualizerLegendsProps } from './index';

import './VisualizerLegends.scss';

function VisualizerLegends(props: IVisualizerLegendsProps) {
  const {
    containerNode,
    engine,
    engine: { useStore, pipeline },
    visualizationName,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const legends = useStore(controls.legends.stateSelector);
  const dataState = useStore(pipeline.dataSelector);
  const foundGroups = useStore(pipeline.foundGroupsSelector);

  const [initialSizes, setInitialSizes] = React.useState({
    width: 200,
    maxHeight: containerNode.offsetHeight,
    maxWidth: containerNode.offsetWidth,
  });

  const legendsData = {};

  const displayLegends = React.useMemo(
    (): boolean => !!legends?.display && !_.isEmpty(legendsData),
    [legends?.display, legendsData],
  );

  React.useEffect(() => {
    setInitialSizes((prev) => ({
      ...prev,
      maxHeight: containerNode.offsetHeight,
      maxWidth: containerNode.offsetWidth,
    }));
  }, [containerNode.offsetHeight, containerNode.offsetWidth]);

  return displayLegends ? (
    <div className='VisualizerLegends pinToRight'>
      <ResizeElement
        id={`${visualizationName}-Legends-ResizeElement`}
        side={ResizableSideEnum.LEFT}
        snapOffset={80}
        useLocalStorage={true}
        initialSizes={initialSizes}
      >
        <ResizableElement resizingFallback={<ResizingFallback />}>
          <div className='VisualizerLegends__container'>
            <VisualizationLegends data={legendsData} mode={legends?.mode} />
          </div>
        </ResizableElement>
      </ResizeElement>
    </div>
  ) : null;
}

VisualizerLegends.displayName = 'VisualizerLegends';

export default React.memo(VisualizerLegends);
