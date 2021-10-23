import React from 'react';
import _ from 'lodash-es';
import { saveAs } from 'file-saver';
import moment from 'moment';

import COLORS from 'config/colors/colors';
import metricsService from 'services/api/metrics/metricsService';
import createModel from '../model';
import createMetricModel from './metricModel';
import { createRunModel } from './runModel';
import { decode, encode } from 'utils/encoder/encoder';
import getClosestValue from 'utils/getClosestValue';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import getObjectPaths from 'utils/getObjectPaths';
import {
  getMetricsTableColumns,
  metricsTableRowRenderer,
} from 'pages/Metrics/components/MetricsTableGrid/MetricsTableGrid';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';
import getUrlWithParam from 'utils/getUrlWithParam';
import getStateFromUrl from 'utils/getStateFromUrl';
import {
  aggregateGroupData,
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import getSmoothenedData from 'utils/getSmoothenedData';
import filterMetricData from 'utils/filterMetricData';
import { RowHeightSize } from 'config/table/tableConfigs';
import filterTooltipContent from 'utils/filterTooltipContent';
import JsonToCSV from 'utils/JsonToCSV';

// Types
import {
  GroupNameType,
  IAggregatedData,
  IAggregationConfig,
  IAlignMetricsDataParams,
  IAppData,
  IChartTitle,
  IChartTitleData,
  IChartTooltip,
  IChartZoom,
  IDashboardData,
  IGetGroupingPersistIndex,
  IGroupingSelectOption,
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ITooltipData,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IMetricTrace, IRun } from 'types/services/models/metrics/runModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { AlignmentOptionsEnum, CurveEnum, ScaleEnum } from 'utils/d3';
import { IBookmarkFormState } from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import {
  AlignmentNotificationsEnum,
  BookmarkNotificationsEnum,
} from 'config/notification-messages/notificationMessages';
import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { filterArrayByIndexes } from 'utils/filterArrayByIndexes';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { getItem, setItem } from 'utils/storage';
import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';
import { ResizeModeEnum, RowHeightEnum } from 'config/enums/tableEnums';
import * as analytics from 'services/analytics';
import { formatValue } from 'utils/formatValue';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';
import { DensityOptions } from 'config/enums/densityEnum';
import getValueByField from 'utils/getValueByField';
import contextToString from 'utils/contextToString';

const model = createModel<Partial<IMetricAppModelState>>({
  requestIsPending: null,
  config: getConfig(),
});
let tooltipData: ITooltipData = {};

let liveUpdateInstance: LiveUpdateService | null;

function getConfig(): IMetricAppConfig {
  return {
    grouping: {
      color: [],
      stroke: [],
      chart: [],
      // TODO refactor boolean value types objects into one
      reverseMode: {
        color: false,
        stroke: false,
        chart: false,
      },
      isApplied: {
        color: true,
        stroke: true,
        chart: true,
      },
      persistence: {
        color: false,
        stroke: false,
      },
      seed: {
        color: 10,
        stroke: 10,
      },
      paletteIndex: 0,
    },
    chart: {
      highlightMode: HighlightEnum.Off,
      ignoreOutliers: true,
      zoom: {
        active: false,
        mode: ZoomEnum.SINGLE,
        history: [],
      },
      axesScaleType: { xAxis: ScaleEnum.Linear, yAxis: ScaleEnum.Linear },
      curveInterpolation: CurveEnum.Linear,
      smoothingAlgorithm: SmoothingAlgorithmEnum.EMA,
      smoothingFactor: 0,
      alignmentConfig: {
        metric: '',
        type: AlignmentOptionsEnum.STEP,
      },
      densityType: DensityOptions.Minimum,
      aggregationConfig: {
        methods: {
          area: AggregationAreaMethods.MIN_MAX,
          line: AggregationLineMethods.MEAN,
        },
        isApplied: false,
        isEnabled: false,
      },
      tooltip: {
        content: {},
        display: true,
        selectedParams: [],
      },
      focusedState: {
        active: false,
        key: null,
        xValue: null,
        yValue: null,
        chartIndex: null,
      },
    },
    select: {
      metrics: [],
      query: '',
      advancedMode: false,
      advancedQuery: '',
    },
    table: {
      resizeMode: ResizeModeEnum.Resizable,
      rowHeight: RowHeightSize.md,
      sortFields: [],
      hiddenMetrics: [],
      hiddenColumns: [],
      columnsWidths: {},
      columnsOrder: {
        left: [],
        middle: [],
        right: [],
      },
      height: '',
    },
    liveUpdate: {
      delay: 7000,
      enabled: false,
    },
  };
}

let appRequestRef: {
  call: () => Promise<IAppData>;
  abort: () => void;
};

function initialize(appId: string): void {
  model.init();
  model.setState({
    refs: {
      tableRef: { current: null },
      chartPanelRef: { current: null },
    },
    groupingSelectOptions: [],
  });
  if (!appId) {
    setDefaultAppConfigData();
  }

  const liveUpdateState = model.getState()?.config?.liveUpdate;

  if (liveUpdateState?.enabled) {
    liveUpdateInstance = new LiveUpdateService(
      'metrics',
      updateData,
      liveUpdateState.delay,
    );
  }
}

function updateData(newData: any) {
  const configData = model.getState()?.config;
  if (configData) {
    setModelData(newData, configData);
  }
}

function setDefaultAppConfigData() {
  const grouping: IMetricAppConfig['grouping'] =
    getStateFromUrl('grouping') || getConfig().grouping;
  const chart: IMetricAppConfig['chart'] =
    getStateFromUrl('chart') || getConfig().chart;
  const select: IMetricAppConfig['select'] =
    getStateFromUrl('select') || getConfig().select;

  const tableConfigHash = getItem('metricsTable');
  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;

  const liveUpdateConfigHash = getItem('metricsLUConfig');
  const luConfig = liveUpdateConfigHash
    ? JSON.parse(decode(liveUpdateConfigHash))
    : getConfig().liveUpdate;

  const configData: IMetricAppConfig = _.merge(getConfig(), {
    chart, // not useful
    grouping, // not useful
    select,
    table,
    liveUpdate: luConfig,
  });

  model.setState({
    config: configData,
  });
}

function getAppConfigData(appId: string) {
  if (appRequestRef) {
    appRequestRef.abort();
  }
  appRequestRef = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequestRef.call();
      const configData: IMetricAppConfig = _.merge(getConfig(), appData.state);
      model.setState({
        config: configData,
      });
    },
    abort: appRequestRef.abort,
  };
}

function getQueryStringFromSelect(
  selectData: IMetricAppConfig['select'] | undefined,
) {
  let query = '';
  if (selectData !== undefined) {
    if (selectData.advancedMode) {
      query = selectData.advancedQuery;
    } else {
      query = `${
        selectData.query ? `${selectData.query} and ` : ''
      }(${selectData.metrics
        .map(
          (metric) =>
            `(metric.name == "${metric.value.metric_name}"${
              metric.value.context === null
                ? ''
                : ' and ' +
                  Object.keys(metric.value.context)
                    .map(
                      (item) =>
                        `metric.context.${item} == ${formatValue(
                          (metric.value.context as any)[item],
                        )}`,
                    )
                    .join(' and ')
            })`,
        )
        .join(' or ')})`.trim();
    }
  }

  return query;
}

