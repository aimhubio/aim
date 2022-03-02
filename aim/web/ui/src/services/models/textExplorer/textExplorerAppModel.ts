import _ from 'lodash-es';
import moment from 'moment';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import COLORS from 'config/colors/colors';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import {
  getTablePanelColumns,
  textsTablePanelRowRenderer,
} from 'pages/TextExplorer/components/TextPanelGrid/TextPanelGrid';

import projectsService from 'services/api/projects/projectsService';
import appsService from 'services/api/apps/appsService';
import textExplorerService from 'services/api/textExplorer/textExplorerService';
import dashboardService from 'services/api/dashboard/dashboardService';
import * as analytics from 'services/analytics';

import {
  IAppData,
  IDashboardData,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import {
  ITextExplorerAppConfig,
  ITextExplorerAppModelState,
} from 'types/services/models/textExplorer/texteExplorerAppModel';
import {
  ISelectConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';
import {
  IImageData,
  IImageRunData,
} from 'types/services/models/imagesExplore/imagesExploreAppModel';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';

import { getCompatibleSelectConfig } from 'utils/app/getCompatibleSelectConfig';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import { formatValue } from 'utils/formatValue';
import getUrlWithParam from 'utils/getUrlWithParam';
import { decode, encode } from 'utils/encoder/encoder';
import { getItem, setItem } from 'utils/storage';
import { getParamsSuggestions } from 'utils/app/getParamsSuggestions';
import contextToString from 'utils/contextToString';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import getStateFromUrl from 'utils/getStateFromUrl';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import getObjectPaths from 'utils/getObjectPaths';
import getValueByField from 'utils/getValueByField';
import onRowVisibilityChange from 'utils/app/onRowVisibilityChange';
import { isSystemMetric } from 'utils/isSystemMetric';
import { getValue } from 'utils/helper';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';
import blobsURIModel from '../media/blobsURIModel';

const model = createModel<Partial<ITextExplorerAppModelState>>({
  requestStatus: RequestStatusEnum.NotRequested,
  searchButtonDisabled: false,
  applyButtonDisabled: true,
  selectFormData: {
    options: undefined,
    suggestions: [],
  },
  notifyData: [],
});

function getConfig(): ITextExplorerAppConfig {
  return {
    select: {
      options: [],
      query: '',
      advancedMode: false,
      advancedQuery: '',
    },
    texts: {
      indexDensity: '5',
      recordDensity: '50',
      inputsValidations: {},
    },
    table: {
      resizeMode: ResizeModeEnum.Resizable,
      rowHeight: RowHeightSize.md,
      sortFields: [],
      hiddenMetrics: [],
      hiddenColumns: [],
      hideSystemMetrics: undefined,
      columnsWidths: {},
      columnsOrder: {
        left: [],
        middle: [],
        right: [],
      },
      height: '0.5',
    },
  };
}

let appRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<IAppData>;
  abort: () => void;
};

let textsRequestRef: {
  call: (
    exceptionHandler: (detail: any) => void,
  ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
  abort: () => void;
};

function getSelectFormOptions(projectsData: IProjectParamsMetrics) {
  let data: ISelectOption[] = [];
  let index: number = 0;
  if (projectsData?.texts) {
    for (let key in projectsData.texts) {
      data.push({
        label: key,
        group: key,
        color: COLORS[0][index % COLORS[0].length],
        value: {
          option_name: key,
          context: null,
        },
      });
      index++;

      for (let val of projectsData.texts[key]) {
        if (!_.isEmpty(val)) {
          let label = contextToString(val);
          data.push({
            label: `${key} ${label}`,
            group: key,
            color: COLORS[0][index % COLORS[0].length],
            value: {
              option_name: key,
              context: val,
            },
          });
          index++;
        }
      }
    }
  }

  return data.sort(
    alphabeticalSortComparator<ISelectOption>({ orderBy: 'label' }),
  );
}

function initialize(appId: string): void {
  model.init();
  model.setState({
    refs: {
      tableRef: { current: null },
    },
    groupingSelectOptions: [],
  });
  if (!appId) {
    setDefaultAppConfigData();
  }
  projectsService
    .getProjectParams(['texts'])
    .call()
    .then((data: IProjectParamsMetrics) => {
      model.setState({
        selectFormData: {
          options: getSelectFormOptions(data),
          suggestions: getParamsSuggestions(data),
        },
      });
    });
}

function getAppConfigData(appId: string) {
  if (appRequestRef) {
    appRequestRef.abort();
  }
  appRequestRef = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      let select = appData?.state?.select;
      if (select) {
        const compatibleSelectConfig = getCompatibleSelectConfig(
          ['texts'],
          select,
        );
        appData.state = {
          ...appData.state,
          select: {
            ...compatibleSelectConfig,
          },
        };
      }
      const configData: any = _.merge(getConfig(), appData.state);
      model.setState({ config: configData });
    },
    abort: appRequestRef.abort,
  };
}

