import React from 'react';
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
  GroupingSelectOptionType,
  GroupNameType,
  IGetGroupingPersistIndex,
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IRun } from 'types/services/models/metrics/runModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum, ScaleEnum } from 'utils/d3';
import getObjectPaths from 'utils/getObjectPaths';
import getTableColumns from 'pages/Metrics/components/TableColumns/TableColumns';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import getUrlWithParam from 'utils/getUrlWithParam';
import getStateFromUrl from 'utils/getStateFromUrl';
import {
  aggregateGroupData,
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

const model = createModel<Partial<IMetricAppModelState>>({});

function getConfig() {
  return {
    grouping: {
      color: [],
      style: [],
      chart: ['metric_name'],
      // TODO refactor boolean value types objects into one
      reverseMode: {
        color: false,
        style: false,
        chart: false,
      },
      isApplied: {
        color: true,
        style: true,
        chart: true,
      },
      persistence: {
        color: false,
        style: false,
      },
      seed: {
        color: 10,
        style: 10,
      },
      paletteIndex: 0,
      selectOptions: [],
    },
    chart: {
      highlightMode: HighlightEnum.Off,
      displayOutliers: true,
      zoomMode: false,
      axesScaleType: { xAxis: ScaleEnum.Linear, yAxis: ScaleEnum.Linear },
      curveInterpolation: CurveEnum.Linear,
      smoothingAlgorithm: SmoothingAlgorithmEnum.EMA,
      smoothingFactor: 0,
      aggregation: {
        methods: {
          area: AggregationAreaMethods.MIN_MAX,
          line: AggregationLineMethods.MEAN,
        },
        isApplied: false,
      },
      focusedState: {
        active: false,
      },
    },
  };
}

function initialize() {
  model.init();
  const grouping: IMetricAppConfig['grouping'] =
    getStateFromUrl('grouping') || getConfig().grouping;
  const chart: IMetricAppConfig['chart'] =
    getStateFromUrl('chart') || getConfig().chart;
  const configData: IMetricAppConfig = _.merge(getConfig(), {
    chart,
    grouping,
  });
  model.setState({
    refs: {
      tableRef: { current: null },
      chartPanelRef: { current: null },
    },
    config: configData,
  });
}

function getMetricsData() {
  const { call, abort } = metricsService.getMetricsData({
    q: 'metric_name == "bleu" or metric_name == "loss" or metric_name == "best_loss"',
  });
  return {
    call: async () => {
      const stream = await call();
      let gen = adjustable_reader(stream);
      let buffer_pairs = decode_buffer_pairs(gen);
      let decodedPairs = decodePathsVals(buffer_pairs);
      let objects = iterFoldTree(decodedPairs, 1);

      const runData: IRun[] = [];
      for await (let [keys, val] of objects) {
        runData.push(val as any);
      }

      const { data, params } = processData(runData);
      const configData = model.getState()?.config;
      if (configData) {
        configData.grouping.selectOptions = [
          ...getGroupingSelectOptions(params),
        ];
      }
      model.setState({
        rawData: runData,
        config: configData,
        params,
        data,
        lineChartData: getDataAsLines(data),
        tableData: getDataAsTableRows(data, null, params),
        tableColumns: getTableColumns(params),
      });
    },
    abort,
  };
}

function getGroupingSelectOptions(
  params: string[],
): GroupingSelectOptionType[] {
  const paramsOptions: GroupingSelectOptionType[] = params.map((param) => ({
    value: `run.params.${param}`,
    group: 'params',
    label: param,
  }));
  return [
    ...paramsOptions,
    {
      group: 'Other',
      label: 'experiment_name',
      value: 'run.experiment_name',
    },
    {
      group: 'Other',
      label: 'run.hash',
      value: 'run.params.status.hash',
    },
    {
      group: 'Other',
      label: 'metric_name',
      value: 'metric_name',
    },
    {
      group: 'context',
      label: 'subset',
      value: 'context.subset',
    },
  ];
}

function processData(data: IRun[]): {
  data: IMetricsCollection[];
  params: string[];
} {
  const grouping = model.getState()?.config?.grouping;
  let metrics: IMetric[] = [];
  let index: number = -1;
  let params: string[] = [];
  const paletteIndex: number = grouping?.paletteIndex || 0;
  data.forEach((run: IRun) => {
    params = params.concat(
      getObjectPaths(_.omit(run.params, 'experiment_name', 'status')),
    );
    metrics = metrics.concat(
      run.traces.map((trace) => {
        index++;
        return createMetricModel({
          ...trace,
          run: createRunModel(_.omit(run, 'traces') as IRun),
          key: encode({
            runHash: run.params.status.hash,
            metricName: trace.metric_name,
            traceContext: trace.context,
          }),
          dasharray: '0',
          color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
          data: {
            values: new Float64Array(trace.values.blob),
            iterations: new Float64Array(trace.iters.blob),
            epochs: new Float64Array(trace.epochs.blob),
            timestamps: new Float64Array(trace.timestamps.blob),
            xValues: [...new Float64Array(trace.iters.blob)],
            yValues: [...new Float64Array(trace.values.blob)],
          },
        } as IMetric);
      }),
    );
  });

  return {
    data: groupData(metrics),
    params: _.uniq(params),
  };
}

function getFilteredGroupingOptions(
  grouping: IMetricAppConfig['grouping'],
  groupName: GroupNameType,
): string[] {
  const { selectOptions, reverseMode, isApplied } = grouping;

  const filteredOptions = [...selectOptions]
    .filter((opt) => grouping[groupName].indexOf(opt.value) === -1)
    .map((item) => item.value);
  return isApplied[groupName]
    ? reverseMode[groupName]
      ? filteredOptions
      : grouping[groupName]
    : [];
}

function getGroupingPersistIndex({
  groupValues,
  groupKey,
  grouping,
}: IGetGroupingPersistIndex) {
  const configHash = encode(groupValues[groupKey].config as {});
  let index = BigInt(0);
  for (let i = 0; i < configHash.length; i++) {
    const charCode = configHash.charCodeAt(i);
    if (charCode > 47 && charCode < 58) {
      index += BigInt(
        (charCode - 48) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
      );
    } else if (charCode > 96 && charCode < 103) {
      index += BigInt(
        (charCode - 87) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
      );
    }
  }
  return index;
}

function groupData(data: IMetric[]): IMetricsCollection[] {
  const grouping = model.getState()!.config!.grouping;
  const { paletteIndex } = grouping;
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStyle = getFilteredGroupingOptions(grouping, 'style');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
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

      if (grouping.persistence.color && grouping.isApplied.color) {
        let index = getGroupingPersistIndex({
          groupValues,
          groupKey,
          grouping,
        });
        groupValue.color =
          COLORS[paletteIndex][
            Number(index % BigInt(COLORS[paletteIndex].length))
          ];
      } else if (colorConfigsMap.hasOwnProperty(colorKey)) {
        groupValue.color =
          COLORS[paletteIndex][
            colorConfigsMap[colorKey] % COLORS[paletteIndex].length
          ];
      } else {
        colorConfigsMap[colorKey] = colorIndex;
        groupValue.color =
          COLORS[paletteIndex][colorIndex % COLORS[paletteIndex].length];
        colorIndex++;
      }
    }

    if (groupByStyle.length > 0) {
      const dasharrayConfig = _.pick(groupValue.config, groupByStyle);
      const dasharrayKey = encode(dasharrayConfig);
      if (grouping.persistence.style && grouping.isApplied.style) {
        let index = getGroupingPersistIndex({
          groupValues,
          groupKey,
          grouping,
        });
        groupValue.dasharray =
          DASH_ARRAYS[Number(index % BigInt(DASH_ARRAYS.length))];
      } else if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
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
        groupValue.chartIndex = chartIndexConfigsMap[chartIndexKey];
      } else {
        chartIndexConfigsMap[chartIndexKey] = chartIndex;
        groupValue.chartIndex = chartIndex;
        chartIndex++;
      }
    }
  }

  const groups = Object.values(groupValues);

  return aggregateGroupData({
    groupData: groups,
    methods: {
      area: AggregationAreaMethods.MIN_MAX,
      line: AggregationLineMethods.MEAN,
    },
    scale: model.getState()!.config!.chart.axesScaleType,
  });
}