let metricsRequestRef: {
  call: (
    exceptionHandler: (detail: any) => void,
  ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
  abort: () => void;
};

function resetModelOnError(detail?: any) {
  model.setState({
    data: [],
    params: [],
    lineChartData: [],
    aggregatedData: [],
    tableData: [],
    tableColumns: [],
    requestIsPending: false,
  });

  const tableRef: any = model.getState()?.refs?.tableRef;
  tableRef.current?.updateData({
    newData: [],
    newColumns: [],
  });
}

function exceptionHandler(detail: any) {
  let message = '';

  if (detail.name === 'SyntaxError') {
    message = `Query syntax error at line (${detail.line}, ${detail.offset})`;
  } else {
    message = detail.message || 'Something went wrong';
  }

  onNotificationAdd({
    id: Date.now(),
    severity: 'error',
    message,
  });

  // reset model
  resetModelOnError(detail);
}

function getMetricsData(shouldUrlUpdate?: boolean) {
  if (metricsRequestRef) {
    metricsRequestRef.abort();
  }
  const modelState: IMetricAppModelState | any = model.getState();
  const configData = modelState?.config;
  if (shouldUrlUpdate) {
    updateURL();
  }
  const metric = configData?.chart.alignmentConfig.metric;
  let query = getQueryStringFromSelect(configData?.select);
  metricsRequestRef = metricsService.getMetricsData({
    q: query,
    p: configData?.chart?.densityType,
    ...(metric && { x_axis: metric }),
  });
  return {
    call: async () => {
      if (query === '()') {
        model.setState({
          requestIsPending: false,
          queryIsEmpty: true,
          tableData: [],
          data: [],
          lineChartData: [],
          params: [],
          aggregatedData: [],
          tableColumns: [],
          rawData: [],
        });
      } else {
        model.setState({
          requestIsPending: true,
          queryIsEmpty: false,
        });
        liveUpdateInstance?.stop().then();
        try {
          const stream = await metricsRequestRef.call(exceptionHandler);
          const runData = await getRunData(stream);
          updateData(runData);
        } catch (ex) {
          if (ex.name === 'AbortError') {
            // Abort Error
          } else {
            console.log('Unhandled error: ', ex);
          }
        }

        liveUpdateInstance?.start({
          q: query,
          ...(metric && { x_axis: metric }),
        });
      }
    },
    abort: metricsRequestRef.abort,
  };
}

function getChartTitleData(
  processedData: IMetricsCollection<IMetric>[],
  groupingSelectOptions: IMetricAppModelState['groupingSelectOptions'],
  configData: IMetricAppConfig | any = model.getState()?.config,
): IChartTitleData {
  if (!processedData) {
    return {};
  }
  const groupData = configData?.grouping;
  let chartTitleData: IChartTitleData = {};
  processedData.forEach((metricsCollection) => {
    if (!chartTitleData[metricsCollection.chartIndex]) {
      chartTitleData[metricsCollection.chartIndex] = groupData.chart.reduce(
        (acc: IChartTitle, groupItemKey: string) => {
          if (metricsCollection.config?.hasOwnProperty(groupItemKey)) {
            acc[getValueByField(groupingSelectOptions || [], groupItemKey)] =
              formatValue(metricsCollection.config[groupItemKey]);
          }
          return acc;
        },
        {},
      );
    }
  });
  return chartTitleData;
}

async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    const app: IAppData | any = await appsService
      .createApp({ state: configData, type: 'metrics' })
      .call();
    if (app.id) {
      const bookmark: IDashboardData = await dashboardService
        .createDashboard({ app_id: app.id, name, description })
        .call();
      if (bookmark.name) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'success',
          message: BookmarkNotificationsEnum.CREATE,
        });
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: BookmarkNotificationsEnum.ERROR,
        });
      }
    }
  }
  analytics.trackEvent('[MetricsExplorer] Create bookmark');
}

function onBookmarkUpdate(id: string) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: 'metrics' })
      .call()
      .then((res: IDashboardData | any) => {
        if (res.id) {
          onNotificationAdd({
            id: Date.now(),
            severity: 'success',
            message: BookmarkNotificationsEnum.UPDATE,
          });
        }
      });
  }
  analytics.trackEvent('[MetricsExplorer] Update bookmark');
}

function getGroupingSelectOptions(
  params: string[],
  contexts: string[] = [],
): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    group: 'run',
    label: `run.${param}`,
    value: `run.params.${param}`,
  }));

  const contextOptions: IGroupingSelectOption[] = contexts.map((context) => ({
    group: 'metric',
    label: `metric.context.${context}`,
    value: `context.${context}`,
  }));

  return [
    {
      group: 'run',
      label: 'run.experiment',
      value: 'run.props.experiment',
    },
    {
      group: 'run',
      label: 'run.hash',
      value: 'run.hash',
    },
    ...paramsOptions,
    {
      group: 'metric',
      label: 'metric.name',
      value: 'metric_name',
    },
    ...contextOptions,
  ];
}

function processData(data: IRun<IMetricTrace>[]): {
  data: IMetricsCollection<IMetric>[];
  params: string[];
  contexts: string[];
} {
  const configData = model.getState()?.config;
  let metrics: IMetric[] = [];
  let index: number = -1;
  let params: string[] = [];
  let contexts: string[] = [];
  const paletteIndex: number = configData?.grouping?.paletteIndex || 0;

  data?.forEach((run: IRun<IMetricTrace>) => {
    params = params.concat(getObjectPaths(run.params, run.params));
    metrics = metrics.concat(
      run.traces.map((trace: any) => {
        index++;

        contexts = contexts.concat(
          getObjectPaths(trace.context, trace.context),
        );
        const { values, steps, epochs, timestamps } = filterMetricData({
          values: [...new Float64Array(trace.values.blob)],
          steps: [...new Float64Array(trace.iters.blob)],
          epochs: [...new Float64Array(trace.epochs?.blob)],
          timestamps: [...new Float64Array(trace.timestamps.blob)],
          axesScaleType: configData?.chart?.axesScaleType,
        });

        let processedValues = values;
        if (
          configData?.chart.smoothingAlgorithm &&
          configData.chart.smoothingFactor
        ) {
          processedValues = getSmoothenedData({
            smoothingAlgorithm: configData?.chart.smoothingAlgorithm,
            smoothingFactor: configData.chart.smoothingFactor,
            data: values,
          });
        }
        const metricKey = encode({
          runHash: run.hash,
          metricName: trace.metric_name,
          traceContext: trace.context,
        });
        return createMetricModel({
          ...trace,
          run: createRunModel(_.omit(run, 'traces') as IRun<IMetricTrace>),
          key: metricKey,
          dasharray: '0',
          color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
          isHidden: configData!.table.hiddenMetrics!.includes(metricKey),
          data: {
            values: processedValues,
            steps,
            epochs,
            timestamps: timestamps.map((timestamp) =>
              Math.round(timestamp * 1000),
            ),
            xValues: steps,
            yValues: processedValues,
          },
        } as IMetric);
      }),
    );
  });

  const processedData = groupData(
    _.orderBy(
      metrics,
      configData?.table?.sortFields?.map(
        (f) =>
          function (metric) {
            return _.get(metric, f[0], '');
          },
      ) ?? [],
      configData?.table?.sortFields?.map((f) => f[1]) ?? [],
    ),
  );
  const uniqParams = _.uniq(params);
  const uniqContexts = _.uniq(contexts);

  return {
    data: processedData,
    params: uniqParams,
    contexts: uniqContexts,
  };
}

function getFilteredGroupingOptions(
  grouping: IMetricAppConfig['grouping'],
  groupName: GroupNameType,
): string[] {
  const { reverseMode, isApplied } = grouping;
  const groupingSelectOptions = model.getState()?.groupingSelectOptions;
  if (groupingSelectOptions) {
    const filteredOptions = [...groupingSelectOptions]
      .filter((opt) => grouping[groupName].indexOf(opt.value) === -1)
      .map((item) => item.value);
    return isApplied[groupName]
      ? reverseMode[groupName]
        ? filteredOptions
        : grouping[groupName]
      : [];
  } else {
    return [];
  }
}