function resetModelState() {}

function abortRequest(): void {
  if (textsRequestRef) {
    textsRequestRef.abort();
  }
  model.setState({ requestStatus: RequestStatusEnum.Ok });
  onNotificationAdd({
    notification: {
      id: Date.now(),
      severity: 'info',
      messages: ['Request has been cancelled'],
    },
    model,
  });
}

function setDefaultAppConfigData() {
  const compatibleSelectConfig = getCompatibleSelectConfig(
    ['texts'],
    getStateFromUrl('select'),
  );
  const select: ISelectConfig = compatibleSelectConfig || getConfig().select;
  const texts: ITextExplorerAppConfig['texts'] =
    getStateFromUrl('texts') || getConfig().texts;
  const tableConfigHash = getItem('textsExplorerTable');
  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;
  const configData = _.merge(getConfig(), {
    select,
    table,
    texts,
  });

  model.setState({ config: configData });
}

function getQueryStringFromSelect(selectData: any) {
  let query: string | undefined = '';
  if (selectData !== undefined) {
    if (selectData.advancedMode) {
      query = selectData.advancedQuery;
    } else {
      query = `${
        selectData.query ? `${selectData.query} and ` : ''
      }(${selectData.options
        .map(
          (option: ISelectOption) =>
            `(texts.name == "${option.value?.option_name}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map(
                      (item) =>
                        `texts.context.${item} == ${formatValue(
                          (option.value?.context as any)[item],
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

/**
 * function updateURL has 2 major functionalities:
 *    1. Keeps URL in sync with the app config
 *    2. Stores updated URL in localStorage if App is not in the bookmark state
 * @param {ITextExplorerAppConfig} configData - the current state of the app config
 */
function updateURL(
  configData: ITextExplorerAppConfig = model.getState()!.config!,
) {
  const { select, texts } = configData;
  const url: string = getUrlWithParam({
    select: encode(select as {}),
    texts: encode(texts),
  });

  if (url === `${window.location.pathname}${window.location.search}`) {
    return;
  }

  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem('textsUrl', url);
  }

  window.history.pushState(null, '', url);
}

function processData(data: any[]): {
  data: IMetricsCollection<IImageData>[];
  params: string[];
  highLevelParams: string[];
  contexts: string[];
  selectedRows: any;
} {
  const configData = model.getState()?.config;
  let selectedRows = model.getState()?.selectedRows;
  let metrics: any[] = [];
  let params: string[] = [];
  let highLevelParams: string[] = [];
  let contexts: string[] = [];
  data?.forEach((run: IImageRunData) => {
    params = params.concat(getObjectPaths(run.params, run.params));
    highLevelParams = highLevelParams.concat(
      getObjectPaths(run.params, run.params, '', false, true),
    );
    run.traces.forEach((trace: any) => {
      contexts = contexts.concat(getObjectPaths(trace.context, trace.context));
      trace.values.forEach((stepData: any[], stepIndex: number) => {
        stepData.forEach((text: any) => {
          // const imageKey = encode({
          //   name: trace.name,
          //   runHash: run.hash,
          //   traceContext: trace.context,
          //   index: text.index,
          //   step: trace.iters[stepIndex],
          //   caption: text.caption,
          // });
          // const seqKey = encode({
          //   name: trace.name,
          //   runHash: run.hash,
          //   traceContext: trace.context,
          // });
          metrics.push({
            ...text,
            // images_name: trace.name,
            step: trace.iters[stepIndex],
            context: trace.context,
            run: _.omit(run, 'traces'),
            // key: imageKey,
            // seqKey: seqKey,
          });
        });
      });
    });
  });

  let sortFields = configData?.table?.sortFields ?? [];

  if (sortFields?.length === 0) {
    sortFields = [
      {
        value: 'run.props.creation_time',
        order: 'desc',
        label: '',
        group: '',
      },
    ];
  }

  // const processedData = groupData(
  //   _.orderBy(
  //     metrics,
  //     sortFields?.map(
  //       (f: SortField) =>
  //         function (metric: SortField) {
  //           return getValue(metric, f.value, '');
  //         },
  //     ),
  //     sortFields?.map((f: any) => f.order),
  //   ),
  // );
  const processedData = metrics;
  const uniqParams = _.uniq(params).sort();
  const uniqHighLevelParams = _.uniq(highLevelParams).sort();
  const uniqContexts = _.uniq(contexts).sort();

  const mappedData =
    data?.reduce((acc: any, item: any) => {
      acc[item.hash] = { runHash: item.hash, ...item.props };
      return acc;
    }, {}) || {};
  if (selectedRows && !_.isEmpty(selectedRows)) {
    selectedRows = Object.keys(selectedRows).reduce((acc: any, key: string) => {
      const slicedKey = key.slice(0, key.indexOf('/'));
      acc[key] = {
        selectKey: key,
        ...mappedData[slicedKey],
      };
      return acc;
    }, {});
  }
  return {
    data: processedData,
    params: uniqParams,
    highLevelParams: uniqHighLevelParams,
    contexts: uniqContexts,
    selectedRows,
  };
}

//
// function onRowVisibilityChange(metricKey: string) {
//   const configData: ITextExplorerAppConfig | undefined =
//     model.getState()?.config;
//   if (configData?.table) {
//     let hiddenMetrics = configData?.table?.hiddenMetrics || [];
//     if (hiddenMetrics?.includes(metricKey)) {
//       hiddenMetrics = hiddenMetrics.filter(
//         (hiddenMetric: any) => hiddenMetric !== metricKey,
//       );
//     } else {
//       hiddenMetrics = [...hiddenMetrics, metricKey];
//     }
//     const table = {
//       ...configData.table,
//       hiddenMetrics,
//     };
//     const config = {
//       ...configData,
//       table,
//     };
//     model.setState({ config });
//     setItem('textsExplorerTable', encode(table));
//     updateModelData(config);
//   }
// }

function updateModelData(
  configData: ITextExplorerAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params, contexts, highLevelParams, selectedRows } = processData(
    model.getState()?.rawData as any[],
  );
  const sortedParams = params.concat(highLevelParams).sort();
  // const groupingSelectOptions = [
  //   ...getGroupingSelectOptions({
  //     params: sortedParams,
  //     contexts,
  //   }),
  // ];
  // const { mediaSetData, orderedMap } = getDataAsMediaSetNestedObject({
  //   data,
  //   groupingSelectOptions,
  //   model,
  // });
  // tooltipData = getTooltipData({
  //   processedData: data,
  //   paramKeys: sortedParams,
  //   groupingSelectOptions,
  //   groupingItems: ['group'],
  //   model,
  // });

  // if (configData.images.focusedState.key) {
  //   configData = {
  //     ...configData,
  //     images: {
  //       ...configData.images,
  //       tooltip: {
  //         ...configData.images.tooltip,
  //         content: filterTooltipContent(
  //           tooltipData[configData.images.focusedState.key],
  //           configData?.images.tooltip.selectedParams,
  //         ),
  //       },
  //     },
  //   };
  // }

  // const tableData = getDataAsTableRows(
  //   data,
  //   params,
  //   false,
  //   configData,
  //   groupingSelectOptions,
  // );
  // const tableColumns = getImagesExploreTableColumns(
  //   params,
  //   groupingSelectOptions,
  //   data[0]?.config,
  //   configData.table.columnsOrder!,
  //   configData.table.hiddenColumns!,
  //   configData.table.sortFields,
  //   onTableSortChange,
  // );
  // const tableRef: any = model.getState()?.refs?.tableRef;
  // tableRef?.current?.updateData({
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
    // imagesData: mediaSetData,
    // orderedMap,
    // tableData: tableData.rows,
    // tableColumns,
    // sameValueColumns: tableData.sameValueColumns,
    // groupingSelectOptions,
    selectedRows,
  });
}

//
// function getDataAsTableRows(
//   processedData: IMetricsCollection<IImageData>[],
//   paramKeys: string[],
//   isRawData: boolean,
//   config: IImagesExploreAppConfig,
//   groupingSelectOptions: any,
//   dynamicUpdate?: boolean,
// ): { rows: any[] | any; sameValueColumns: string[] } {
//   if (!processedData) {
//     return {
//       rows: [],
//       sameValueColumns: [],
//     };
//   }
//
//   const rows: any[] | any = processedData[0]?.config !== null ? {} : [];
//
//   let rowIndex = 0;
//   const sameValueColumns: string[] = [];
//   const tableData = groupData(
//     Object.values(
//       _.groupBy(
//         Object.values(processedData)
//           .map((v) => v.data)
//           .flat(),
//         'seqKey',
//       ),
//     ).map((v) => v[0]),
//   );
//   tableData.forEach((metricsCollection: IMetricsCollection<IImageData>) => {
//     const groupKey = metricsCollection.key;
//     const columnsValues: { [key: string]: string[] } = {};
//
//     if (metricsCollection.config !== null) {
//       const groupConfigData: { [key: string]: string } = {};
//       for (let key in metricsCollection.config) {
//         groupConfigData[getValueByField(groupingSelectOptions, key)] =
//           metricsCollection.config[key];
//       }
//       const groupHeaderRow = {
//         meta: {
//           dasharray: null,
//           itemsCount: metricsCollection.data.length,
//           config: groupConfigData,
//         },
//         key: groupKey!,
//         groupRowsKeys: metricsCollection.data.map(
//           (metric) => (metric as any).seqKey,
//         ),
//         experiment: '',
//         run: '',
//         metric: '',
//         context: [],
//         children: [],
//         groups: groupConfigData,
//       };
//
//       rows[groupKey!] = {
//         data: groupHeaderRow,
//         items: [],
//       };
//     }
//
//     Object.values(_.groupBy(metricsCollection.data, 'seqKey'))
//       .map((v) => v[0])
//       .forEach((metric: any) => {
//         const rowValues: any = {
//           rowMeta: {
//             color: metricsCollection.color ?? metric.color,
//           },
//           key: metric.seqKey,
//           selectKey: `${metric.run.hash}/${metric.seqKey}`,
//           runHash: metric.run.hash,
//           isHidden: config?.table?.hiddenMetrics?.includes(metric.key),
//           index: rowIndex,
//           color: metricsCollection.color ?? metric.color,
//           dasharray: metricsCollection.dasharray ?? metric.dasharray,
//           experiment: metric.run.props.experiment?.name ?? 'default',
//           run: moment(metric.run.props.creation_time * 1000).format(
//             'HH:mm:ss · D MMM, YY',
//           ),
//           name: metric.images_name,
//           context: Object.entries(metric.context).map((entry) =>
//             entry.join(':'),
//           ),
//           parentId: groupKey,
//         };
//         rowIndex++;
//
//         [
//           'experiment',
//           'run',
//           'metric',
//           'context',
//           'step',
//           'epoch',
//           'time',
//           'name',
//         ].forEach((key) => {
//           if (columnsValues.hasOwnProperty(key)) {
//             if (
//               _.findIndex(columnsValues[key], (value) =>
//                 _.isEqual(rowValues[key], value),
//               ) === -1
//             ) {
//               columnsValues[key].push(rowValues[key]);
//             }
//           } else {
//             columnsValues[key] = [rowValues[key]];
//           }
//         });
//
//         if (!dynamicUpdate) {
//           paramKeys.forEach((paramKey) => {
//             const value = getValue(metric.run.params, paramKey, '-');
//             rowValues[paramKey] = formatValue(value);
//             if (columnsValues.hasOwnProperty(paramKey)) {
//               if (
//                 _.findIndex(columnsValues[paramKey], (paramValue) =>
//                   _.isEqual(value, paramValue),
//                 ) === -1
//               ) {
//                 columnsValues[paramKey].push(value);
//               }
//             } else {
//               columnsValues[paramKey] = [value];
//             }
//           });
//         }
//         if (metricsCollection.config !== null) {
//           rows[groupKey!].items.push(
//             isRawData
//               ? rowValues
//               : imagesExploreTableRowRenderer(rowValues, {
//                   toggleVisibility: (e) => {
//                     e.stopPropagation();
//                     onRowVisibilityChange(rowValues.key);
//                   },
//                 }),
//           );
//         } else {
//           rows.push(
//             isRawData
//               ? rowValues
//               : imagesExploreTableRowRenderer(rowValues, {
//                   toggleVisibility: (e) => {
//                     e.stopPropagation();
//                     onRowVisibilityChange(rowValues.key);
//                   },
//                 }),
//           );
//         }
//       });
//
//     for (let columnKey in columnsValues) {
//       if (columnsValues[columnKey].length === 1) {
//         sameValueColumns.push(columnKey);
//       }
//
//       if (metricsCollection.config !== null) {
//         rows[groupKey!].data[columnKey] =
//           columnsValues[columnKey].length === 1
//             ? paramKeys.includes(columnKey)
//               ? formatValue(columnsValues[columnKey][0])
//               : columnsValues[columnKey][0]
//             : columnsValues[columnKey];
//       }
//     }
//     if (metricsCollection.config !== null && !isRawData) {
//       rows[groupKey!].data = imagesExploreTableRowRenderer(
//         rows[groupKey!].data,
//         {},
//         true,
//         ['value', 'name', 'groups'].concat(Object.keys(columnsValues)),
//       );
//     }
//   });
//   return { rows, sameValueColumns };
// }

//
// // internal function to update config.table.sortFields and cache data
// function updateTableSortFields(sortFields: SortFields) {
//   const configData: ITextExplorerAppConfig | undefined =
//     model.getState()?.config;
//   if (configData?.table) {
//     const table = {
//       ...configData.table,
//       sortFields,
//     };
//     const configUpdate = {
//       ...configData,
//       table,
//     };
//     model.setState({ config: configUpdate });
//
//     setItem('textsExplorerTable', encode(table));
//     updateModelData(configUpdate, true);
//   }
//   // analytics.trackEvent(
//   //   `${ANALYTICS_EVENT_KEYS.images.table.changeSorting} ${
//   //     _.isEmpty(sortFields) ? 'Reset' : 'Apply'
//   //   }`,
//   // );
// }
//
// function onTableSortChange({
//   sortFields,
//   order,
//   index,
//   actionType,
//   field,
// }: any) {
//   const configData: ITextExplorerAppConfig | undefined =
//     model.getState()?.config;
//
//   updateTableSortFields(
//     getSortedFields({
//       sortFields: sortFields || configData?.table.sortFields || [],
//       order,
//       index,
//       actionType,
//       field,
//     }),
//   );
// }

function updateData(newData: IRun<IParamTrace>[]): void {
  const configData = model.getState()?.config;
  if (configData) {
    setModelData(newData, configData);
  }
}

function setModelData(rawData: any[], configData: ITextExplorerAppConfig) {
  const sortFields = model.getState()?.config?.table.sortFields;
  const { data, params, contexts, highLevelParams, selectedRows } =
    processData(rawData);
  // const tablePanelData = getPanelDataAsTableRows();

  const tablePanelColumns = getTablePanelColumns(
    data,
    params,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
  );
  console.log(tablePanelColumns, processData(rawData), rawData);
  model.setState({ tablePanelColumns });

  const sortedParams = params.concat(highLevelParams).sort();
  // const groupingSelectOptions = [
  //   ...getGroupingSelectOptions({
  //     params: sortedParams,
  //     contexts,
  //   }),
  // ];
  // const { mediaSetData, orderedMap } = getDataAsMediaSetNestedObject({
  //   data,
  //   groupingSelectOptions,
  //   model,
  // });

  // tooltipData = getTooltipData({
  //   processedData: data,
  //   paramKeys: sortedParams,
  //   groupingSelectOptions,
  //   groupingItems: ['group'],
  //   model,
  // });
  // if (configData.images.focusedState.key) {
  //   configData = {
  //     ...configData,
  //     images: {
  //       ...configData.images,
  //       tooltip: {
  //         ...configData.images.tooltip,
  //         content: filterTooltipContent(
  //           tooltipData[configData.images.focusedState.key],
  //           configData?.images.tooltip.selectedParams,
  //         ),
  //       },
  //     },
  //   };
  // }
  const ranges = rawData?.[0]?.ranges;
  // const tableData = getDataAsTableRows(
  //   data,
  //   params,
  //   false,
  //   configData,
  //   groupingSelectOptions,
  // );
  const config = configData;
  const recordSlice = [
    _.inRange(
      ranges?.record_range_used[0],
      ranges?.record_range_total[0] - 1,
      ranges?.record_range_total[1] + 1,
    )
      ? ranges?.record_range_used[0]
      : ranges?.record_range_total[0],
    _.inRange(
      ranges?.record_range_used[1] - 1,
      ranges?.record_range_total[0] - 1,
      ranges?.record_range_total[1] + 1,
    )
      ? ranges?.record_range_used[1] - 1
      : ranges?.record_range_total[1] - 1,
  ];
  const indexSlice = [
    _.inRange(
      ranges?.index_range_used[0],
      ranges?.index_range_total[0] - 1,
      ranges?.index_range_total[1] + 1,
    )
      ? ranges?.index_range_used[0]
      : ranges?.index_range_total[0],
    _.inRange(
      ranges?.index_range_used[1] - 1,
      ranges?.index_range_total[0] - 1,
      ranges?.index_range_total[1] + 1,
    )
      ? ranges?.index_range_used[1] - 1
      : ranges?.index_range_total[1] - 1,
  ];
  const recordRangeTotalCount =
    ranges?.record_range_total[1] - 1 - ranges?.record_range_total[0];
  const indexRangeTotalCount =
    ranges?.index_range_total[1] - 1 - ranges?.index_range_total[0];
  const recordDensity =
    !config.texts.recordDensity ||
    +config.texts.recordDensity < ranges?.record_range_total[0] ||
    +config.texts.recordDensity > recordRangeTotalCount
      ? `${recordRangeTotalCount === 0 ? 1 : recordRangeTotalCount}`
      : config.texts.recordDensity;
  const indexDensity =
    !config.texts.indexDensity ||
    +config.texts.indexDensity < ranges?.index_range_total[0] ||
    +config.texts.indexDensity > indexRangeTotalCount
      ? `${indexRangeTotalCount === 0 ? 1 : indexRangeTotalCount}`
      : config.texts.indexDensity;

  config.texts = {
    ...config.texts,
    stepRange: !_.isEmpty(rawData)
      ? [ranges?.record_range_total[0], ranges?.record_range_total[1] - 1]
      : config.texts.stepRange,
    indexRange: !_.isEmpty(rawData)
      ? [ranges?.index_range_total[0], ranges?.index_range_total[1] - 1]
      : config.texts.indexRange,
    recordSlice,
    indexSlice,
    recordDensity,
    indexDensity,
    // tooltip: config.images.tooltip || {
    //   content: {},
    //   display: true,
    //   selectedParams: [],
    // },
    // focusedState: config.images.focusedState || {
    //   active: false,
    //   key: null,
    // },
    // additionalProperties: config.images.additionalProperties,
  };
  model.setState({
    requestStatus: RequestStatusEnum.Ok,
    rawData,
    config,
    params,
    data,
    selectedRows,
    // textsData: data,
    // orderedMap,
    // tableData: tableData.rows,
    // tableColumns: getImagesExploreTableColumns(
    //   params,
    //   groupingSelectOptions,
    //   data[0]?.config,
    //   configData.table.columnsOrder!,
    //   configData.table.hiddenColumns!,
    //   sortFields,
    //   onTableSortChange,
    // ),
    // sameValueColumns: tableData.sameValueColumns,
    // groupingSelectOptions,
  });
}

async function getTextsMetricsData(
  stream: ReadableStream<IRun<IMetricTrace>[]>,
) {
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

function getTextData(
  shouldUrlUpdate?: boolean,
  shouldResetSelectedRows?: boolean,
) {
  if (textsRequestRef) {
    textsRequestRef.abort();
  }
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
  if (shouldUrlUpdate) {
    updateURL(configData);
  }
  const recordSlice: number[] | undefined = configData?.texts?.recordSlice as
    | number[]
    | undefined;
  const indexSlice: number[] | undefined = configData?.texts?.indexSlice as
    | number[]
    | undefined;
  const recordDensity = configData?.texts?.recordDensity;
  const indexDensity = configData?.texts?.indexDensity;
  let query = getQueryStringFromSelect(configData?.select as any);
  let textDataBody: any = {
    q: query !== '()' ? query : '',
  };
  if (recordSlice) {
    //TODO check values nullability
    textDataBody = {
      ...textDataBody,
      record_range:
        !_.isEmpty(recordSlice) &&
        !_.isNil(recordSlice?.[0]) &&
        !_.isNil(recordSlice[1])
          ? `${recordSlice[0]}:${recordSlice[1] + 1}`
          : '',
      index_range:
        !_.isEmpty(indexSlice) &&
        !_.isNil(recordSlice?.[0]) &&
        !_.isNil(recordSlice[1])
          ? `${indexSlice?.[0]}:${(indexSlice?.[1] || 0) + 1}`
          : '',
      record_density:
        !_.isNil(recordDensity) && +recordDensity > 0 ? recordDensity : '',
      index_density:
        !_.isNil(indexDensity) && +indexDensity > 0 ? indexDensity : '',
    };
  }
  textsRequestRef = textExplorerService.getTextExplorerData(textDataBody);
  return {
    call: async () => {
      if (query !== '()') {
        model.setState({
          requestStatus: RequestStatusEnum.Pending,
          queryIsEmpty: false,
          applyButtonDisabled: false,
          selectedRows: shouldResetSelectedRows
            ? {}
            : model.getState()?.selectedRows,
        });
        blobsURIModel.init();
        try {
          const stream = await textsRequestRef.call((detail) => {
            exceptionHandler({ detail, model });
            resetModelState();
          });
          const runData = await getTextsMetricsData(stream);

          if (configData) {
            updateData(runData);
          }
        } catch (ex: Error | any) {
          if (ex.name === 'AbortError') {
            // Abort Error
          } else {
            console.log('Unhandled error: ', ex);
          }
        }
      } else {
        model.setState({
          selectedRows: shouldResetSelectedRows
            ? {}
            : model.getState()?.selectedRows,
          queryIsEmpty: true,
          textsData: {},
          tableData: [],
          texts: {
            tooltip: {
              content: {},
              display: true,
              selectedParams: [],
            },
            focusedState: {
              active: false,
              key: null,
            },
          },
          config: {
            ...configData,
            // grouping: { ...getConfig().grouping },
            table: {
              ...configData?.table,
              resizeMode: ResizeModeEnum.Resizable,
            },
          },
        });
      }
    },
    abort: textsRequestRef.abort,
  };
}

function onTextsExplorerSelectChange(options: ISelectOption[]) {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, options },
      texts: { ...configData.texts },
    };

    model.setState({ config: newConfig });
  }
}

function onSelectRunQueryChange(query: string) {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query, query },
      texts: { ...configData.texts },
    };

    model.setState({ config: newConfig });
  }
}

