import React from 'react';

import _, { isEmpty } from 'lodash-es';
import createModel from '../model';
import { decode, encode } from 'utils/encoder/encoder';
import getObjectPaths from 'utils/getObjectPaths';
import getUrlWithParam from 'utils/getUrlWithParam';
// import getStateFromUrl from 'utils/getStateFromUrl';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { RowHeightSize } from 'config/table/tableConfigs';
import getStateFromUrl from 'utils/getStateFromUrl';

// Types
import {
  GroupNameType,
  IAppData,
  IDashboardData,
  IGroupingSelectOption,
  IMetricAppConfig,
  IMetricsCollection,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IMetricTrace, IRun } from 'types/services/models/metrics/runModel';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { getItem, setItem } from 'utils/storage';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import * as analytics from 'services/analytics';
import imagesExploreMockData from './imagesExploreMockData';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';

const model = createModel<Partial<any>>({
  requestIsPending: true,
});

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
  // model.setState({
  //   config: getConfig(),
  // });
  if (!appId) {
    setDefaultAppConfigData();
  }
}

function setDefaultAppConfigData() {
  const grouping: any = getStateFromUrl('grouping') || getConfig().grouping;
  const select: any = getStateFromUrl('select') || getConfig().select;
  const tableConfigHash = getItem('imagesExploreTable');
  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;
  const configData = _.merge(getConfig(), {
    grouping, // not useful
    select,
    table,
  });

  model.setState({
    config: configData,
  });
}

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
      if (configData) {
        setModelData(imagesExploreMockData, configData);
      }
      // }
    },
    // abort: imagesRequestRef.abort,
    abort: () => {},
  };
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

  if (shouldURLUpdate) {
    updateURL(configData);
  }

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
  const { grouping, select } = configData;
  const url: string = getUrlWithParam(
    ['grouping', 'select'],
    [encode(grouping), encode(select)],
  );

  if (url === `${window.location.pathname}${window.location.search}`) {
    return;
  }

  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem('imagesExploreUrl', url);
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
    const configData = model.getState()?.config;
    const imageSetData: any = {};
    const groupFields = configData?.grouping?.groupBy;
    data.forEach((group: any) => {
      const path = groupFields.reduce((acc: any, field: any) => {
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

async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: any = model.getState()?.config;
  if (configData) {
    const app: IAppData | any = await appsService
      .createApp({ state: configData, type: 'images-explore' })
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
  analytics.trackEvent('[ImagesExplore] Create bookmark');
}

function onBookmarkUpdate(id: string) {
  const configData: any = model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: 'images-explore' })
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
  analytics.trackEvent('[ImagesExplore] Update bookmark');
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
  onBookmarkUpdate,
  onBookmarkCreate,
  getAppConfigData,
  setDefaultAppConfigData,
};

export default metricAppModel;
