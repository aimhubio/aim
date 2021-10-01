import React from 'react';

import _, { isEmpty, isNil } from 'lodash-es';
// import { saveAs } from 'file-saver';
// import moment from 'moment';
import COLORS from 'config/colors/colors';
// import metricsService from 'services/api/metrics/metricsService';
import createModel from '../model';
import { decode, encode } from 'utils/encoder/encoder';
// import getClosestValue from 'utils/getClosestValue';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import getObjectPaths from 'utils/getObjectPaths';
// import {
//   getMetricsTableColumns,
//   metricsTableRowRenderer,
// } from 'pages/Metrics/components/MetricsTableGrid/MetricsTableGrid';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
// import appsService from 'services/api/apps/appsService';
// import dashboardService from 'services/api/dashboard/dashboardService';
import getUrlWithParam from 'utils/getUrlWithParam';
// import getStateFromUrl from 'utils/getStateFromUrl';
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
import { CurveEnum, ScaleEnum } from 'utils/d3';
import { IBookmarkFormState } from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import {
  AlignmentNotificationsEnum,
  BookmarkNotificationsEnum,
} from 'config/notification-messages/notificationMessages';
import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { filterArrayByIndexes } from 'utils/filterArrayByIndexes';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { getItem, setItem } from 'utils/storage';
import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';
import { ResizeModeEnum, RowHeightEnum } from 'config/enums/tableEnums';
import * as analytics from 'services/analytics';
import { formatValue } from 'utils/formatValue';
import imagesExploreMockData from './imagesExploreMockData';

const model = createModel<Partial<any>>({
  requestIsPending: true,
});
let tooltipData: ITooltipData = {};

function getConfig(): any {
  return {
    grouping: {
      groupBy: [],
      reverseMode: {
        groupBy: false,
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
  };
}

let appRequestRef: {
  call: () => Promise<IAppData>;
  abort: () => void;
};

function initialize(appId: string): void {
  model.init();
  model.setState({
    config: getConfig(),
  });
  // if (!appId) {
  //   setDefaultAppConfigData();
  // }
}

// function setDefaultAppConfigData() {
//   const grouping: IMetricAppConfig['grouping'] =
//     getStateFromUrl('grouping') || getConfig().grouping;
//   const chart: IMetricAppConfig['chart'] =
//     getStateFromUrl('chart') || getConfig().chart;
//   const select: IMetricAppConfig['select'] =
//     getStateFromUrl('select') || getConfig().select;

//   const tableConfigHash = getItem('metricsTable');
//   const table = tableConfigHash
//     ? JSON.parse(decode(tableConfigHash))
//     : getConfig().table;
//   const configData: IMetricAppConfig = _.merge(getConfig(), {
//     chart, // not useful
//     grouping, // not useful
//     select,
//     table,
//   });

//   model.setState({
//     config: configData,
//   });
// }

// function getAppConfigData(appId: string) {
//   if (appRequestRef) {
//     appRequestRef.abort();
//   }
//   appRequestRef = appsService.fetchApp(appId);
//   return {
//     call: async () => {
//       const appData = await appRequestRef.call();
//       const configData: IMetricAppConfig = _.merge(getConfig(), appData.state);
//       model.setState({
//         config: configData,
//       });
//     },
//     abort: appRequestRef.abort,
//   };
// }

// function getQueryStringFromSelect(
//   selectData: IMetricAppConfig['select'] | undefined,
// ) {
//   let query = '';
//   if (selectData !== undefined) {
//     if (selectData.advancedMode) {
//       query = selectData.advancedQuery;
//     } else {
//       query = `${
//         selectData.query ? `${selectData.query} and ` : ''
//       }(${selectData.metrics
//         .map((metric) =>
//           metric.value.context === null
//             ? `(metric.name == "${metric.value.metric_name}")`
//             : `${Object.keys(metric.value.context).map(
//                 (item) =>
//                   `(metric.name == "${
//                     metric.value.metric_name
//                   }" and metric.context.${item} == "${
//                     (metric.value.context as any)[item]
//                   }")`,
//               )}`,
//         )
//         .join(' or ')})`.trim();
//     }
//   }

//   return query;
// }

let imagesRequestRef: {
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

  setTimeout(() => {
    const tableRef: any = model.getState()?.refs?.tableRef;
    tableRef.current?.updateData({
      newData: [],
      newColumns: [],
    });
  }, 0);
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

function getImagesData() {
  if (imagesRequestRef) {
    imagesRequestRef.abort();
  }
  const modelState: any = model.getState();
  const configData = modelState?.config;
  // const metric = configData?.chart.alignmentConfig.metric;
  // let query = getQueryStringFromSelect(configData?.select);
  // imagesRequestRef = metricsService.getMetricsData({
  //   q: query,
  //   ...(metric && { x_axis: metric }),
  // });
  return {
    call: async () => {
      // if (query === '') {
      //   model.setState({
      //     requestIsPending: false,
      //     queryIsEmpty: true,
      //   });
      // } else {
      model.setState({
        requestIsPending: true,
        queryIsEmpty: false,
      });
      // const stream = await metricsRequestRef.call(exceptionHandler);
      // const runData = await getRunData(stream);
      // if (configData) {
      setModelData(imagesExploreMockData, getConfig());
      // }
      // }
    },
    // abort: imagesRequestRef.abort,
    abort: () => {},
  };
}

// function getChartTitleData(
//   processedData: IMetricsCollection<IMetric>[],
//   configData: IMetricAppConfig | any = model.getState()?.config,
// ): IChartTitleData {
//   if (!processedData) {
//     return {};
//   }
//   const groupData = configData?.grouping;
//   let chartTitleData: IChartTitleData = {};
//   processedData.forEach((metricsCollection) => {
//     if (!chartTitleData[metricsCollection.chartIndex]) {
//       chartTitleData[metricsCollection.chartIndex] = groupData.chart.reduce(
//         (acc: IChartTitle, groupItemKey: string) => {
//           if (metricsCollection.config?.hasOwnProperty(groupItemKey)) {
//             acc[groupItemKey.replace('run.params.', '')] = JSON.stringify(
//               metricsCollection.config[groupItemKey] || 'None',
//             );
//           }
//           return acc;
//         },
//         {},
//       );
//     }
//   });
//   return chartTitleData;
// }

function getGroupingSelectOptions(params: string[]): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    value: `run.params.${param}`,
    group: 'params',
    label: param,
  }));

  return [
    ...paramsOptions,
    {
      group: 'Other',
      label: 'experiment',
      value: 'run.props.experiment',
    },
    {
      group: 'Other',
      label: 'run.hash',
      value: 'run.hash',
    },
    {
      group: 'Other',
      label: 'metric',
      value: 'metric_name',
    },
    {
      group: 'context',
      label: 'subset',
      value: 'context.subset',
    },
  ];
}

