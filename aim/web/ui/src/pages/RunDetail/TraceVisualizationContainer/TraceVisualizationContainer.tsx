import React from 'react';

import Menu from 'components/kit/Menu/Menu';

import useModel from 'hooks/model/useModel';

import runTracesModel from 'services/models/runs/runTracesModel';
import * as analytics from 'services/analytics';
import { VisualizationMenuTitles } from 'services/models/runs/util';

import DistributionsVisualizer from '../DistributionsVisualizer';
import TextsVisualizer from '../TextsVisualizer';
import ImagesVisualizer from '../ImagesVisualizer';
import PlotlyVisualizer from '../PlotlyVisualizer';
import { ITraceVisualizationContainerProps } from '../types';
import AudiosVisualizer from '../AudiosVisualizer';

import RangePanel from './RangePanel';
import withEmptyTraceCheck from './withEmptyTraceCheck';

import './TraceVisualizationContainer.scss';

const traceTypeVisualization = {
  images: ImagesVisualizer,
  distributions: DistributionsVisualizer,
  audios: AudiosVisualizer,
  videos: () => null,
  texts: TextsVisualizer,
  figures: PlotlyVisualizer,
};

function TraceVisualizationContainer({
  traceInfo,
  traceType,
  runHash,
  runParams,
}: ITraceVisualizationContainerProps) {
  const runTracesModelData = useModel(runTracesModel);
  React.useEffect(() => {
    runTracesModel.initialize(
      runHash,
      traceType,
      traceInfo[traceType],
      runParams,
    );

    return () => {
      runTracesModel.destroy();
    };
  }, [runHash, traceInfo, traceType]);

  const Visualizer = traceTypeVisualization[traceType];

  React.useEffect(() => {
    analytics.pageView(`[RunDetail] [${VisualizationMenuTitles[traceType]}]`);
  }, [traceType]);

  return (
    <div className='TraceVisualizationWrapper'>
      <div className='MenuArea'>
        {runTracesModelData?.menu?.defaultActiveItemKey && (
          <Menu
            defaultActiveItemKey={
              runTracesModelData?.menu?.defaultActiveItemKey
            }
            onChangeActiveItem={runTracesModel.changeActiveItemKey}
            title={runTracesModelData?.menu?.title}
            data={runTracesModelData?.menu?.items || []}
          />
        )}
      </div>
      <div className='VisualizerArea'>
        <Visualizer
          data={runTracesModelData?.data}
          isLoading={runTracesModelData?.isTraceBatchLoading}
          activeTraceContext={runTracesModelData?.menu?.activeItemName}
        />
        {runTracesModelData?.data &&
          runTracesModelData?.config &&
          runTracesModelData?.queryData && (
            <RangePanel
              items={runTracesModelData?.config?.rangePanel.map((item) => ({
                key: item.sliderName,
                sliderName: item.sliderName,
                inputName: item.inputName,
                sliderTitle: item.sliderTitle,
                inputTitle: item.inputTitle,
                sliderTitleTooltip: item.sliderTitleTooltip,
                inputTitleTooltip: item.inputTitleTooltip,
                rangeEndpoints: runTracesModelData?.data[item.sliderName],
                selectedRangeValue: runTracesModelData?.queryData?.sliders[
                  item.sliderName
                ] || [0, 0],
                inputValue:
                  runTracesModelData?.queryData?.inputs[item.inputName] || 0,
                sliderType: item.sliderType,
              }))}
              onApply={runTracesModel.onApply}
              onInputChange={runTracesModel.onInputChange}
              onRangeSliderChange={runTracesModel.onRangeChange}
              applyButtonDisabled={!!runTracesModelData?.isTraceBatchLoading}
            />
          )}
      </div>
    </div>
  );
}

TraceVisualizationContainer.displayName = 'TraceVisualizationContainer';

export default React.memo(withEmptyTraceCheck(TraceVisualizationContainer));