function alignData() {}

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
                  metric.data.yValues,
                  smoothingFactor,
                )
              : calculateCentralMovingAverage(
                  metric.data.yValues,
                  smoothingFactor,
                );
        } else {
          yValues = metric.data.yValues;
        }
        return {
          ...metric,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.color,
          chartIndex: metricsCollection.chartIndex,
          selectors: [metric.key, metric.key, metric.run.params.status.hash],
          data: {
            xValues: metric.data.xValues,
            yValues,
          },
        };
      }),
    )
    .flat();

  return Object.values(_.groupBy(lines, 'chartIndex'));
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
        experiment: metric.run.params.experiment_name,
        run: metric.run.params.status.name,
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

function setComponentRefs(refElement: React.MutableRefObject<any> | object) {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
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

function onGroupingSelectChange({
  groupName,
  list,
}: IOnGroupingSelectChangeParams) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    updateModelData(configData);
  }
}

function onGroupingModeChange({
  groupName,
  value,
}: IOnGroupingModeChangeParams): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      [groupName]: value,
    };
    updateModelData(configData);
  }
}

function onGroupingPaletteChange(index: number): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      paletteIndex: index,
    };
    updateModelData(configData);
  }
}

function onGroupingReset(groupName: GroupNameType) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    const { reverseMode, paletteIndex, isApplied, persistence } =
      configData.grouping;
    configData.grouping = {
      ...configData.grouping,
      reverseMode: { ...reverseMode, [groupName]: false },
      [groupName]: [],
      paletteIndex: groupName === 'color' ? 0 : paletteIndex,
      persistence: { ...persistence, [groupName]: false },
      isApplied: { ...isApplied, [groupName]: true },
    };
    updateModelData(configData);
  }
}

