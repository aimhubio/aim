import React from 'react';
import { useModel } from 'hooks';

import Menu from 'components/kit/Menu/Menu';
import { IValidationMetadata } from 'components/kit/Input';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Spinner from 'components/kit/Spinner';
import RangePanel from 'components/RangePanel';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import runTracesModel from 'services/models/runs/runTracesModel';
import * as analytics from 'services/analytics';
import { TraceType } from 'services/models/runs/types';

import { ITraceVisualizationContainerProps } from '../types';

import withEmptyTraceCheck from './withEmptyTraceCheck';

import './TraceVisualizationContainer.scss';

const DistributionsVisualizer = React.lazy(
  () =>
    import(
      /* webpackChunkName: "DistributionsVisualizer" */ '../DistributionsVisualizer'
    ),
);
const ImagesVisualizer = React.lazy(
  () =>
    import(/* webpackChunkName: "ImagesVisualizer" */ '../ImagesVisualizer'),
);
const TextsVisualizer = React.lazy(
  () => import(/* webpackChunkName: "TextsVisualizer" */ '../TextsVisualizer'),
);
const PlotlyVisualizer = React.lazy(
  () =>
    import(/* webpackChunkName: "PlotlyVisualizer" */ '../PlotlyVisualizer'),
);
const AudiosVisualizer = React.lazy(
  () =>
    import(/* webpackChunkName: "AudiosVisualizer" */ '../AudiosVisualizer'),
);

const traceTypeVisualization = {
  images: ImagesVisualizer,
  distributions: DistributionsVisualizer,
  audios: AudiosVisualizer,
  videos: () => null, // @TODO add tracking event keys in analyticsKeysMap object
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runHash, traceInfo, traceType]);

  const onInputChangeHandler = (
    name: string,
    value: number,
    metadata?: IValidationMetadata,
  ) => {
    runTracesModel.onInputChange(name, value, metadata?.isValid);
  };

  const Visualizer =
    traceTypeVisualization[traceType as Exclude<TraceType, 'metric'>];

  React.useEffect(() => {
    // @ts-ignore
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs[traceType].tabView);
  }, [traceType]);

  return (
    <ErrorBoundary>
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
          <React.Suspense
            fallback={
              <div className='VisualizerArea__suspenseLoaderContainer'>
                <Spinner />
              </div>
            }
          >
            <Visualizer
              data={runTracesModelData?.data}
              isLoading={runTracesModelData?.isTraceBatchLoading}
              activeTraceContext={runTracesModelData?.menu?.activeItemName}
            />
          </React.Suspense>
          {runTracesModelData?.data &&
            runTracesModelData?.config &&
            !runTracesModelData?.isTraceContextBatchLoading &&
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
                  inputValidationPatterns: item.inputValidationPatterns?.(
                    runTracesModelData?.data[item.sliderName][0],
                    runTracesModelData?.data[item.sliderName][1],
                  ),
                  infoPropertyName: item?.infoPropertyName,
                }))}
                onApply={runTracesModel.onApply}
                onInputChange={(
                  name: string,
                  value: number,
                  metadata?: IValidationMetadata,
                ) => onInputChangeHandler(name, value, metadata)}
                onRangeSliderChange={runTracesModel.onRangeChange}
                applyButtonDisabled={
                  !!runTracesModelData?.isTraceBatchLoading ||
                  !!runTracesModelData?.isApplyBtnDisabled
                }
              />
            )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

TraceVisualizationContainer.displayName = 'TraceVisualizationContainer';

export default React.memo(withEmptyTraceCheck(TraceVisualizationContainer));