function processData(data: IRun<IMetricTrace>[]): {
  data: IMetricsCollection<IMetric>[];
  params: string[];
} {
  const configData = model.getState()?.config;
  let metrics: any[] = [];
  let params: string[] = [];

  data.forEach((run: any) => {
    params = params.concat(getObjectPaths(run.params, run.params));

    run.images.forEach((imageData: any) => {
      imageData.values.forEach((stepData: any, stepIndex: number) => {
        stepData.forEach((image: any) => {
          const metricKey = encode({
            runHash: run.hash,
            metricName: imageData.metric_name,
            traceContext: imageData.context,
            index: image.index,
            step: stepIndex + 1,
          });
          metrics.push({
            step: stepIndex + 1,
            index: image.index,
            src: image.blob,
            metric_name: imageData.name,
            context: imageData.name,
            run: _.omit(run, 'images'),
            key: metricKey,
          });
        });
      });
    });
  });
  const processedData = groupData(
    _.orderBy(
      metrics,
      configData?.table?.sortFields?.map(
        (f: any) =>
          function (metric: any) {
            return _.get(metric, f[0], '');
          },
      ) ?? [],
      configData?.table?.sortFields?.map((f: any) => f[1]) ?? [],
    ),
  );
  const uniqParams = _.uniq(params);

  // setTooltipData(processedData, uniqParams);

  return {
    data: processedData,
    params: uniqParams,
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
  const groupingFields = ['index', 'step'];

  if (groupingFields.length === 0) {
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
    [key: string]: any;
  } = {};

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
        // color: null,
        // dasharray: null,
        // chartIndex: 0,
        data: [data[i]],
      };
    }
  }

  // let colorIndex = 0;
  // let dasharrayIndex = 0;
  // let chartIndex = 0;

  // const colorConfigsMap: { [key: string]: number } = {};
  // const dasharrayConfigsMap: { [key: string]: number } = {};
  // const chartIndexConfigsMap: { [key: string]: number } = {};

  // for (let groupKey in groupValues) {
  //   const groupValue = groupValues[groupKey];

  // if (groupByColor.length > 0) {
  //   const colorConfig = _.pick(groupValue.config, groupByColor);
  //   const colorKey = encode(colorConfig);

  //   if (grouping.persistence.color && grouping.isApplied.color) {
  //     let index = getGroupingPersistIndex({
  //       groupValues,
  //       groupKey,
  //       grouping,
  //     });
  //     groupValue.color =
  //       COLORS[paletteIndex][
  //         Number(index % BigInt(COLORS[paletteIndex].length))
  //       ];
  //   } else if (colorConfigsMap.hasOwnProperty(colorKey)) {
  //     groupValue.color =
  //       COLORS[paletteIndex][
  //         colorConfigsMap[colorKey] % COLORS[paletteIndex].length
  //       ];
  //   } else {
  //     colorConfigsMap[colorKey] = colorIndex;
  //     groupValue.color =
  //       COLORS[paletteIndex][colorIndex % COLORS[paletteIndex].length];
  //     colorIndex++;
  //   }
  // }

  // if (groupByStroke.length > 0) {
  //   const dasharrayConfig = _.pick(groupValue.config, groupByStroke);
  //   const dasharrayKey = encode(dasharrayConfig);
  //   if (grouping.persistence.stroke && grouping.isApplied.stroke) {
  //     let index = getGroupingPersistIndex({
  //       groupValues,
  //       groupKey,
  //       grouping,
  //     });
  //     groupValue.dasharray =
  //       DASH_ARRAYS[Number(index % BigInt(DASH_ARRAYS.length))];
  //   } else if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
  //     groupValue.dasharray =
  //       DASH_ARRAYS[dasharrayConfigsMap[dasharrayKey] % DASH_ARRAYS.length];
  //   } else {
  //     dasharrayConfigsMap[dasharrayKey] = dasharrayIndex;
  //     groupValue.dasharray = DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
  //     dasharrayIndex++;
  //   }
  // }

  // if (groupByChart.length > 0) {
  //   const chartIndexConfig = _.pick(groupValue.config, groupByChart);
  //   const chartIndexKey = encode(chartIndexConfig);
  //   if (chartIndexConfigsMap.hasOwnProperty(chartIndexKey)) {
  //     groupValue.chartIndex = chartIndexConfigsMap[chartIndexKey];
  //   } else {
  //     chartIndexConfigsMap[chartIndexKey] = chartIndex;
  //     groupValue.chartIndex = chartIndex;
  //     chartIndex++;
  //   }
  // }
  // }

  // const groups = alignData(Object.values(groupValues));
  // const chartConfig = configData!.chart;

  // return aggregateGroupData({
  //   groupData: Object.values(groupValues),
  //   methods: {
  //     area: chartConfig.aggregationConfig.methods.area,
  //     line: chartConfig.aggregationConfig.methods.line,
  //   },
  //   scale: chartConfig.axesScaleType,
  // });
  return Object.values(groupValues);
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
  groupingItems: GroupNameType[] = ['color', 'stroke', 'chart'],
) {
  const configData = model.getState()?.config;
  let groupConfig: { [key: string]: {} } = {};

  for (let groupItemKey of groupingItems) {
    const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
    if (groupItem.length) {
      groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
        Object.assign(acc, {
          [paramKey.replace('run.params.', '')]: JSON.stringify(
            _.get(metricsCollection.config, paramKey, '-'),
          ),
        });
        return acc;
      }, {});
    }
  }
  return groupConfig;
}