function getGroupingPersistIndex({
  groupConfig,
  grouping,
  groupName,
}: IGetGroupingPersistIndex) {
  const configHash = encode(groupConfig as {}, true);
  let index = BigInt(0);
  for (let i = 0; i < configHash.length; i++) {
    const charCode = configHash.charCodeAt(i);
    if (charCode > 47 && charCode < 58) {
      index += BigInt(
        (charCode - 48) * Math.ceil(Math.pow(16, i) / grouping.seed[groupName]),
      );
    } else if (charCode > 96 && charCode < 103) {
      index += BigInt(
        (charCode - 87) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
      );
    }
  }
  return index;
}

function onShuffleChange(name: 'color' | 'stroke') {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      seed: {
        ...configData.grouping.seed,
        [name]: configData.grouping.seed[name] + 1,
      },
    };
    updateModelData(configData);
  }
}

function isGroupingApplied(grouping: IMetricAppConfig['grouping']): boolean {
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStroke = getFilteredGroupingOptions(grouping, 'stroke');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
  if (
    groupByColor.length === 0 &&
    groupByStroke.length === 0 &&
    groupByChart.length === 0
  ) {
    return false;
  }
  return true;
}

function groupData(data: IMetric[]): IMetricsCollection<IMetric>[] {
  const configData = model.getState()!.config;
  const grouping = configData!.grouping;
  const { paletteIndex } = grouping;
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStroke = getFilteredGroupingOptions(grouping, 'stroke');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
  if (
    groupByColor.length === 0 &&
    groupByStroke.length === 0 &&
    groupByChart.length === 0
  ) {
    return alignData([
      {
        config: null,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data: data,
      },
    ]);
  }

  const groupValues: {
    [key: string]: IMetricsCollection<IMetric>;
  } = {};

  const groupingFields = _.uniq(
    groupByColor.concat(groupByStroke).concat(groupByChart),
  );

  for (let i = 0; i < data.length; i++) {
    const groupValue: { [key: string]: string } = {};
    groupingFields.forEach((field) => {
      groupValue[field] = _.get(data[i], field);
    });
    const groupKey = encode(groupValue);
    if (groupValues.hasOwnProperty(groupKey)) {
      groupValues[groupKey].data.push(data[i]);
    } else {
      groupValues[groupKey] = {
        key: groupKey,
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
          groupConfig: colorConfig,
          grouping,
          groupName: 'color',
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

    if (groupByStroke.length > 0) {
      const dasharrayConfig = _.pick(groupValue.config, groupByStroke);
      const dasharrayKey = encode(dasharrayConfig);
      if (grouping.persistence.stroke && grouping.isApplied.stroke) {
        let index = getGroupingPersistIndex({
          groupConfig: dasharrayConfig,
          grouping,
          groupName: 'stroke',
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

  const groups = alignData(Object.values(groupValues));
  const chartConfig = configData!.chart;

  return aggregateGroupData({
    groupData: groups,
    methods: {
      area: chartConfig.aggregationConfig.methods.area,
      line: chartConfig.aggregationConfig.methods.line,
    },
    scale: chartConfig.axesScaleType,
  });
}

/**
 * Sort X-values
 * Depends on sorted X-Values get corresponding Y-values
 * */
function sortDependingArrays(
  xValues: number[],
  yValues: number[],
): { sortedXValues: number[]; sortedYValues: number[] } {
  const sortedXValues: number[] = [];
  const sortedYValues: number[] = [];
  xValues
    .map((value, i) => ({ i, value }))
    .sort((a, b) => a.value - b.value)
    .forEach((xObj, i) => {
      sortedXValues[i] = xValues[xObj.i];
      sortedYValues[i] = yValues[xObj.i];
    });
  return { sortedXValues, sortedYValues };
}

function alignData(
  data: IMetricsCollection<IMetric>[],
  type: AlignmentOptionsEnum = model.getState()!.config!.chart.alignmentConfig
    .type!,
): IMetricsCollection<IMetric>[] {
  switch (type) {
    case AlignmentOptionsEnum.STEP:
      for (let i = 0; i < data.length; i++) {
        const metricCollection = data[i];
        for (let j = 0; j < metricCollection.data.length; j++) {
          const metric = metricCollection.data[j];

          const { sortedXValues, sortedYValues } = sortDependingArrays(
            [...metric.data.steps],
            [...metric.data.values],
          );

          metric.data = {
            ...metric.data,
            xValues: sortedXValues,
            yValues: sortedYValues,
          };
        }
      }
      break;
    case AlignmentOptionsEnum.EPOCH:
      for (let i = 0; i < data.length; i++) {
        const metricCollection = data[i];
        for (let j = 0; j < metricCollection.data.length; j++) {
          const metric = metricCollection.data[j];
          const epochs: { [key: number]: number[] } = {};

          metric.data.epochs.forEach((epoch, i) => {
            if (epochs.hasOwnProperty(epoch)) {
              epochs[epoch].push(metric.data.steps[i]);
            } else {
              epochs[epoch] = [metric.data.steps[i]];
            }
          });

          const { sortedXValues, sortedYValues } = sortDependingArrays(
            [
              ...metric.data.epochs.map(
                (epoch, i) =>
                  epoch +
                  (epochs[epoch].length > 1
                    ? (0.99 / epochs[epoch].length) *
                      epochs[epoch].indexOf(metric.data.steps[i])
                    : 0),
              ),
            ],
            [...metric.data.values],
          );

          metric.data = {
            ...metric.data,
            xValues: sortedXValues,
            yValues: sortedYValues,
          };
        }
      }
      break;
    case AlignmentOptionsEnum.RELATIVE_TIME:
      for (let i = 0; i < data.length; i++) {
        const metricCollection = data[i];
        for (let j = 0; j < metricCollection.data.length; j++) {
          const metric = metricCollection.data[j];
          const firstDate = metric.data.timestamps[0];
          const timestamps: { [key: number]: number[] } = {};
          metric.data.timestamps.forEach((timestamp, i) => {
            if (timestamps.hasOwnProperty(timestamp)) {
              timestamps[timestamp].push(metric.data.steps[i]);
            } else {
              timestamps[timestamp] = [metric.data.steps[i]];
            }
          });

          const { sortedXValues, sortedYValues } = sortDependingArrays(
            [
              ...metric.data.timestamps.map(
                (timestamp, i) =>
                  timestamp -
                  firstDate +
                  (timestamps[timestamp].length > 1
                    ? (0.99 / timestamps[timestamp].length) *
                      timestamps[timestamp].indexOf(metric.data.steps[i])
                    : 0),
              ),
            ],
            [...metric.data.values],
          );

          metric.data = {
            ...metric.data,
            xValues: sortedXValues,
            yValues: sortedYValues,
          };
        }
      }
      break;
    case AlignmentOptionsEnum.ABSOLUTE_TIME:
      for (let i = 0; i < data.length; i++) {
        const metricCollection = data[i];
        for (let j = 0; j < metricCollection.data.length; j++) {
          const metric = metricCollection.data[j];

          const { sortedXValues, sortedYValues } = sortDependingArrays(
            [...metric.data.timestamps],
            [...metric.data.values],
          );

          metric.data = {
            ...metric.data,
            xValues: sortedXValues,
            yValues: sortedYValues,
          };
        }
      }
      break;
    case AlignmentOptionsEnum.CUSTOM_METRIC:
      let missingTraces = false;
      for (let i = 0; i < data.length; i++) {
        const metricCollection = data[i];
        for (let j = 0; j < metricCollection.data.length; j++) {
          const metric = metricCollection.data[j];
          const missingIndexes: number[] = [];
          if (metric.x_axis_iters && metric.x_axis_values) {
            const xAxisIters: number[] = [
              ...new Float64Array(metric.x_axis_iters.blob),
            ];
            const xAxisValues: number[] = [
              ...new Float64Array(metric.x_axis_values.blob),
            ];
            if (xAxisValues.length === metric.data.values.length) {
              const { sortedXValues, sortedYValues } = sortDependingArrays(
                [...xAxisValues],
                [...metric.data.values],
              );

              metric.data = {
                ...metric.data,
                xValues: sortedXValues,
                yValues: sortedYValues,
              };
            } else {
              metric.data.steps.forEach((step, index) => {
                if (xAxisIters.indexOf(step) === -1) {
                  missingIndexes.push(index);
                }
              });
              const epochs = filterArrayByIndexes(
                missingIndexes,
                metric.data.epochs,
              );
              const steps = filterArrayByIndexes(
                missingIndexes,
                metric.data.steps,
              );
              const timestamps = filterArrayByIndexes(
                missingIndexes,
                metric.data.timestamps,
              );
              const values = filterArrayByIndexes(
                missingIndexes,
                metric.data.values,
              );
              const yValues = filterArrayByIndexes(
                missingIndexes,
                metric.data.yValues,
              );

              const { sortedXValues, sortedYValues } = sortDependingArrays(
                [...xAxisValues],
                [...yValues],
              );

              metric.data = {
                epochs,
                steps,
                timestamps,
                values,
                xValues: sortedXValues,
                yValues: sortedYValues,
              };
            }
          } else {
            missingTraces = true;
          }
        }
      }
      if (missingTraces) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: AlignmentNotificationsEnum.NOT_ALL_ALIGNED,
        });
      }
      break;
    default:
      throw new Error('Unknown value for X axis alignment');
  }
  return data;
}

function getAggregatedData(
  processedData: IMetricsCollection<IMetric>[],
  configData = model.getState()?.config as IMetricAppConfig,
): IAggregatedData[] {
  if (!processedData) {
    return [];
  }
  const paletteIndex: number = configData?.grouping?.paletteIndex || 0;

  let aggregatedData: IAggregatedData[] = [];

  processedData.forEach((metricsCollection, index) => {
    aggregatedData.push({
      key: metricsCollection.key,
      area: {
        min: metricsCollection.aggregation?.area.min || null,
        max: metricsCollection.aggregation?.area.max || null,
      },
      line: metricsCollection.aggregation?.line || null,
      chartIndex: metricsCollection.chartIndex || 0,
      color:
        metricsCollection.color ||
        COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      dasharray: metricsCollection.dasharray || '0',
    });
  });

  return aggregatedData;
}

function getDataAsLines(
  processedData: IMetricsCollection<IMetric>[],
): ILine[][] {
  if (!processedData) {
    return [];
  }
  const lines = processedData
    .map((metricsCollection: IMetricsCollection<IMetric>) =>
      metricsCollection.data
        .filter((metric) => !metric.isHidden)
        .map((metric: IMetric) => {
          return {
            ...metric,
            groupKey: metricsCollection.key,
            color: metricsCollection.color ?? metric.color,
            dasharray: metricsCollection.dasharray ?? metric.color,
            chartIndex: metricsCollection.chartIndex,
            selectors: [metric.key, metric.key, metric.run.hash],
            data: {
              xValues: metric.data.xValues,
              yValues: metric.data.yValues,
            },
          };
        }),
    )
    .flat();

  return Object.values(_.groupBy(lines, 'chartIndex'));
}

function getDataAsTableRows(
  processedData: IMetricsCollection<IMetric>[],
  xValue: number | string | null = null,
  paramKeys: string[],
  isRawData: boolean,
  config: IMetricAppConfig,
  groupingSelectOptions: IMetricAppModelState['groupingSelectOptions'],
  dynamicUpdate?: boolean,
): { rows: IMetricTableRowData[] | any; sameValueColumns: string[] } {
  if (!processedData) {
    return {
      rows: [],
      sameValueColumns: [],
    };
  }

  const rows: IMetricTableRowData[] | any =
    processedData[0]?.config !== null ? {} : [];

  let rowIndex = 0;
  const sameValueColumns: string[] = [];

  processedData.forEach((metricsCollection: IMetricsCollection<IMetric>) => {
    const groupKey = metricsCollection.key;
    const columnsValues: { [key: string]: string[] } = {};

    if (metricsCollection.config !== null) {
      const groupConfigData: { [key: string]: string } = {};
      for (let key in metricsCollection.config) {
        groupConfigData[getValueByField(groupingSelectOptions, key)] =
          metricsCollection.config[key];
      }
      const groupHeaderRow = {
        meta: {
          chartIndex:
            config.grouping.chart.length > 0 ||
            config.grouping.reverseMode.chart
              ? metricsCollection.chartIndex + 1
              : null,
          color: metricsCollection.color,
          dasharray: metricsCollection.dasharray,
          itemsCount: metricsCollection.data.length,
          config: groupConfigData,
        },
        key: groupKey!,
        groupRowsKeys: metricsCollection.data.map((metric) => metric.key),
        color: metricsCollection.color,
        dasharray: metricsCollection.dasharray,
        aggregation: {
          area: {
            min: '',
            max: '',
          },
          line: '',
        },
        experiment: '',
        run: '',
        metric: '',
        context: [],
        value: '',
        step: '',
        epoch: '',
        time: '',
        children: [],
      };

      rows[groupKey!] = {
        data: groupHeaderRow,
        items: [],
      };
    }

    metricsCollection.data.forEach((metric: IMetric) => {
      const closestIndex =
        xValue === null
          ? null
          : getClosestValue(metric.data.xValues as number[], xValue as number)
              .index;
      const rowValues: IMetricTableRowData = {
        rowMeta: {
          color: metricsCollection.color ?? metric.color,
        },
        key: metric.key,
        runHash: metric.run.hash,
        isHidden: metric.isHidden,
        index: rowIndex,
        color: metricsCollection.color ?? metric.color,
        dasharray: metricsCollection.dasharray ?? metric.dasharray,
        experiment: metric.run.props.experiment ?? 'default',
        run: moment(metric.run.props.creation_time * 1000).format(
          'HH:mm:ss · D MMM, YY',
        ),
        metric: metric.metric_name,
        context: contextToString(metric.context)?.split(',') || [''],
        value:
          closestIndex === null
            ? '-'
            : formatValue(metric.data.values[closestIndex]),
        step:
          closestIndex === null
            ? '-'
            : formatValue(metric.data.steps[closestIndex]),
        epoch:
          closestIndex === null
            ? '-'
            : formatValue(metric.data.epochs[closestIndex]),
        time:
          closestIndex !== null ? metric.data.timestamps[closestIndex] : null,
        parentId: groupKey,
      };
      rowIndex++;

      if (metricsCollection.config !== null && closestIndex !== null) {
        rows[groupKey!].data.aggregation = {
          area: {
            min: metricsCollection.aggregation!.area.min?.yValues[closestIndex],
            max: metricsCollection.aggregation!.area.max?.yValues[closestIndex],
          },
          line: metricsCollection.aggregation!.line?.yValues[closestIndex],
        };
      }

      [
        'experiment',
        'run',
        'metric',
        'context',
        'step',
        'epoch',
        'time',
      ].forEach((key) => {
        if (columnsValues.hasOwnProperty(key)) {
          if (
            _.findIndex(columnsValues[key], (value) =>
              _.isEqual(rowValues[key], value),
            ) === -1
          ) {
            columnsValues[key].push(rowValues[key]);
          }
        } else {
          columnsValues[key] = [rowValues[key]];
        }
      });

      if (!dynamicUpdate) {
        paramKeys.forEach((paramKey) => {
          const value = _.get(metric.run.params, paramKey, '-');
          rowValues[paramKey] = formatValue(value);
          if (columnsValues.hasOwnProperty(paramKey)) {
            if (
              _.findIndex(columnsValues[paramKey], (paramValue) =>
                _.isEqual(value, paramValue),
              ) === -1
            ) {
              columnsValues[paramKey].push(value);
            }
          } else {
            columnsValues[paramKey] = [value];
          }
        });
      }

      if (metricsCollection.config !== null) {
        rows[groupKey!].items.push(
          isRawData
            ? rowValues
            : metricsTableRowRenderer(rowValues, {
                toggleVisibility: (e) => {
                  e.stopPropagation();
                  onRowVisibilityChange(rowValues.key);
                },
              }),
        );
      } else {
        rows.push(
          isRawData
            ? rowValues
            : metricsTableRowRenderer(rowValues, {
                toggleVisibility: (e) => {
                  e.stopPropagation();
                  onRowVisibilityChange(rowValues.key);
                },
              }),
        );
      }
    });

    for (let columnKey in columnsValues) {
      if (columnsValues[columnKey].length === 1) {
        sameValueColumns.push(columnKey);
      }

      if (metricsCollection.config !== null) {
        rows[groupKey!].data[columnKey] =
          columnsValues[columnKey].length === 1
            ? paramKeys.includes(columnKey)
              ? formatValue(columnsValues[columnKey][0])
              : columnsValues[columnKey][0]
            : columnsValues[columnKey];
      }
    }
    if (metricsCollection.config !== null && !isRawData) {
      rows[groupKey!].data = metricsTableRowRenderer(
        rows[groupKey!].data,
        {},
        true,
        ['value'].concat(Object.keys(columnsValues)),
      );
    }
  });

  return { rows, sameValueColumns };
}

function setComponentRefs(refElement: React.MutableRefObject<any> | object) {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
  }
}

function getGroupConfig(
  metricsCollection: IMetricsCollection<IMetric>,
  groupingSelectOptions: IMetricAppModelState['groupingSelectOptions'],
  groupingItems: GroupNameType[] = ['color', 'stroke', 'chart'],
) {
  const configData = model.getState()?.config;
  let groupConfig: { [key: string]: {} } = {};

  for (let groupItemKey of groupingItems) {
    const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
    if (groupItem.length) {
      groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
        Object.assign(acc, {
          [getValueByField(groupingSelectOptions || [], paramKey)]: _.get(
            metricsCollection.config,
            paramKey,
          ),
        });
        return acc;
      }, {});
    }
  }
  return groupConfig;
}

function setTooltipData(
  processedData: IMetricsCollection<IMetric>[],
  paramKeys: string[],
  groupingSelectOptions: IMetricAppModelState['groupingSelectOptions'],
): void {
  const data: { [key: string]: any } = {};

  for (let metricsCollection of processedData) {
    const groupConfig = getGroupConfig(
      metricsCollection,
      groupingSelectOptions,
    );
    for (let metric of metricsCollection.data) {
      data[metric.key] = {
        runHash: metric.run.hash,
        metricName: metric.metric_name,
        metricContext: metric.context,
        groupConfig,
        params: paramKeys.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey]: _.get(metric, `run.params.${paramKey}`),
          });
          return acc;
        }, {}),
      };
    }
  }

  tooltipData = data;
}

