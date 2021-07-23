import * as _ from 'lodash-es';

import COLORS from 'config/colors/colors';
import metricsService from 'services/api/metrics/metricsService';
import createModel from '../model';
import createMetricModel from './metricModel';
import { createRunModel } from './runModel';
import { encode } from 'utils/encoder/encoder';
import getClosestValue from 'utils/getClosestValue';
import {
  calculateCentralMovingAverage,
  calculateExponentialMovingAverage,
  SmoothingAlgorithmEnum,
} from 'utils/smoothingData';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

//Types
import {
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IRun } from 'types/services/models/metrics/runModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePointData } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum, ScaleEnum } from 'utils/d3';

const model = createModel<Partial<IMetricAppModelState>>({});

function getConfig() {
  return {
    refs: {
      tableRef: { current: null },
      chartPanelRef: { current: null },
    },
    grouping: {
      color: [],
      style: [],
      chart: [],
    },
    chart: {
      highlightMode: HighlightEnum.Off,
      displayOutliers: true,
      zoomMode: false,
      axesScaleType: { xAxis: ScaleEnum.Linear, yAxis: ScaleEnum.Linear },
      curveInterpolation: CurveEnum.Linear,
      smoothingAlgorithm: SmoothingAlgorithmEnum.EMA,
      smoothingFactor: 0,
    },
  };
}

function initialize() {
  model.init();
  model.setState({
    config: getConfig(),
  });
}

function getMetricsData() {
  const { call, abort } = metricsService.getMetricsData();
  return {
    call: () =>
      call().then((data: IRun[]) => {
        model.setState({
          rawData: data,
          collection: processData(data),
        });
      }),
    abort,
  };
}

function processData(data: IRun[]): IMetric[][] {
  let metrics: IMetric[] = [];
  let index = -1;

  data.forEach((run: any) => {
    metrics = metrics.concat(
      run.metrics.map((metric: IMetric) => {
        index++;
        return createMetricModel({
          ...metric,
          run: createRunModel(_.omit(run, 'metrics') as IRun),
          selectors: [
            encode({
              runHash: run.run_hash,
              metricName: metric.metric_name,
              metricContext: metric.context,
            }),
            encode({
              runHash: run.run_hash,
              metricName: metric.metric_name,
              metricContext: metric.context,
            }),
            run.run_hash,
          ],
          key: encode({
            runHash: run.run_hash,
            metricName: metric.metric_name,
            traceContext: metric.context,
          }),
          dasharray: '0',
          color: COLORS[index % COLORS.length],
        } as IMetric);
      }),
    );
  });
  return [
    metrics.filter((_, i) => i % 3 === 0),
    metrics.filter((_, i) => i % 3 !== 0),
  ];
}

function getDataAsLines(): ILine[][] {
  const metricsCollection = model.getState()?.collection;
  const configData: IMetricAppConfig | any = model.getState()?.config;
  if (!metricsCollection) {
    return [];
  }

  const { smoothingAlgorithm, smoothingFactor } = configData?.chart;
  return metricsCollection.map((metrics: IMetric[]) =>
    metrics.map((metric: IMetric) => {
      let yValues;
      if (smoothingAlgorithm && smoothingFactor) {
        yValues =
          smoothingAlgorithm === SmoothingAlgorithmEnum.EMA
            ? calculateExponentialMovingAverage(
                [...metric.data.values],
                smoothingFactor,
              )
            : calculateCentralMovingAverage(
                [...metric.data.values],
                smoothingFactor,
              );
      } else {
        yValues = [...metric.data.values];
      }
      return {
        ...metric,
        data: {
          xValues: [...metric.data.iterations],
          yValues,
        },
      };
    }),
  );
}

function getDataAsTableRows(
  xValue: number | null = null,
): IMetricTableRowData[][] {
  const metricsCollection = model.getState()?.collection;
  if (!metricsCollection) {
    return [];
  }

  return metricsCollection.map((metrics: IMetric[]) =>
    metrics.map((metric: IMetric) => {
      const closestIndex =
        xValue === null
          ? null
          : getClosestValue(metric.data.iterations as any, xValue).index;
      return {
        key: metric.key,
        dasharray: metric.dasharray,
        color: metric.color,
        experiment: metric.run.experiment_name,
        run: metric.run.name,
        metric: metric.metric_name,
        context: Object.entries(metric.context).map((entry) => entry.join(':')),
        value: `${
          closestIndex === null ? '-' : metric.data.values[closestIndex]
        }`,
        iteration: `${
          closestIndex === null ? '-' : metric.data.iterations[closestIndex]
        }`,
      };
    }),
  );
}

function setComponentRefs(refs: any) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    configData.refs = Object.assign(configData.refs, refs);
    model.setState({ config: configData });
  }
}

//Chart Methods

function onChangeHighlightMode(mode: HighlightEnum): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.highlightMode = mode;
    model.setState({
      config: configData,
    });
  }
}

function onZoomModeChange(): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.zoomMode = !configData.chart.zoomMode;
    model.setState({ config: configData });
  }
}

function onSmoothingChange(props: IOnSmoothingChange) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    // TODO update lines without reRender
    configData.chart = { ...configData.chart, ...props };
    console.log(configData.chart, props);

    model.setState({ config: { ...configData } });
  }
}

function onDisplayOutliersChange(): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.displayOutliers = !configData?.chart.displayOutliers;
    model.setState({ config: configData });
  }
}

function onAxesScaleTypeChange(params: IAxesScaleState): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.axesScaleType = params;
    model.setState({ config: configData });
  }
}

//Table Methods

function onActivePointChange(activePointData: IActivePointData): void {
  const tableRef: any = model.getState()?.config?.refs.tableRef;
  if (tableRef) {
    tableRef.current?.updateData({
      newData: getDataAsTableRows(activePointData.xValue).flat(),
    });
    tableRef.current?.setHoveredRow(activePointData.key);
  }
}

function onTableRowHover(rowKey: string): void {
  const chartPanelRef: any = model.getState()?.config?.refs.chartPanelRef;
  if (chartPanelRef) {
    chartPanelRef.current?.setActiveLine(rowKey);
  }
}

const metricAppModel = {
  ...model,
  initialize,
  getMetricsData,
  getDataAsLines,
  getDataAsTableRows,
  setComponentRefs,
  onChangeHighlightMode,
  onZoomModeChange,
  onSmoothingChange,
  onDisplayOutliersChange,
  onAxesScaleTypeChange,
  onActivePointChange,
  onTableRowHover,
};

export default metricAppModel;
