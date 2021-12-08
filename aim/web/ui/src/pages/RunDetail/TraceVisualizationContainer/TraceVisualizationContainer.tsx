import React, { useEffect } from 'react';

import Menu from 'components/kit/Menu/Menu';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';

import useModel from 'hooks/model/useModel';

import runTracesModel from 'services/models/runs/runTracesModel';

import DistributionsVisualizer from '../DistributionsVisualizer';
import ImagesVisualizer from '../ImagesVisualizer/ImagesVisualizer';
import { ITraceVisualizationContainerProps } from '../types';
import RangePanel from '../RangePanel';

import widthEmptyTraceCheck from './widthEmptyTraceCheck';

import './TraceVisualizationContainer.scss';

const traceTypeVisualization = {
  images: ImagesVisualizer,
  distributions: DistributionsVisualizer,
  audios: () => null,
  videos: () => null,
  texts: () => null,
  plots: () => null,
};

function TraceVisualizationContainer({
  traceInfo,
  traceType,
  runHash,
}: ITraceVisualizationContainerProps) {
  const runTracesModelData = useModel(runTracesModel);
  useEffect(() => {
    runTracesModel.initialize(runHash, traceType, traceInfo[traceType]);

    return () => {
      runTracesModel.destroy();
    };
  }, [runHash, traceInfo, traceType]);

  const Visualizer = traceTypeVisualization[traceType];

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
        <BusyLoaderWrapper
          height={'30rem'}
          isLoading={!!runTracesModelData?.isTraceBatchLoading}
        >
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
                  ] || [0, 50],
                  inputValue:
                    runTracesModelData?.queryData?.inputs[item.inputName] || 50,
                }))}
                onApply={runTracesModel.onApply}
                onInputChange={runTracesModel.onInputChange}
                onRangeSliderChange={runTracesModel.onRangeChange}
              />
            )}
        </BusyLoaderWrapper>
      </div>
    </div>
  );
}

TraceVisualizationContainer.displayName = 'TraceVisualizationContainer';

export default widthEmptyTraceCheck(TraceVisualizationContainer);