function onSearchQueryCopy(): void {
  const selectedMetricsData = model.getState()?.config?.select;
  let query = metricAppModel.getQueryStringFromSelect(selectedMetricsData);
  navigator.clipboard.writeText(query);
  onNotificationAdd({
    id: Date.now(),
    severity: 'success',
    message: 'Run Expression Copied',
  });
}

// Chart Methods

function onHighlightModeChange(mode: HighlightEnum): void {
  const config: IMetricAppConfig | undefined = model.getState()?.config;
  if (config?.chart) {
    const configData = {
      ...config,
      chart: {
        ...config.chart,
        highlightMode: mode,
      },
    };
    model.setState({
      config: configData,
    });
    updateURL(configData);
  }
  analytics.trackEvent(
    `[MetricsExplorer][Chart] Set highlight mode to "${HighlightEnum[
      mode
    ].toLowerCase()}"`,
  );
}

function onZoomChange(zoom: Partial<IChartZoom>): void {
  const config: IMetricAppConfig | undefined = model.getState()?.config;
  if (config?.chart) {
    const configData = {
      ...config,
      chart: {
        ...config.chart,
        zoom: {
          ...config.chart.zoom,
          ...zoom,
        },
      },
    };
    model.setState({
      config: configData,
    });
    updateURL(configData);
  }
  if (!_.isNil(zoom.mode)) {
    analytics.trackEvent(
      `[MetricsExplorer][Chart] Set zoom mode to "${
        zoom.mode === 0 ? 'single' : 'multiple'
      }"`,
    );
  }
}