function getPanelDataAsTableRows(
  processedData: any,
  metricsColumns: any,
  paramKeys: string[],
  isRawData?: boolean,
): { rows: any[] | any; sameValueColumns: string[] } {
  if (!processedData) {
    return {
      rows: [],
      sameValueColumns: [],
    };
  }
  const initialMetricsRowData = Object.keys(metricsColumns).reduce(
    (acc: any, key: string) => {
      const groupByMetricName: any = {};
      Object.keys(metricsColumns[key]).forEach((metricContext: string) => {
        groupByMetricName[
          `${isSystemMetric(key) ? key : `${key}_${metricContext}`}`
        ] = '-';
      });
      acc = { ...acc, ...groupByMetricName };
      return acc;
    },
    {},
  );
  const rows: any = processedData[0]?.config !== null ? {} : [];
  let rowIndex = 0;
  const sameValueColumns: string[] = [];

  processedData.forEach((metricsCollection: any) => {
    const groupKey = metricsCollection.key;
    const columnsValues: { [key: string]: string[] } = {};
    if (metricsCollection.config !== null) {
      const groupHeaderRow = {
        meta: {
          chartIndex: metricsCollection.chartIndex + 1,
        },
        key: groupKey!,
        color: metricsCollection.color,
        dasharray: metricsCollection.dasharray,
        experiment: '',
        run: '',
        metric: '',
        context: [],
        children: [],
      };
      rows[groupKey!] = {
        data: groupHeaderRow,
        items: [],
      };
    }
    metricsCollection.data.forEach((metric: any) => {
      const metricsRowValues = { ...initialMetricsRowData };
      metric.run.traces.metric.forEach((trace: any) => {
        metricsRowValues[
          `${
            isSystemMetric(trace.name)
              ? trace.name
              : `${trace.name}_${contextToString(trace.context)}`
          }`
        ] = formatValue(trace.last_value.last);
      });
      const rowValues: any = {
        key: metric.key,
        selectKey: `${metric.run.hash}/${metric.key}`,
        runHash: metric.run.hash,
        index: rowIndex,
        color: metricsCollection.color ?? metric.color,
        dasharray: metricsCollection.dasharray ?? metric.dasharray,
        experiment: metric.run.props.experiment?.name ?? 'default',
        run: moment(metric.run.props.creation_time * 1000).format(
          'HH:mm:ss · D MMM, YY',
        ),
        metric: metric.name,
        ...metricsRowValues,
      };
      rowIndex++;
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
          if (!_.some(columnsValues[key], rowValues[key])) {
            columnsValues[key].push(rowValues[key]);
          }
        } else {
          columnsValues[key] = [rowValues[key]];
        }
      });
      paramKeys.forEach((paramKey) => {
        const value = getValue(metric.run.params, paramKey, '-');
        rowValues[paramKey] = formatValue(value);
        if (columnsValues.hasOwnProperty(paramKey)) {
          if (!columnsValues[paramKey].includes(value)) {
            columnsValues[paramKey].push(value);
          }
        } else {
          columnsValues[paramKey] = [value];
        }
      });
      if (metricsCollection.config !== null) {
        rows[groupKey!].items.push(
          isRawData ? rowValues : textsTablePanelRowRenderer(rowValues),
        );
      } else {
        rows.push(
          isRawData ? rowValues : textsTablePanelRowRenderer(rowValues),
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
            ? columnsValues[columnKey][0]
            : columnsValues[columnKey];
      }

      if (metricsCollection.config !== null && !isRawData) {
        rows[groupKey!].data = textsTablePanelRowRenderer(
          rows[groupKey!].data,
          true,
          Object.keys(columnsValues),
        );
      }
    }
  });

  return { rows, sameValueColumns };
}

