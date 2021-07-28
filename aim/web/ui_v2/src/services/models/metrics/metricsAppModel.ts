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
  IMetricsCollection,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IRun } from 'types/services/models/metrics/runModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePointData } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum, ScaleEnum } from 'utils/d3';
import getObjectPaths from 'utils/getObjectPaths';
import getTableColumns from 'pages/Metrics/components/TableColumns/TableColumns';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';

const model = createModel<Partial<IMetricAppModelState>>({});

function getConfig(): IMetricAppConfig {
  return {
    refs: {
      tableRef: { current: null },
      chartPanelRef: { current: null },
    },
    grouping: {
      color: ['run.params.hparams.seed'],
      style: ['run.params.hparams.lr'],
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
      aggregated: false,
      focusedState: {
        key: null,
        xValue: null,
        yValue: null,
        active: false,
        chartIndex: null,
      },
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
        const processedData = processData(data);
        model.setState({
          rawData: data,
          params: processedData.params,
          data: processedData.data,
          lineChartData: getDataAsLines(processedData.data),
          tableData: getDataAsTableRows(
            processedData.data,
            null,
            processedData.params,
          ),
          tableColumns: getTableColumns(processedData.params),
        });
      }),
    abort,
  };
}

function processData(data: IRun[]): {
  data: IMetricsCollection[];
  params: string[];
} {
  let metrics: IMetric[] = [];
  let index = -1;
  let params: string[] = [];

  data.forEach((run: any) => {
    params = params.concat(getObjectPaths(run.params));
    metrics = metrics.concat(
      run.metrics.map((metric: IMetric) => {
        index++;
        return createMetricModel({
          ...metric,
          run: createRunModel(_.omit(run, 'metrics') as IRun),
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
  return {
    data: groupData(metrics),
    params: _.uniq(params),
  };
}

function groupData(data: IMetric[]): IMetricsCollection[] {
  const grouping = model.getState()!.config!.grouping;
  const groupByColor = grouping.color;
  const groupByStyle = grouping.style;
  const groupByChart = grouping.chart;
  if (
    groupByColor.length === 0 &&
    groupByStyle.length === 0 &&
    groupByChart.length === 0
  ) {
    return [
      {
        config: null,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data: data,
      },
    ];
  }

  const groupValues: {
    [key: string]: IMetricsCollection;
  } = {};

  const groupingFields = _.uniq(
    groupByColor.concat(groupByStyle).concat(groupByChart),
  );

  for (let i = 0; i < data.length; i++) {
    const groupValue: { [key: string]: unknown } = {};
    groupingFields.forEach((field) => {
      groupValue[field] = _.get(data[i], field);
    });
    const groupKey = encode(groupValue);
    if (groupValues.hasOwnProperty(groupKey)) {
      groupValues[groupKey].data.push(data[i]);
    } else {
      groupValues[groupKey] = {
        config: groupValue,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data: [data[i]],
      };
    }
  }

  let colorIndex = 0;
  let dasharrayIndex = 0;
  let chartIndex = 0;

  const colorConfigsMap: { [key: string]: number } = {};
  const dasharrayConfigsMap: { [key: string]: number } = {};
  const chartIndexConfigsMap: { [key: string]: number } = {};

  for (let groupKey in groupValues) {
    const groupValue = groupValues[groupKey];

    if (groupByColor.length > 0) {
      const colorConfig = _.pick(groupValue.config, groupByColor);
      const colorKey = encode(colorConfig);
      if (colorConfigsMap.hasOwnProperty(colorKey)) {
        groupValue.color = COLORS[colorConfigsMap[colorKey] % COLORS.length];
      } else {
        colorConfigsMap[colorKey] = colorIndex;
        groupValue.color = COLORS[colorIndex % COLORS.length];
        colorIndex++;
      }
    }

    if (groupByStyle.length > 0) {
      const dasharrayConfig = _.pick(groupValue.config, groupByStyle);
      const dasharrayKey = encode(dasharrayConfig);
      if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
        groupValue.dasharray =
          DASH_ARRAYS[dasharrayConfigsMap[dasharrayKey] % DASH_ARRAYS.length];
      } else {
        dasharrayConfigsMap[dasharrayKey] = dasharrayIndex;
        groupValue.dasharray = DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
        dasharrayIndex++;
      }
    }

    if (groupByChart.length > 0) {
      const chartIndexConfig = _.pick(groupValue.config, groupByChart);
      const chartIndexKey = encode(chartIndexConfig);
      if (chartIndexConfigsMap.hasOwnProperty(chartIndexKey)) {
        groupValue.dasharray =
          DASH_ARRAYS[chartIndexConfigsMap[chartIndexKey] % DASH_ARRAYS.length];
      } else {
        chartIndexConfigsMap[chartIndexKey] = chartIndex;
        groupValue.chartIndex = chartIndex;
        chartIndex++;
      }
    }
  }

  return Object.values(groupValues);
}

function getDataAsLines(
  processedData: IMetricsCollection[],
  configData: IMetricAppConfig | any = model.getState()?.config,
): ILine[][] {
  if (!processedData) {
    return [];
  }

  const { smoothingAlgorithm, smoothingFactor } = configData?.chart;
  const lines = processedData
    .map((metricsCollection: IMetricsCollection) =>
      metricsCollection.data.map((metric: IMetric) => {
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
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.color,
          chartIndex: metricsCollection.chartIndex,
          selectors: [metric.key, metric.key, metric.run.run_hash],
          data: {
            xValues: [...metric.data.iterations],
            yValues,
          },
        };
      }),
    )
    .flat();

  return _.values(_.groupBy(lines, 'chartIndex'));
}

function getDataAsTableRows(
  processedData: IMetricsCollection[],
  xValue: number | null = null,
  paramKeys: string[],
): IMetricTableRowData[][] | any {
  if (!processedData) {
    return [];
  }

  return processedData.map((metricsCollection: IMetricsCollection) =>
    metricsCollection.data.map((metric: IMetric) => {
      const closestIndex =
        xValue === null
          ? null
          : getClosestValue(metric.data.iterations as any, xValue).index;
      const rowValues: { [key: string]: unknown } = {
        key: metric.key,
        color: metricsCollection.color ?? metric.color,
        dasharray: metricsCollection.dasharray ?? metric.color,
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
      paramKeys.forEach((paramKey) => {
        rowValues[paramKey] = _.get(metric.run.params, paramKey, '-');
      });
      return rowValues;
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

    model.setState({
      config: { ...configData },
      lineChartData: getDataAsLines(model.getState()!.data!, configData),
    });
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
  const tableData = getDataAsTableRows(
    model.getState()!.data!,
    activePointData.xValue,
    model.getState()!.params!,
  );
  const stateUpdate: Partial<IMetricAppModelState> = {
    tableData,
  };
  if (tableRef) {
    tableRef.current?.updateData({
      newData: tableData.flat(),
    });
    tableRef.current?.setHoveredRow(activePointData.key);
  }
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.focusedState = {
      active: false,
      ...activePointData,
    };
    stateUpdate.config = configData;
  }

  model.setState(stateUpdate);
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