function onAggregationConfigChange(
  aggregationConfig: Partial<IAggregationConfig>,
): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart && !_.isEmpty(aggregationConfig)) {
    configData.chart = {
      ...configData.chart,
      aggregationConfig: {
        ...configData.chart.aggregationConfig,
        ...aggregationConfig,
      },
    };
    updateModelData(configData, true);
  }
  if (aggregationConfig.methods) {
    analytics.trackEvent(
      `[MetricsExplorer][Chart] Set aggregation area to "${AggregationAreaMethods[
        aggregationConfig.methods.area
      ].toLowerCase()}"`,
    );
    analytics.trackEvent(
      `[MetricsExplorer][Chart] Set aggregation line to "${AggregationAreaMethods[
        aggregationConfig.methods.line
      ].toLowerCase()}"`,
    );
  } else {
    analytics.trackEvent(
      `[MetricsExplorer][Chart] ${
        aggregationConfig.isApplied
          ? 'Aggregate metrics'
          : 'Deaggregate metrics'
      }`,
    );
  }
}

function onSmoothingChange(props: IOnSmoothingChange) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart = { ...configData.chart, ...props };
    updateModelData(configData, true);
  }
  if (props.curveInterpolation) {
    analytics.trackEvent(
      `[MetricsExplorer][Chart] Set interpolation mode to "${
        props.curveInterpolation === CurveEnum.Linear ? 'linear' : 'cubic'
      }"`,
    );
  } else {
    analytics.trackEvent(
      `[MetricsExplorer][Chart] Set smoothening algorithm to "${configData?.chart.smoothingAlgorithm}"`,
      { smoothingFactor: props.smoothingFactor },
    );
  }
}

function onIgnoreOutliersChange(): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.ignoreOutliers = !configData?.chart.ignoreOutliers;
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer][Chart] ${
      !configData?.chart.ignoreOutliers ? 'Ignore' : 'Display'
    } outliers`,
  );
}

function onAxesScaleTypeChange(params: IAxesScaleState): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.axesScaleType = params;
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer][Chart] Set X axis scale type "${params.xAxis}"`,
  );
  analytics.trackEvent(
    `[MetricsExplorer][Chart] Set Y axis scale type "${params.yAxis}"`,
  );
}

function setAggregationEnabled(configData: IMetricAppConfig): void {
  const isAppliedGrouping = isGroupingApplied(configData.grouping);
  configData.chart.aggregationConfig.isEnabled = isAppliedGrouping;
  if (!isAppliedGrouping) {
    configData.chart.aggregationConfig.isApplied = false;
  }
  analytics.trackEvent('[MetricsExplorer][Chart] Enable aggregation');
}

function resetChartZoom(configData: IMetricAppConfig): void {
  configData.chart = {
    ...configData.chart,
    zoom: {
      ...configData.chart.zoom,
      active: false,
      history: [],
    },
  };
  model.setState({ config: configData });
  updateURL(configData);
  analytics.trackEvent('[MetricsExplorer][Chart] Reset zoom');
}