async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    const app: IAppData | any = await appsService
      .createApp({ state: configData, type: 'texts' })
      .call((detail: any) => {
        exceptionHandler({ detail, model });
      });

    if (app.id) {
      const bookmark: IDashboardData = await dashboardService
        .createDashboard({ app_id: app.id, name, description })
        .call((detail: any) => {
          exceptionHandler({ detail, model });
        });
      if (bookmark.name) {
        onNotificationAdd({
          notification: {
            id: Date.now(),
            severity: 'success',
            messages: [BookmarkNotificationsEnum.CREATE],
          },
          model,
        });
      } else {
        onNotificationAdd({
          notification: {
            id: Date.now(),
            severity: 'error',
            messages: [BookmarkNotificationsEnum.ERROR],
          },
          model,
        });
      }
    }
  }
  analytics.trackEvent(ANALYTICS_EVENT_KEYS.texts.createBookmark);
}

function onBookmarkUpdate(id: string) {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: 'texts' })
      .call((detail: any) => {
        exceptionHandler({ detail, model });
      })
      .then((res: IDashboardData | any) => {
        if (res.id) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'success',
              messages: [BookmarkNotificationsEnum.UPDATE],
            },
            model,
          });
        }
      });
  }
}

function onModelNotificationDelete(id: number): void {
  onNotificationDelete({ id, model });
}

