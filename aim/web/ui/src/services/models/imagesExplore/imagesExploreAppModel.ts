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
      isApplied: {
        groupBy: true,
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
    imagesData: getDataAsImageSet(data),
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
    groupingSelectOptions: [...getGroupingSelectOptions(params)],
  });
}

function updateModelData(
  configData: IMetricAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params } = processData(model.getState()?.rawData);
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

  // if (shouldURLUpdate) {
  //   updateURL(configData);
  // }

  model.setState({
    config: configData,
    data: model.getState()?.data,
    imagesData: getDataAsImageSet(data),
    // lineChartData: getDataAsLines(data),
    // chartTitleData: getChartTitleData(data),
    // aggregatedData: getAggregatedData(data),
    // tableData: tableData.rows,
    // tableColumns,
    // sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
  });
}

function getFilteredGroupingOptions(grouping: any): string[] {
  const { reverseMode, isApplied } = grouping;
  const groupingSelectOptions = model.getState()?.groupingSelectOptions;
  if (groupingSelectOptions) {
    const filteredOptions = [...groupingSelectOptions]
      .filter((opt) => grouping['groupBy'].indexOf(opt.value) === -1)
      .map((item) => item.value);
    return isApplied['groupBy']
      ? reverseMode['groupBy']
        ? filteredOptions
        : grouping['groupBy']
      : [];
  } else {
    return [];
  }
}

function getGroupingSelectOptions(
  params: string[] = [],
): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params?.map((param) => ({
    value: `run.params.${param}`,
    group: 'params',
    label: param,
  }));

  return [
    ...paramsOptions,
    {
      group: 'Other',
      label: 'run.hash',
      value: 'run.hash',
    },
    {
      group: 'Other',
      label: 'step',
      value: 'step',
    },
    {
      group: 'Other',
      label: 'index',
      value: 'index',
    },
  ];
}

function groupData(data: IMetric[]): any {
  const configData = model.getState()!.config;
  const grouping = configData!.grouping;
  const groupingFields = getFilteredGroupingOptions(grouping);

  if (groupingFields.length === 0) {
    return [
      {
        config: [],
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
        data: [data[i]],
      };
    }
  }
  return Object.values(groupValues);
}

function setComponentRefs(refElement: React.MutableRefObject<any> | object) {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
  }
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
  console.log(value);
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      groupBy: value,
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer] ${
      value ? 'Disable' : 'Enable'
    } grouping by groupBy reverse mode`,
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

function onGroupingApplyChange(): void {
  const configData: any = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      isApplied: {
        ...configData.grouping.isApplied,
        groupBy: !configData.grouping.isApplied['groupBy'],
      },
    };
    updateModelData(configData, true);
  }
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

function getDataAsImageSet(data: any) {
  if (!isEmpty(data)) {
    const imageSetData: any = {};
    const groupFields = Object.keys(data[0].config);
    data.forEach((group: any) => {
      const path = groupFields.reduce((acc, field: any) => {
        acc.push(`${field}=${_.get(group.data[0], field)}`);
        return acc;
      }, [] as any);
      _.set(imageSetData, path, group.data);
    });
    return isEmpty(imageSetData) ? data[0].data : imageSetData;
  } else {
    return {};
  }
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
  setComponentRefs,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingReset,
  onGroupingApplyChange,
  onNotificationDelete,
  onNotificationAdd,
  onResetConfigData,
  updateURL,
  updateModelData,
};

export default metricAppModel;