function updateModelData(
  configData: IMetricAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params, contexts } = processData(
    model.getState()?.rawData as IRun<IMetricTrace>[],
  );
  const groupingSelectOptions = [...getGroupingSelectOptions(params, contexts)];
  setTooltipData(data, params, groupingSelectOptions);
  const tableData = getDataAsTableRows(
    data,
    configData?.chart?.focusedState.xValue ?? null,
    params,
    false,
    configData,
    groupingSelectOptions,
  );

  const tableColumns = getMetricsTableColumns(
    params,
    data[0]?.config,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
    configData?.chart?.aggregationConfig.methods,
    configData.table.sortFields,
    onSortChange,
    configData.grouping as any,
    onGroupingSelectChange,
  );
  const tableRef: any = model.getState()?.refs?.tableRef;
  tableRef.current?.updateData({
    newData: tableData.rows,
    newColumns: tableColumns,
    hiddenColumns: configData.table.hiddenColumns!,
  });

  if (shouldURLUpdate) {
    updateURL(configData);
  }

  model.setState({
    config: configData,
    data,
    lineChartData: getDataAsLines(data),
    chartTitleData: getChartTitleData(data, groupingSelectOptions),
    aggregatedData: getAggregatedData(data),
    tableData: tableData.rows,
    tableColumns,
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
  });
}

function onGroupingSelectChange({
  groupName,
  list,
}: IOnGroupingSelectChangeParams) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    resetChartZoom(configData);
    setAggregationEnabled(configData);
    updateModelData(configData, true);
  }
  analytics.trackEvent(`[MetricsExplorer] Group by ${groupName}`);
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
    if (groupName === 'chart') {
      resetChartZoom(configData);
    }
    setAggregationEnabled(configData);
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer] ${
      value ? 'Disable' : 'Enable'
    } grouping by ${groupName} reverse mode`,
  );
}

function onGroupingPaletteChange(index: number): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      paletteIndex: index,
    };
    setAggregationEnabled(configData);
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer] Set color palette to "${
      index === 0 ? '8 distinct colors' : '24 colors'
    }"`,
  );
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
    setAggregationEnabled(configData);
    updateModelData(configData, true);
  }
  analytics.trackEvent('[MetricsExplorer] Reset grouping');
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
    setAggregationEnabled(configData);
    updateModelData(configData, true);
  }
}

function onGroupingPersistenceChange(groupName: 'stroke' | 'color'): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      persistence: {
        ...configData.grouping.persistence,
        [groupName]: !configData.grouping.persistence[groupName],
      },
    };
    setAggregationEnabled(configData);
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer] ${
      !configData?.grouping.persistence[groupName] ? 'Enable' : 'Disable'
    } ${groupName} persistence`,
  );
}

function onChangeTooltip(tooltip: Partial<IChartTooltip>): void {
  let configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    let content = configData.chart.tooltip.content;
    if (tooltip.selectedParams && configData?.chart.focusedState.key) {
      content = filterTooltipContent(
        tooltipData[configData.chart.focusedState.key],
        tooltip.selectedParams,
      );
    }
    configData = {
      ...configData,
      chart: {
        ...configData.chart,
        tooltip: {
          ...configData.chart.tooltip,
          ...tooltip,
          content,
        },
      },
    };

    model.setState({ config: configData });
    updateURL(configData);
  }
  analytics.trackEvent('[MetricsExplorer] Change tooltip content');
}

const onActivePointChange = _.debounce(
  (activePoint: IActivePoint, focusedStateActive: boolean = false): void => {
    const { data, params, refs, config, groupingSelectOptions } =
      model.getState() as IMetricAppModelState;
    if (!!config) {
      const tableRef: any = refs?.tableRef;
      let tableData = null;
      if (config.table.resizeMode !== ResizeModeEnum.Hide) {
        tableData = getDataAsTableRows(
          data,
          activePoint.xValue,
          params,
          false,
          config,
          groupingSelectOptions,
          true,
        );
        if (tableRef) {
          tableRef.current?.updateData({
            newData: tableData.rows,
            dynamicData: true,
          });
          tableRef.current?.setHoveredRow?.(activePoint.key);
          tableRef.current?.setActiveRow?.(
            focusedStateActive ? activePoint.key : null,
          );
          if (focusedStateActive) {
            tableRef.current?.scrollToRow?.(activePoint.key);
          }
        }
      }
      let configData: IMetricAppConfig = config;
      if (configData?.chart) {
        configData = {
          ...configData,
          chart: {
            ...configData.chart,
            focusedState: {
              active: focusedStateActive,
              key: activePoint.key,
              xValue: activePoint.xValue,
              yValue: activePoint.yValue,
              chartIndex: activePoint.chartIndex,
            },
            tooltip: {
              ...configData.chart.tooltip,
              content: filterTooltipContent(
                tooltipData[activePoint.key],
                configData?.chart.tooltip.selectedParams,
              ),
            },
          },
        };

        if (
          config.chart.focusedState.active !== focusedStateActive ||
          (config.chart.focusedState.active &&
            activePoint.key !== config.chart.focusedState.key)
        ) {
          updateURL(configData);
        }
      }

      model.setState({
        config: configData,
      });
    }
  },
  50,
);

// Table Methods

function onTableRowHover(rowKey?: string): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;
    if (chartPanelRef && !configData.chart.focusedState.active) {
      chartPanelRef.current?.setActiveLineAndCircle(rowKey);
    }
  }
}

function onTableRowClick(rowKey?: string): void {
  const configData: IMetricAppConfig | undefined = model.getState()!.config!;
  const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;
  let focusedStateActive = !!rowKey;
  if (
    configData.chart.focusedState.active &&
    configData.chart.focusedState.key === rowKey
  ) {
    focusedStateActive = false;
  }
  chartPanelRef?.current?.setActiveLineAndCircle(
    rowKey || configData?.chart?.focusedState?.key,
    focusedStateActive,
    true,
  );
}

function getFilteredRow(
  columnKeys: string[],
  row: IMetricTableRowData,
): { [key: string]: string } {
  return columnKeys.reduce((acc: { [key: string]: string }, column: string) => {
    let value = row[column];
    if (Array.isArray(value)) {
      value = value.join(', ');
    } else if (typeof value !== 'string') {
      value = value || value === 0 ? JSON.stringify(value) : '-';
    }

    if (column.startsWith('params.')) {
      acc[column.replace('params.', '')] = value;
    } else {
      acc[column] = value;
    }

    return acc;
  }, {});
}

function onExportTableData(e: React.ChangeEvent<any>): void {
  const { data, params, config, groupingSelectOptions } =
    model.getState() as IMetricAppModelState;

  const tableData = getDataAsTableRows(
    data,
    config?.chart?.focusedState.xValue ?? null,
    params,
    true,
    config,
    groupingSelectOptions,
  );
  const tableColumns: ITableColumn[] = getMetricsTableColumns(
    params,
    data[0]?.config,
    config?.table.columnsOrder!,
    config?.table.hiddenColumns!,
    config?.chart?.aggregationConfig.methods,
  );

  const excludedFields: string[] = ['#', 'actions'];
  const filteredHeader: string[] = tableColumns.reduce(
    (acc: string[], column: ITableColumn) =>
      acc.concat(
        excludedFields.indexOf(column.key) === -1 && !column.isHidden
          ? column.key
          : [],
      ),
    [],
  );

  let emptyRow: { [key: string]: string } = {};
  filteredHeader.forEach((column: string) => {
    emptyRow[column] = '--';
  });

  const groupedRows: IMetricTableRowData[][] =
    data.length > 1
      ? Object.keys(tableData.rows).map(
          (groupedRowKey: string) => tableData.rows[groupedRowKey].items,
        )
      : [tableData.rows];

  const dataToExport: { [key: string]: string }[] = [];

  groupedRows.forEach(
    (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
      groupedRow.forEach((row: IMetricTableRowData) => {
        const filteredRow = getFilteredRow(filteredHeader, row);
        dataToExport.push(filteredRow);
      });
      if (groupedRows.length - 1 !== groupedRowIndex) {
        dataToExport.push(emptyRow);
      }
    },
  );

  const blob = new Blob([JsonToCSV(dataToExport)], {
    type: 'text/csv;charset=utf-8;',
  });
  saveAs(blob, `metrics-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
  analytics.trackEvent('[MetricsExplorer] Export runs data to CSV');
}