function updateModelData(
  configData: IMetricAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params } = processData(
    model.getState()?.rawData as IRun<IMetricTrace>[],
  );
  // const tableData = getDataAsTableRows(
  //   data,
  //   configData?.chart?.focusedState.xValue ?? null,
  //   params,
  //   false,
  //   configData,
  // );
  const groupingSelectOptions = [...getGroupingSelectOptions(params)];
  // const tableColumns = getMetricsTableColumns(
  //   params,
  //   data[0]?.config,
  //   configData.table.columnsOrder!,
  //   configData.table.hiddenColumns!,
  //   configData?.chart?.aggregationConfig.methods,
  //   configData.table.sortFields,
  //   // onSortChange,
  // );
  // const tableRef: any = model.getState()?.refs?.tableRef;
  // tableRef.current?.updateData({
  //   newData: tableData.rows,
  //   newColumns: tableColumns,
  //   hiddenColumns: configData.table.hiddenColumns!,
  // });

  if (shouldURLUpdate) {
    updateURL(configData);
  }

  model.setState({
    config: configData,
    data,
    // lineChartData: getDataAsLines(data),
    // chartTitleData: getChartTitleData(data),
    // aggregatedData: getAggregatedData(data),
    // tableData: tableData.rows,
    // tableColumns,
    // sameValueColumns: tableData.sameValueColumns,
    // groupingSelectOptions,
  });
}