function onTableResizeEnd(tableHeight: string) {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
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
    setItem('textExploreTable', encode(table));
  }
}

function onTableResizeModeChange(mode: ResizeModeEnum): void {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
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
    setItem('textExploreTable', encode(table));
  }
  analytics.trackEvent(ANALYTICS_EVENT_KEYS.texts.table.changeResizeMode);
}

function onSelectAdvancedQueryChange(query: string) {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query },
      images: { ...configData.texts },
    };

    model.setState({
      config: newConfig,
    });
  }
}

function toggleSelectAdvancedMode() {
  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;

  if (configData?.select) {
    let query =
      configData.select.advancedQuery ||
      getQueryStringFromSelect(configData?.select);
    if (query === '()') {
      query = '';
    }
    const newConfig = {
      ...configData,
      select: {
        ...configData.select,
        advancedQuery: query,
        advancedMode: !configData.select.advancedMode,
      },
    };
    updateURL(newConfig);

    model.setState({ config: newConfig });
  }

  /*analytics.trackEvent(
    `${ANALYTICS_EVENT_KEYS.texts.useAdvancedSearch} ${
      !configData?.select.advancedMode ? 'on' : 'off'
    }`,
  );*/
}

function onSearchQueryCopy(): void {
  const selectedMetricsData = model.getState()?.config?.select;
  let query = getQueryStringFromSelect(selectedMetricsData as any);
  if (query) {
    navigator.clipboard.writeText(query);
    onNotificationAdd({
      notification: {
        id: Date.now(),
        severity: 'success',
        messages: ['Run Expression Copied'],
      },
      model,
    });
  }
}

const textsExploreAppModel = {
  ...model,
  initialize,
  getTextData,
  abortRequest,
  updateModelData,
  getAppConfigData,
  onBookmarkCreate,
  onTableResizeEnd,
  onBookmarkUpdate,
  onNotificationAdd,
  onSearchQueryCopy,
  setDefaultAppConfigData,
  onSelectRunQueryChange,
  onTableResizeModeChange,
  toggleSelectAdvancedMode,
  onTextsExplorerSelectChange,
  onSelectAdvancedQueryChange,
  onNotificationDelete: onModelNotificationDelete,
};

export default textsExploreAppModel;