/**
 * function updateURL has 2 major functionalities:
 *    1. Keeps URL in sync with the app config
 *    2. Stores updated URL in localStorage if App is not in the bookmark state
 * @param {IMetricAppConfig} configData - the current state of the app config
 */
function updateURL(configData = model.getState()!.config!) {
  const { grouping, chart, select } = configData;
  const url: string = getUrlWithParam(
    ['grouping', 'chart', 'select'],
    [encode(grouping), encode(chart), encode(select)],
  );
  if (url === `${window.location.pathname}${window.location.search}`) {
    return;
  }
  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem('metricsUrl', url);
  }
  window.history.pushState(null, '', url);
}

function onNotificationDelete(id: number) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}

function onNotificationAdd(notification: INotification) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id);
  }, 3000);
}

function onResetConfigData(): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    configData.grouping = {
      ...getConfig().grouping,
    };
    configData.chart = { ...getConfig().chart };
    updateModelData(configData, true);
  }
}

async function onAlignmentMetricChange(metric: string) {
  const modelState = model.getState();
  const configData = modelState?.config;
  if (configData?.chart) {
    configData.chart = {
      ...configData.chart,
      alignmentConfig: { metric, type: AlignmentOptionsEnum.CUSTOM_METRIC },
    };
    model.setState({ config: configData });
    updateURL(configData);
  }
  if (modelState?.rawData && configData) {
    model.setState({ requestIsPending: true });
    const runs = modelState?.rawData?.map((item) => {
      const traces = item.traces.map(({ context, metric_name, slice }) => ({
        context,
        metric_name,
        slice,
      }));
      return {
        run_id: item.hash,
        traces,
      };
    });

    const reqBody: IAlignMetricsDataParams = {
      align_by: metric,
      runs,
    };

    try {
      const stream = await metricsService
        .fetchAlignedMetricsData(reqBody)
        .call();

      const runData = await getRunData(stream);
      let missingTraces = false;
      const rawData: any = model.getState()?.rawData?.map((item, index) => {
        return {
          ...item,
          traces: item.traces.map((trace, ind) => {
            let x_axis_iters = runData[index]?.[ind]?.x_axis_iters || null;
            let x_axis_values = runData[index]?.[ind]?.x_axis_iters || null;
            if (!x_axis_iters || !x_axis_values) {
              missingTraces = true;
            }
            let data = {
              ...trace,
              ...runData[index][ind],
            };
            return data;
          }),
        };
      });
      if (missingTraces) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: AlignmentNotificationsEnum.NOT_ALL_ALIGNED,
        });
      }
      setModelData(rawData, configData);
    } catch (ex: any) {
      if (ex.name === 'AbortError') {
        // Abort Error
      } else {
        configData.chart = {
          ...configData.chart,
          alignmentConfig: {
            metric,
            type: AlignmentOptionsEnum.STEP,
          },
        };
        model.setState({ requestIsPending: false });
        updateModelData(configData, true);
        console.log('Unhandled error: ', ex);
      }
    }
  }
  analytics.trackEvent(
    '[MetricsExplorer][Chart] Align X axis by another metric',
  );
}

async function onDensityTypeChange(type: DensityOptions) {
  const modelState = model.getState();
  const configData = modelState?.config;
  if (configData?.chart) {
    configData.chart = {
      ...configData.chart,
      densityType: type,
    };
    model.setState({ config: configData });
  }
  getMetricsData(true).call();
  analytics.trackEvent(
    `[MetricsExplorer][Chart] Set point density to "${DensityOptions[
      type
    ].toLowerCase()}"`,
  );
}

async function getRunData(stream: ReadableStream<IRun<IMetricTrace>[]>) {
  let gen = adjustable_reader(stream);
  let buffer_pairs = decode_buffer_pairs(gen);
  let decodedPairs = decodePathsVals(buffer_pairs);
  let objects = iterFoldTree(decodedPairs, 1);

  const runData = [];
  for await (let [keys, val] of objects) {
    runData.push({
      ...(val as any),
      hash: keys[0],
    });
  }
  return runData;
}

function setModelData(
  rawData: IRun<IMetricTrace>[],
  configData: IMetricAppConfig,
) {
  const sortFields = model.getState()?.config?.table.sortFields;
  const { data, params, contexts } = processData(rawData);
  if (configData) {
    setAggregationEnabled(configData);
  }
  const groupingSelectOptions = [...getGroupingSelectOptions(params, contexts)];
  setTooltipData(data, params, groupingSelectOptions);
  const tableData = getDataAsTableRows(
    data,
    configData?.chart?.focusedState.xValue ?? null,
    params,
    false,
    configData,
    groupingSelectOptions,
  );
  const tableColumns = getMetricsTableColumns(
    params,
    data[0]?.config,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
    configData?.chart?.aggregationConfig.methods,
    sortFields,
    onSortChange,
    configData.grouping as any,
    onGroupingSelectChange,
  );
  if (!model.getState()?.requestIsPending) {
    model.getState()?.refs?.tableRef.current?.updateData({
      newData: tableData.rows,
      newColumns: tableColumns,
    });
  }
  model.setState({
    requestIsPending: false,
    rawData,
    config: configData,
    params,
    data,
    lineChartData: getDataAsLines(data),
    chartTitleData: getChartTitleData(data, groupingSelectOptions),
    aggregatedData: getAggregatedData(data),
    tableData: tableData.rows,
    tableColumns: tableColumns,
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
  });
}

function onAlignmentTypeChange(type: AlignmentOptionsEnum): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    const alignmentConfig = { ...configData.chart.alignmentConfig, type };

    if (type !== AlignmentOptionsEnum.CUSTOM_METRIC) {
      alignmentConfig.metric = '';
    }
    configData.chart = {
      ...configData.chart,
      alignmentConfig,
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer][Chart] Align X axis by "${AlignmentOptionsEnum[
      type
    ].toLowerCase()}"`,
  );
}

function onMetricsSelectChange(data: ISelectMetricsOption[]) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, metrics: data },
    };

    model.setState({
      config: newConfig,
    });
  }
}

function onSelectRunQueryChange(query: string) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, query },
    };

    model.setState({
      config: newConfig,
    });
  }
}

function onSelectAdvancedQueryChange(query: string) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query },
    };
    model.setState({
      config: newConfig,
    });
  }
}

function toggleSelectAdvancedMode() {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  let query = configData?.select.advancedQuery
    ? configData.select.advancedQuery
    : getQueryStringFromSelect(configData?.select);
  if (query === '()') {
    query = '';
  }
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: {
        ...configData.select,
        advancedQuery: query,
        advancedMode: !configData.select.advancedMode,
      },
    };

    model.setState({
      config: newConfig,
    });
  }
  analytics.trackEvent(
    `[MetricsExplorer] Turn ${
      !configData?.select.advancedMode ? 'on' : 'off'
    } the advanced mode of select form`,
  );
}

function onRowHeightChange(height: RowHeightSize) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      rowHeight: height,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
  }
  analytics.trackEvent(
    `[MetricsExplorer][Table] Set table row height to "${RowHeightEnum[
      height
    ].toLowerCase()}"`,
  );
}