function updateModelData(configData: IMetricAppConfig): void {
  const processedData = processData(model.getState()?.rawData as IRun[]);
  model.setState({
    config: configData,
    data: processedData.data,
    lineChartData: getDataAsLines(processedData.data),
    tableData: getDataAsTableRows(
      processedData.data,
      null,
      processedData.params,
    ),
  });
}

function onGroupingApplyChange(groupName: GroupNameType): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      isApplied: {
        ...configData.grouping.isApplied,
        [groupName]: !configData.grouping.isApplied[groupName],
      },
    };
    updateModelData(configData);
  }
}

function onGroupingPersistenceChange(groupName: 'style' | 'color'): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      persistence: {
        ...configData.grouping.persistence,
        [groupName]: !configData.grouping.persistence[groupName],
      },
    };
    updateModelData(configData);
  }
}

//Table Methods
function onActivePointChange(
  activePoint: IActivePoint,
  focusedStateActive: boolean = false,
): void {
  const tableRef: any = model.getState()?.refs?.tableRef;
  const tableData = getDataAsTableRows(
    model.getState()!.data!,
    activePoint.xValue,
    model.getState()!.params!,
  );
  const stateUpdate: Partial<IMetricAppModelState> = {
    tableData,
  };
  if (tableRef) {
    tableRef.current?.updateData({ newData: tableData.flat() });
    tableRef.current?.setHoveredRow?.(activePoint.key);
    tableRef.current?.setActiveRow?.(
      focusedStateActive ? activePoint.key : null,
    );

    if (focusedStateActive) {
      tableRef.current?.scrollToRow(activePoint.key);
    }
  }
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.focusedState = {
      active: focusedStateActive,
      ...activePoint,
    };
    stateUpdate.config = configData;
  }

  model.setState(stateUpdate);
}

function onTableRowHover(rowKey: string): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;
    if (chartPanelRef && !configData.chart.focusedState.active) {
      chartPanelRef.current?.setActiveLine(rowKey);
    }
  }
}

function onTableRowClick(rowKey: string | null): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;
  if (chartPanelRef && rowKey) {
    chartPanelRef.current?.setActiveLine(rowKey, true);
  }
  if (configData?.chart) {
    configData.chart.focusedState = {
      ...configData.chart.focusedState,
      active: !!rowKey,
    };
    updateModelData(configData);
  }
}

function updateGroupingStateUrl(): void {
  const groupingData = model.getState()?.config?.grouping;
  if (groupingData) {
    updateUrlParam('grouping', groupingData);
  }
}

function updateChartStateUrl(): void {
  const chartData = model.getState()?.config?.chart;
  if (chartData) {
    updateUrlParam('chart', chartData);
  }
}

function updateUrlParam(
  paramName: string,
  data: Record<string, unknown>,
): void {
  const encodedUrl: string = encode(data);
  const url: string = getUrlWithParam(paramName, encodedUrl);
  window.history.pushState(null, '', url);
}

const metricAppModel = {
  ...model,
  initialize,
  getMetricsData,
  getDataAsTableRows,
  setComponentRefs,
  onChangeHighlightMode,
  onZoomModeChange,
  onSmoothingChange,
  onDisplayOutliersChange,
  onAxesScaleTypeChange,
  onActivePointChange,
  onTableRowHover,
  onTableRowClick,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  updateGroupingStateUrl,
  updateChartStateUrl,
};

export default metricAppModel;