function onGroupingSelectChange({
  groupName,
  list,
}: IOnGroupingSelectChangeParams) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    // resetChartZoom(configData);
    // setAggregationEnabled(configData);
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
  }
  analytics.trackEvent('[MetricsExplorer] Change tooltip content');
}

function onActivePointChange(
  activePoint: IActivePoint,
  focusedStateActive: boolean = false,
): void {
  const { data, params, refs, config }: any = model.getState();
  // const tableRef: any = refs?.tableRef;
  // const tableData = getDataAsTableRows(
  //   data,
  //   activePoint.xValue,
  //   params,
  //   false,
  //   config,
  // );
  // if (tableRef) {
  //   tableRef.current?.updateData({
  //     newData: tableData.rows,
  //     dynamicData: true,
  //   });
  //   tableRef.current?.setHoveredRow?.(activePoint.key);
  //   tableRef.current?.setActiveRow?.(
  //     focusedStateActive ? activePoint.key : null,
  //   );
  //   if (focusedStateActive) {
  //     tableRef.current?.scrollToRow?.(activePoint.key);
  //   }
  // }
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

    if (config.chart.focusedState.active !== focusedStateActive) {
      updateURL(configData);
    }
  }

  model.setState({
    // tableData: tableData.rows,
    config: configData,
  });
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

function setModelData(rawData: any[], configData: any) {
  // const sortFields = model.getState()?.config?.table.sortFields;
  const { data, params } = processData(rawData);
  // if (configData) {
  //   setAggregationEnabled(configData);
  // }
  // const tableData = getDataAsTableRows(
  //   data,
  //   configData?.chart?.focusedState.xValue ?? null,
  //   params,
  //   false,
  //   configData,
  // );
  model.setState({
    requestIsPending: false,
    rawData,
    config: configData,
    params,
    data,
    //@ts-ignore
    imagesData: data,
    // chartTitleData: getChartTitleData(data),
    // aggregatedData: getAggregatedData(data),
    // tableData: tableData.rows,
    // tableColumns: getMetricsTableColumns(
    //   params,
    //   data[0]?.config,
    //   configData.table.columnsOrder!,
    //   configData.table.hiddenColumns!,
    //   configData?.chart?.aggregationConfig.methods,
    //   sortFields,
    //   // onSortChange,
    // ),
    // sameValueColumns: tableData.sameValueColumns,
    // groupingSelectOptions: [...getGroupingSelectOptions(params)],
  });
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

const metricAppModel = {
  ...model,
  initialize,
  getImagesData,
  // getAppConfigData,
  // getDataAsTableRows,
  setComponentRefs,
  // setDefaultAppConfigData,
  // onHighlightModeChange,
  // onZoomChange,
  // onSmoothingChange,
  // onIgnoreOutliersChange,
  // onAxesScaleTypeChange,
  // onAggregationConfigChange,
  onActivePointChange,
  // onTableRowHover,
  // onTableRowClick,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  // onBookmarkCreate,
  // onNotificationDelete,
  // onNotificationAdd,
  // onBookmarkUpdate,
  onResetConfigData,
  // onAlignmentMetricChange,
  // onAlignmentTypeChange,
  // onMetricsSelectChange,
  // onSelectRunQueryChange,
  // onSelectAdvancedQueryChange,
  // toggleSelectAdvancedMode,
  onChangeTooltip,
  // onExportTableData,
  // onRowHeightChange,
  // onMetricVisibilityChange,
  // onColumnsVisibilityChange,
  // onTableDiffShow,
  // onColumnsOrderChange,
  // getQueryStringFromSelect,
  // onTableResizeModeChange,
  // onTableResizeEnd,
  // onSortReset,
  // onSortChange,
  // updateColumnsWidths,
  updateURL,
  updateModelData,
};

export default metricAppModel;