function onMetricVisibilityChange(metricsKeys: string[]) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  const processedData = model.getState()?.data;
  if (configData?.table && processedData) {
    const table = {
      ...configData.table,
      hiddenMetrics:
        metricsKeys[0] === 'all'
          ? Object.values(processedData)
              .map((metricCollection) =>
                metricCollection.data.map((metric) => metric.key),
              )
              .flat()
          : metricsKeys,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
    updateModelData(config);
  }
  analytics.trackEvent(
    `[MetricsExplorer][Table] ${
      metricsKeys[0] === 'all'
        ? 'Visualize all hidden metrics from table'
        : 'Hide all metrics from table'
    }`,
  );
}

function onRowVisibilityChange(metricKey: string) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    let hiddenMetrics = configData?.table?.hiddenMetrics || [];
    if (hiddenMetrics?.includes(metricKey)) {
      hiddenMetrics = hiddenMetrics.filter(
        (hiddenMetric) => hiddenMetric !== metricKey,
      );
    } else {
      hiddenMetrics = [...hiddenMetrics, metricKey];
    }
    const table = {
      ...configData.table,
      hiddenMetrics,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
    updateModelData(config);
  }
}

function onColumnsVisibilityChange(hiddenColumns: string[]) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  const columnsData = model.getState()!.tableColumns!;
  if (configData?.table) {
    const table = {
      ...configData.table,
      hiddenColumns:
        hiddenColumns[0] === 'all'
          ? columnsData.map((col) => col.key)
          : hiddenColumns,
    };
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });
    setItem('metricsTable', encode(table));
    updateModelData(configUpdate);
  }
  if (hiddenColumns[0] === 'all') {
    analytics.trackEvent('[MetricsExplorer][Table] Hide all table columns');
  } else if (_.isEmpty(hiddenColumns)) {
    analytics.trackEvent('[MetricsExplorer][Table] Show all table columns');
  }
}

function onTableDiffShow() {
  const sameValueColumns = model.getState()?.sameValueColumns;
  if (sameValueColumns) {
    onColumnsVisibilityChange(sameValueColumns);
  }
  analytics.trackEvent('[MetricsExplorer][Table] Show table columns diff');
}

function onColumnsOrderChange(columnsOrder: any) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      columnsOrder: columnsOrder,
    };
    const config = {
      ...configData,
      table,
    };

    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
    updateModelData(config);
  }
  if (
    _.isEmpty(columnsOrder?.left) &&
    _.isEmpty(columnsOrder?.middle) &&
    _.isEmpty(columnsOrder?.right)
  ) {
    analytics.trackEvent('[MetricsExplorer][Table] Reset table columns order');
  }
}

function onTableResizeModeChange(mode: ResizeModeEnum): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      resizeMode: mode,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
  }
  analytics.trackEvent(
    `[MetricsExplorer][Table] Set table view mode to "${mode}"`,
  );
}

function onTableResizeEnd(tableHeight: string) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      height: tableHeight,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
  }
}

// internal function to update config.table.sortFields and cache data
function updateSortFields(sortFields: SortField[]) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      sortFields,
    };
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });

    setItem('metricsTable', encode(table));
    updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[MetricsExplorer][Table] ${
      _.isEmpty(sortFields) ? 'Reset' : 'Apply'
    } table sorting by a key`,
  );
}

// set empty array to config.table.sortFields
function onSortReset() {
  updateSortFields([]);
}

/**
 * function onSortChange has 3 major functionalities
 *    1. if only field param passed, the function will change sort option with the following cycle ('asc' -> 'desc' -> none -> 'asc)
 *    2. if value param passed 'asc' or 'desc', the function will replace the sort option of the field in sortFields
 *    3. if value param passed 'none', the function will delete the field from sortFields
 * @param {String} field  - the name of the field (i.e params.dataset.preproc)
 * @param {'asc' | 'desc' | 'none'} value - 'asc' | 'desc' | 'none'
 */
function onSortChange(field: string, value?: 'asc' | 'desc' | 'none') {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  const sortFields = configData?.table.sortFields || [];

  const existField = sortFields?.find((d: SortField) => d[0] === field);
  let newFields: SortField[] = [];

  if (value && existField) {
    if (value === 'none') {
      // delete
      newFields = sortFields?.filter(
        ([name]: SortField) => name !== existField[0],
      );
    } else {
      newFields = sortFields.map(([name, v]: SortField) =>
        name === existField[0] ? [name, value] : [name, v],
      );
    }
  } else {
    if (existField) {
      if (existField[1] === 'asc') {
        // replace to desc
        newFields = sortFields?.map(([name, value]: SortField) => {
          return name === existField[0] ? [name, 'desc'] : [name, value];
        });
      } else {
        // delete field
        newFields = sortFields?.filter(
          ([name]: SortField) => name !== existField[0],
        );
      }
    } else {
      // add field
      newFields = [...sortFields, [field, 'asc']];
    }
  }
  updateSortFields(newFields);
}

function updateColumnsWidths(key: string, width: number, isReset: boolean) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table && configData?.table?.columnsWidths) {
    let columnsWidths = configData?.table?.columnsWidths;
    if (isReset) {
      columnsWidths = _.omit(columnsWidths, [key]);
    } else {
      columnsWidths = { ...columnsWidths, [key]: width };
    }
    const table = {
      ...configData.table,
      columnsWidths,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
    updateModelData(config);
  }
}

function changeLiveUpdateConfig(config: { enabled?: boolean; delay?: number }) {
  const state = model.getState();
  const configData = state?.config;
  const liveUpdateConfig = configData?.liveUpdate;
  const metric = configData?.chart.alignmentConfig.metric;
  let query = getQueryStringFromSelect(configData?.select);

  if (!liveUpdateConfig?.enabled && config.enabled && query !== '()') {
    liveUpdateInstance = new LiveUpdateService(
      'metrics',
      updateData,
      config.delay || liveUpdateConfig?.delay,
    );
    liveUpdateInstance?.start({
      q: query,
      ...(metric && { x_axis: metric }),
    });
  } else {
    liveUpdateInstance?.clear();
    liveUpdateInstance = null;
  }

  const newLiveUpdateConfig = {
    ...liveUpdateConfig,
    ...config,
  };
  model.setState({
    config: {
      ...configData,
      // @ts-ignore
      liveUpdate: newLiveUpdateConfig,
    },
  });
  setItem('metricsLUConfig', encode(newLiveUpdateConfig));
}

function destroy() {
  liveUpdateInstance?.clear();
  liveUpdateInstance = null; //@TODO check is this need or not
}

const metricAppModel = {
  ...model,
  destroy,
  initialize,
  getMetricsData,
  getAppConfigData,
  getDataAsTableRows,
  setComponentRefs,
  setDefaultAppConfigData,
  onHighlightModeChange,
  onZoomChange,
  onSmoothingChange,
  onIgnoreOutliersChange,
  onAxesScaleTypeChange,
  onAggregationConfigChange,
  onActivePointChange,
  onTableRowHover,
  onTableRowClick,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  onBookmarkCreate,
  onNotificationDelete,
  onNotificationAdd,
  onBookmarkUpdate,
  onResetConfigData,
  onAlignmentMetricChange,
  onAlignmentTypeChange,
  onMetricsSelectChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
  onChangeTooltip,
  onExportTableData,
  onRowHeightChange,
  onMetricVisibilityChange,
  onColumnsVisibilityChange,
  onTableDiffShow,
  onColumnsOrderChange,
  getQueryStringFromSelect,
  onTableResizeModeChange,
  onTableResizeEnd,
  onSortReset,
  onSortChange,
  updateColumnsWidths,
  updateURL,
  updateModelData,
  onShuffleChange,
  onSearchQueryCopy,
  onDensityTypeChange,
  changeLiveUpdateConfig,
};

export default metricAppModel;
