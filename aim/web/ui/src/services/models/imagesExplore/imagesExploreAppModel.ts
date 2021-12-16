import React, { ChangeEvent } from 'react';
import _, { isEmpty } from 'lodash-es';
import moment from 'moment';
import { saveAs } from 'file-saver';

import { RowHeightSize } from 'config/table/tableConfigs';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { ResizeModeEnum, RowHeightEnum } from 'config/enums/tableEnums';
import { IMAGE_SIZE_CHANGE_DELAY } from 'config/imagesConfigs/imagesConfig';
import {
  MediaItemAlignmentEnum,
  ImageRenderingEnum,
} from 'config/enums/imageEnums';

import {
  getImagesExploreTableColumns,
  imagesExploreTableRowRenderer,
} from 'pages/ImagesExplore/components/ImagesExploreTableGrid/ImagesExploreTableGrid';

import * as analytics from 'services/analytics';
import imagesExploreService from 'services/api/imagesExplore/imagesExploreService';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';
import blobsURIModel from 'services/models/media/blobsURIModel';

import {
  GroupNameType,
  IAppData,
  IDashboardData,
  IGroupingSelectOption,
  IMetricsCollection,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IPanelTooltip,
  ITooltipData,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetricTrace, IRun } from 'types/services/models/metrics/runModel';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  IImageData,
  IImageRunData,
  IImagesExploreAppConfig,
  IImagesExploreAppModelState,
} from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  ISelectConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';

import { decode, encode } from 'utils/encoder/encoder';
import getObjectPaths from 'utils/getObjectPaths';
import getUrlWithParam from 'utils/getUrlWithParam';
import getStateFromUrl from 'utils/getStateFromUrl';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { getItem, setItem } from 'utils/storage';
import JsonToCSV from 'utils/JsonToCSV';
import { formatValue } from 'utils/formatValue';
import getValueByField from 'utils/getValueByField';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';
import { formatToPositiveNumber } from 'utils/formatToPositiveNumber';
import getMinAndMaxBetweenArrays from 'utils/getMinAndMaxBetweenArrays';
import getTooltipData from 'utils/app/getTooltipData';
import filterTooltipContent from 'utils/filterTooltipContent';
import { getCompatibleSelectConfig } from 'utils/app/getCompatibleSelectConfig';

import createModel from '../model';

const model = createModel<Partial<IImagesExploreAppModelState>>({
  requestIsPending: false,
  searchButtonDisabled: false,
  applyButtonDisabled: true,
});

let tooltipData: ITooltipData = {};

function getConfig(): IImagesExploreAppConfig {
  return {
    grouping: {
      group: [],
      reverseMode: {
        group: false,
      },
      isApplied: {
        group: true,
      },
    },
    select: {
      options: [],
      query: '',
      advancedMode: false,
      advancedQuery: '',
    },
    images: {
      calcRanges: true,
      tooltip: {
        content: {},
        display: true,
        selectedParams: [],
      },
      additionalProperties: {
        alignmentType: MediaItemAlignmentEnum.Height,
        mediaItemSize: 25,
        imageRendering: ImageRenderingEnum.Pixelated,
      },
      focusedState: {
        active: false,
        key: null,
      },
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
    refs: {
      tableRef: { current: null },
    },
    groupingSelectOptions: [],
  });
  if (!appId) {
    setDefaultAppConfigData();
  }
}

function setDefaultAppConfigData() {
  const grouping: IImagesExploreAppConfig['grouping'] =
    getStateFromUrl('grouping') || getConfig().grouping;
  const compatibleSelectConfig = getCompatibleSelectConfig(
    ['images'],
    getStateFromUrl('select'),
  );
  const select: ISelectConfig = compatibleSelectConfig || getConfig().select;
  const images: IImagesExploreAppConfig['images'] =
    getStateFromUrl('images') || getConfig().images;
  const tableConfigHash = getItem('imagesExploreTable');
  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;
  const configData = _.merge(getConfig(), {
    grouping,
    select,
    table,
    images,
  });

  model.setState({ config: configData });
}

let imagesRequestRef: {
  call: (
    exceptionHandler: (detail: any) => void,
  ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
  abort: () => void;
};

function getAppConfigData(appId: string) {
  if (appRequestRef) {
    appRequestRef.abort();
  }
  appRequestRef = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequestRef.call();
      let select = appData?.state?.select;
      if (select) {
        const compatibleSelectConfig = getCompatibleSelectConfig(
          ['images'],
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

function resetModelOnError(detail?: any) {
  model.setState({
    data: [],
    params: [],
    imagesData: {},
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

function abortRequest(): void {
  if (imagesRequestRef) {
    imagesRequestRef.abort();
  }

  model.setState({
    requestIsPending: false,
  });

  onNotificationAdd({
    id: Date.now(),
    severity: 'info',
    message: 'Request has been cancelled',
  });
}

function getImagesData(shouldUrlUpdate?: boolean) {
  if (imagesRequestRef) {
    imagesRequestRef.abort();
  }
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (shouldUrlUpdate) {
    updateURL(configData);
  }

  const recordSlice: number[] | undefined = configData?.images?.recordSlice as
    | number[]
    | undefined;
  const indexSlice: number[] | undefined = configData?.images?.indexSlice as
    | number[]
    | undefined;
  const recordDensity = configData?.images?.recordDensity;
  const indexDensity = configData?.images?.indexDensity;
  const calcRanges = !!configData?.images.calcRanges;
  let query = getQueryStringFromSelect(configData?.select as any);
  let imageDataBody: any = {
    q: query !== '()' ? query : '',
    calc_ranges: calcRanges,
  };
  if (recordSlice) {
    imageDataBody = {
      ...imageDataBody,
      record_range: recordSlice
        ? `${recordSlice[0]}:${recordSlice[1] + 1}`
        : '',
      index_range: indexSlice ? `${indexSlice[0]}:${indexSlice[1] + 1}` : '',
      record_density: recordDensity ?? '',
      index_density: indexDensity ?? '',
    };
  }
  imagesRequestRef = imagesExploreService.getImagesExploreData(imageDataBody);

  return {
    call: async () => {
      if (query !== '()') {
        model.setState({
          requestIsPending: true,
          queryIsEmpty: false,
          applyButtonDisabled: true,
        });

        blobsURIModel.init();

        try {
          const stream = await imagesRequestRef.call(exceptionHandler);
          const runData = await getImagesMetricsData(stream);
          if (configData) {
            setModelData(runData, configData);
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
          requestIsPending: false,
          queryIsEmpty: true,
          imagesData: {},
          tableData: [],
          images: {
            calcRanges: true,
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
            table: {
              ...configData?.table,
              resizeMode: ResizeModeEnum.Resizable,
            },
          },
        });
      }
    },
    abort: imagesRequestRef.abort,
  };
}

function processData(data: any[]): {
  data: IMetricsCollection<IImageData>[];
  params: string[];
  highLevelParams: string[];
  contexts: string[];
} {
  const configData = model.getState()?.config;
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
      trace.values.forEach((stepData: IImageData[], stepIndex: number) => {
        stepData.forEach((image: IImageData) => {
          const imageKey = encode({
            name: trace.name,
            runHash: run.hash,
            traceContext: trace.context,
            index: image.index,
            step: trace.iters[stepIndex],
            caption: image.caption,
          });
          const seqKey = encode({
            name: trace.name,
            runHash: run.hash,
            traceContext: trace.context,
          });
          metrics.push({
            ...image,
            images_name: trace.name,
            step: trace.iters[stepIndex],
            context: trace.context,
            run: _.omit(run, 'traces'),
            key: imageKey,
            seqKey: seqKey,
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
  const uniqHighLevelParams = _.uniq(highLevelParams);
  const uniqContexts = _.uniq(contexts);

  return {
    data: processedData,
    params: uniqParams,
    highLevelParams: uniqHighLevelParams,
    contexts: uniqContexts,
  };
}

function setModelData(rawData: any[], configData: IImagesExploreAppConfig) {
  const sortFields = model.getState()?.config?.table.sortFields;
  const { data, params, contexts, highLevelParams } = processData(rawData);
  const sortedParams = params.concat(highLevelParams).sort();

  const groupingSelectOptions = [
    ...getGroupingSelectOptions({
      params: sortedParams,
      contexts,
    }),
  ];
  const { imageSetData, orderedMap } = getDataAsImageSet(
    data,
    groupingSelectOptions,
  );

  tooltipData = getTooltipData({
    processedData: data,
    paramKeys: sortedParams,
    groupingSelectOptions,
    groupingItems: ['group'],
    model,
  });
  if (configData.images.focusedState.key) {
    configData = {
      ...configData,
      images: {
        ...configData.images,
        tooltip: {
          ...configData.images.tooltip,
          content: filterTooltipContent(
            tooltipData[configData.images.focusedState.key],
            configData?.images.tooltip.selectedParams,
          ),
        },
      },
    };
  }
  const tableData = getDataAsTableRows(
    data,
    params,
    false,
    configData,
    groupingSelectOptions,
  );
  const config = configData;
  config.images = {
    ...config.images,
    stepRange: !config.images.calcRanges
      ? config.images.stepRange
      : !isEmpty(rawData)
      ? (rawData[0].ranges.record_range as number[])
      : [],
    indexRange: !config.images.calcRanges
      ? config.images.indexRange
      : !isEmpty(rawData)
      ? (rawData[0].ranges.index_range as number[])
      : [],
    recordSlice: getMinAndMaxBetweenArrays(
      rawData?.[0]?.ranges.record_range as number[],
      config.images.recordSlice as number[],
    ),
    indexSlice: getMinAndMaxBetweenArrays(
      rawData?.[0]?.ranges.index_range as number[],
      config.images.indexSlice as number[],
    ),
    recordDensity: config.images.recordDensity || '50',
    indexDensity: config.images.indexDensity || '5',
    calcRanges: false,
    tooltip: config.images.tooltip || {
      content: {},
      display: true,
      selectedParams: [],
    },
    focusedState: config.images.focusedState || {
      active: false,
      key: null,
    },
    additionalProperties: config.images.additionalProperties,
  };
  model.setState({
    requestIsPending: false,
    rawData,
    config,
    params,
    data,
    imagesData: imageSetData,
    orderedMap,
    tableData: tableData.rows,
    tableColumns: getImagesExploreTableColumns(
      params,
      data[0]?.config,
      configData.table.columnsOrder!,
      configData.table.hiddenColumns!,
      sortFields,
      onSortChange,
    ),
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
  });
}

function updateModelData(
  configData: IImagesExploreAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params, contexts, highLevelParams } = processData(
    model.getState()?.rawData as any[],
  );
  const sortedParams = params.concat(highLevelParams).sort();
  const groupingSelectOptions = [
    ...getGroupingSelectOptions({
      params: sortedParams,
      contexts,
    }),
  ];
  const { imageSetData, orderedMap } = getDataAsImageSet(
    data,
    groupingSelectOptions,
  );
  tooltipData = getTooltipData({
    processedData: data,
    paramKeys: sortedParams,
    groupingSelectOptions,
    groupingItems: ['group'],
    model,
  });

  if (configData.images.focusedState.key) {
    configData = {
      ...configData,
      images: {
        ...configData.images,
        tooltip: {
          ...configData.images.tooltip,
          content: filterTooltipContent(
            tooltipData[configData.images.focusedState.key],
            configData?.images.tooltip.selectedParams,
          ),
        },
      },
    };
  }

  const tableData = getDataAsTableRows(
    data,
    params,
    false,
    configData,
    groupingSelectOptions,
  );
  const tableColumns = getImagesExploreTableColumns(
    params,
    data[0]?.config,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
    configData.table.sortFields,
    onSortChange,
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
    data: model.getState()?.data,
    imagesData: imageSetData,
    orderedMap,
    // chartTitleData: getChartTitleData(data),
    tableData: tableData.rows,
    tableColumns,
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
  });
}

function getFilteredGroupingOptions(
  grouping: IImagesExploreAppConfig['grouping'],
): string[] {
  const { reverseMode, isApplied } = grouping;
  const groupingSelectOptions:
    | IImagesExploreAppModelState['groupingSelectOptions']
    | undefined = model.getState()?.groupingSelectOptions;
  if (groupingSelectOptions) {
    const filteredOptions = [...groupingSelectOptions]
      .filter((opt) => grouping['group'].indexOf(opt.value as never) === -1)
      .map((item) => item.value);
    return isApplied['group']
      ? reverseMode['group']
        ? filteredOptions
        : grouping['group']
      : [];
  } else {
    return [];
  }
}

function getGroupingSelectOptions({
  params,
  contexts = [],
}: {
  params: string[];
  contexts?: string[];
}): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    group: 'run',
    label: `run.${param}`,
    value: `run.params.${param}`,
  }));

  const contextOptions: IGroupingSelectOption[] = contexts.map((context) => ({
    group: 'images',
    label: `images.context.${context}`,
    value: `context.${context}`,
  }));

  return [
    {
      group: 'run',
      label: 'run.experiment',
      value: 'run.props.experiment.name',
    },
    {
      group: 'run',
      label: 'run.hash',
      value: 'run.hash',
    },
    ...paramsOptions,

    {
      group: 'images',
      label: 'images.name',
      value: 'images_name',
    },
    ...contextOptions,
    {
      group: 'record',
      label: 'record.step',
      value: 'step',
    },
    {
      group: 'record',
      label: 'record.index',
      value: 'index',
    },
  ];
}

function groupData(data: any[]): any {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()!.config;
  const grouping = configData!.grouping;
  const groupingFields = getFilteredGroupingOptions(grouping);
  if (groupingFields.length === 0) {
    return [
      {
        config: null,
        chartIndex: 0,
        data: data,
      },
    ];
  }

  const groupValues: { [key: string]: any } = {};

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

function setComponentRefs(
  refElement: React.MutableRefObject<HTMLElement | any> | object,
) {
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
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    updateModelData(configData, true);
  }
  analytics.trackEvent(`[ImagesExplorer] Group by ${groupName}`);
}

function onGroupingModeChange({ value }: IOnGroupingModeChangeParams): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      group: value,
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[ImagesExplorer] ${
      value ? 'Disable' : 'Enable'
    } grouping by groupBy reverse mode`,
  );
}

function onGroupingReset(groupName: GroupNameType) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.grouping) {
    const { reverseMode, isApplied } = configData.grouping;
    configData.grouping = {
      ...configData.grouping,
      reverseMode: { ...reverseMode, [groupName]: false },
      [groupName]: [],
      isApplied: { ...isApplied, [groupName]: true },
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent('[ImagesExplorer] Reset grouping');
}

function onGroupingApplyChange(): void {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      isApplied: {
        ...configData.grouping.isApplied,
        group: !configData.grouping.isApplied['group'],
      },
    };
    updateModelData(configData, true);
  }
}

/**
 * function updateURL has 2 major functionalities:
 *    1. Keeps URL in sync with the app config
 *    2. Stores updated URL in localStorage if App is not in the bookmark state
 * @param {IImagesExploreAppConfig} configData - the current state of the app config
 */
function updateURL(
  configData: IImagesExploreAppConfig = model.getState()!.config!,
) {
  const { grouping, select, images } = configData;
  const url: string = getUrlWithParam({
    grouping: encode(grouping),
    select: encode(select as {}),
    images: encode(images),
  });

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
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    configData.grouping = {
      ...getConfig().grouping,
    };
    updateModelData(configData, true);
  }
}

async function getImagesMetricsData(
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

function getImagesBlobsData(uris: string[]) {
  const request = imagesExploreService.getImagesByURIs(uris);
  return {
    abort: request.abort,
    call: () => {
      return request
        .call()
        .then(async (stream) => {
          let gen = adjustable_reader(stream);
          let buffer_pairs = decode_buffer_pairs(gen);
          let decodedPairs = decodePathsVals(buffer_pairs);
          let objects = iterFoldTree(decodedPairs, 1);

          for await (let [keys, val] of objects) {
            const URI = keys[0];
            blobsURIModel.emit(URI as string, {
              [URI]: arrayBufferToBase64(val as ArrayBuffer) as string,
            });
          }
        })
        .catch((ex) => {
          if (ex.name === 'AbortError') {
            // Abort Error
          } else {
            console.log('Unhandled error: ');
          }
        });
    },
  };
}

function getDataAsImageSet(
  data: any[],
  groupingSelectOptions: IGroupingSelectOption[],
  defaultGroupFields?: string[],
) {
  if (!isEmpty(data)) {
    const configData: IImagesExploreAppConfig | undefined =
      model.getState()?.config;
    const imageSetData: object = {};
    const group: string[] = [...(configData?.grouping?.group || [])];
    const groupFields =
      defaultGroupFields ||
      (configData?.grouping?.reverseMode?.group
        ? groupingSelectOptions
            .filter(
              (option: IGroupingSelectOption) => !group.includes(option.label),
            )
            .map((option) => option.value)
        : group);
    const imagesDataForOrdering = {};
    data.forEach((group: any) => {
      const path = groupFields?.reduce(
        (acc: string[], field: string, index: number) => {
          const value = _.get(group.data[0], field);
          _.set(
            imagesDataForOrdering,
            acc.concat(['ordering']),
            new Set([
              ...(_.get(imagesDataForOrdering, acc.concat(['ordering'])) || []),
              value,
            ]),
          );
          _.set(
            imagesDataForOrdering,
            acc.concat(['key']),
            getValueByField(groupingSelectOptions, field),
          );
          acc.push(
            `${getValueByField(groupingSelectOptions, field)} = ${formatValue(
              value,
            )}`,
          );
          return acc;
        },
        [],
      );
      _.set(
        imageSetData,
        path,
        _.sortBy(group.data, [
          ...groupFields,
          ...groupingSelectOptions
            .map((option: IGroupingSelectOption) => option.value)
            .filter((field) => !groupFields.includes(field)),
          'caption',
        ]),
      );
    });

    return {
      imageSetData: isEmpty(imageSetData) ? data[0].data : imageSetData,
      orderedMap: imagesDataForOrdering,
    };
  } else {
    return {};
  }
}

function onActivePointChange(
  activePoint: any,
  focusedStateActive: boolean = false,
): void {
  const { refs, config } = model.getState() as any;
  if (config.table.resizeMode !== ResizeModeEnum.Hide) {
    const tableRef: any = refs?.tableRef;
    if (tableRef && activePoint.seqKey) {
      tableRef.current?.setHoveredRow?.(activePoint.seqKey);
      tableRef.current?.setActiveRow?.(
        focusedStateActive ? activePoint.seqKey : null,
      );
      if (focusedStateActive) {
        tableRef.current?.scrollToRow?.(activePoint.seqKey);
      }
    }
  }
  let configData = config;
  if (configData?.images) {
    configData = {
      ...configData,
      images: {
        ...configData.images,
        focusedState: {
          active: focusedStateActive,
          key: activePoint.key,
        },
        tooltip: activePoint.key
          ? {
              ...configData.images.tooltip,
              content: filterTooltipContent(
                tooltipData[activePoint.key],
                configData?.images.tooltip.selectedParams,
              ),
            }
          : configData.images.tooltip,
      },
    };

    if (
      config.images.focusedState.active !== focusedStateActive ||
      (config.images.focusedState.active &&
        activePoint.key !== config.images.focusedState.key)
    ) {
      updateURL(configData);
    }
  }

  model.setState({ config: configData });
}

function onChangeTooltip(tooltip: Partial<IPanelTooltip>): void {
  let configData = model.getState()?.config;
  if (configData?.images) {
    let content = configData.images.tooltip.content;
    if (tooltip.selectedParams && configData?.images.focusedState.key) {
      content = filterTooltipContent(
        tooltipData[configData.images.focusedState.key],
        tooltip.selectedParams,
      );
    }
    configData = {
      ...configData,
      images: {
        ...configData.images,
        tooltip: {
          ...configData.images.tooltip,
          ...tooltip,
          content,
        },
      },
    };

    model.setState({ config: configData });
    updateURL(configData);
  }
  analytics.trackEvent('[ImagesExplorer] Change tooltip content');
}

function getDataAsTableRows(
  processedData: IMetricsCollection<IImageData>[],
  paramKeys: string[],
  isRawData: boolean,
  config: IImagesExploreAppConfig,
  groupingSelectOptions: any,
  dynamicUpdate?: boolean,
): { rows: any[] | any; sameValueColumns: string[] } {
  if (!processedData) {
    return {
      rows: [],
      sameValueColumns: [],
    };
  }

  const rows: any[] | any = processedData[0]?.config !== null ? {} : [];

  let rowIndex = 0;
  const sameValueColumns: string[] = [];
  const tableData = groupData(
    Object.values(
      _.groupBy(
        Object.values(processedData)
          .map((v) => v.data)
          .flat(),
        'seqKey',
      ),
    ).map((v) => v[0]),
  );
  tableData.forEach((metricsCollection: IMetricsCollection<IImageData>) => {
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
          dasharray: null,
          itemsCount: metricsCollection.data.length,
          config: groupConfigData,
        },
        key: groupKey!,
        groupRowsKeys: metricsCollection.data.map(
          (metric) => (metric as any).seqKey,
        ),
        experiment: '',
        run: '',
        metric: '',
        context: [],
        children: [],
        groups: groupConfigData,
      };

      rows[groupKey!] = {
        data: groupHeaderRow,
        items: [],
      };
    }

    Object.values(_.groupBy(metricsCollection.data, 'seqKey'))
      .map((v) => v[0])
      .forEach((metric: any) => {
        const rowValues: any = {
          rowMeta: {
            color: metricsCollection.color ?? metric.color,
          },
          key: metric.seqKey,
          runHash: metric.run.hash,
          isHidden: config?.table?.hiddenMetrics?.includes(metric.key),
          index: rowIndex,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.dasharray,
          experiment: metric.run.experiment?.name ?? 'default',
          run: moment(metric.run.props.creation_time * 1000).format(
            'HH:mm:ss · D MMM, YY',
          ),
          name: metric.images_name,
          context: Object.entries(metric.context).map((entry) =>
            entry.join(':'),
          ),
          parentId: groupKey,
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
          'name',
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
              : imagesExploreTableRowRenderer(rowValues, {
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
              : imagesExploreTableRowRenderer(rowValues, {
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
            ? columnsValues[columnKey][0]
            : columnsValues[columnKey];
      }
    }
    if (metricsCollection.config !== null && !isRawData) {
      rows[groupKey!].data = imagesExploreTableRowRenderer(
        rows[groupKey!].data,
        {},
        true,
        ['value', 'name', 'groups'].concat(Object.keys(columnsValues)),
      );
    }
  });
  return { rows, sameValueColumns };
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
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    const app: IAppData | any = await appsService
      .createApp({ state: configData, type: 'images' })
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
  analytics.trackEvent('[ImagesExplorer] Create bookmark');
}

function onBookmarkUpdate(id: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: 'images' })
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
  analytics.trackEvent('[ImagesExplorer] Update bookmark');
}

function updateColumnsWidths(key: string, width: number, isReset: boolean) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
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
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
}

// internal function to update config.table.sortFields and cache data
function updateSortFields(sortFields: SortField[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
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

    setItem('imagesExploreTable', encode(table));
    updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[ImagesExplorer][Table] ${
      isEmpty(sortFields) ? 'Reset' : 'Apply'
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
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
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

function onExportTableData(e: React.ChangeEvent<any>): void {
  const { data, params, config, groupingSelectOptions } =
    model.getState() as IImagesExploreAppModelState;
  const tableData = getDataAsTableRows(
    data,
    params,
    true,
    config,
    groupingSelectOptions,
  );
  const tableColumns: ITableColumn[] = getImagesExploreTableColumns(
    params,
    data[0]?.config,
    config?.table.columnsOrder!,
    config?.table.hiddenColumns!,
    config?.table.sortFields,
    onSortChange,
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

  const groupedRows: any[][] =
    data.length > 1
      ? Object.keys(tableData.rows).map(
          (groupedRowKey: string) => tableData.rows[groupedRowKey].items,
        )
      : [tableData.rows];

  const dataToExport: { [key: string]: string }[] = [];

  groupedRows.forEach((groupedRow: any[], groupedRowIndex: number) => {
    groupedRow.forEach((row: any) => {
      const filteredRow: any = getFilteredRow(filteredHeader, row);
      dataToExport.push(filteredRow);
    });
    if (groupedRows.length - 1 !== groupedRowIndex) {
      dataToExport.push(emptyRow);
    }
  });

  const blob = new Blob([JsonToCSV(dataToExport)], {
    type: 'text/csv;charset=utf-8;',
  });
  saveAs(blob, `images-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
  analytics.trackEvent('[ImagesExplorer] Export runs data to CSV');
}

function onRowVisibilityChange(metricKey: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    let hiddenMetrics = configData?.table?.hiddenMetrics || [];
    if (hiddenMetrics?.includes(metricKey)) {
      hiddenMetrics = hiddenMetrics.filter(
        (hiddenMetric: any) => hiddenMetric !== metricKey,
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
    model.setState({ config });
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
}

function getFilteredRow(
  columnKeys: string[],
  row: any,
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

function onTableResizeEnd(tableHeight: string) {
  const configData: IImagesExploreAppConfig | undefined =
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
    setItem('imagesExploreTable', encode(table));
  }
}

function onSelectRunQueryChange(query: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query, query },
      images: { ...configData.images, calcRanges: true },
    };

    model.setState({
      config: newConfig,
    });
  }
}

function onTableResizeModeChange(mode: ResizeModeEnum): void {
  const configData: IImagesExploreAppConfig | undefined =
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
    setItem('imagesExploreTable', encode(table));
  }
  analytics.trackEvent(
    `[ImagesExplorer][Table] Set table view mode to "${mode}"`,
  );
}

function onSearchQueryCopy(): void {
  const selectedMetricsData = model.getState()?.config?.select;
  let query = getQueryStringFromSelect(selectedMetricsData as any);
  if (query) {
    navigator.clipboard.writeText(query);
    onNotificationAdd({
      id: Date.now(),
      severity: 'success',
      message: 'Run Expression Copied',
    });
  }
}

function getQueryStringFromSelect(
  selectData: IImagesExploreAppConfig['select'],
) {
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
            `(images.name == "${option.value?.option_name}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map(
                      (item) =>
                        `images.context.${item} == ${formatValue(
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

function onSelectAdvancedQueryChange(query: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query },
      images: { ...configData.images, calcRanges: true },
    };

    model.setState({
      config: newConfig,
    });
  }
}

function onImagesExploreSelectChange(options: ISelectOption[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, options },
      images: { ...configData.images, calcRanges: true },
    };

    model.setState({
      config: newConfig,
    });
  }
}

function toggleSelectAdvancedMode() {
  const configData: IImagesExploreAppConfig | undefined =
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
  analytics.trackEvent(
    `[ImagesExplorer] Turn ${
      !configData?.select.advancedMode ? 'on' : 'off'
    } the advanced mode of select form`,
  );
}

function onColumnsOrderChange(columnsOrder: any) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
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
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
  if (
    isEmpty(columnsOrder?.left) &&
    isEmpty(columnsOrder?.middle) &&
    isEmpty(columnsOrder?.right)
  ) {
    analytics.trackEvent('[ImagesExplorer][Table] Reset table columns order');
  }
}

function onColumnsVisibilityChange(hiddenColumns: string[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  const columnsData = model.getState()!.tableColumns!;
  if (configData?.table) {
    const table = {
      ...configData.table,
      hiddenColumns:
        hiddenColumns[0] === 'all'
          ? columnsData.map((col: any) => col.key)
          : hiddenColumns,
    };
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });
    setItem('imagesExploreTable', encode(table));
    updateModelData(configUpdate);
  }
  if (hiddenColumns[0] === 'all') {
    analytics.trackEvent('[ImagesExplorer][Table] Hide all table columns');
  } else if (isEmpty(hiddenColumns)) {
    analytics.trackEvent('[ImagesExplorer][Table] Show all table columns');
  }
}

function onTableDiffShow() {
  const sameValueColumns = model.getState()?.sameValueColumns;
  if (sameValueColumns) {
    onColumnsVisibilityChange(sameValueColumns);
  }
  analytics.trackEvent('[ImagesExplorer][Table] Show table columns diff');
}

function onRowHeightChange(height: RowHeightSize) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
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
    `[ImagesExplorer][Table] Set table row height to "${RowHeightEnum[
      height
    ].toLowerCase()}"`,
  );
}

function onImageVisibilityChange(metricsKeys: string[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  const processedData = model.getState()?.data;
  if (configData?.table && processedData) {
    const table = {
      ...configData.table,
      hiddenMetrics:
        metricsKeys[0] === 'all'
          ? Object.values(processedData)
              .map((metricCollection: any) =>
                metricCollection.data.map((metric: any) => metric.key),
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
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
  analytics.trackEvent(
    `[ImagesExplorer][Table] ${
      metricsKeys[0] === 'all'
        ? 'Visualize all hidden metrics from table'
        : 'Hide all metrics from table'
    }`,
  );
}

function onSliceRangeChange(key: string, newValue: number[] | number) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      [key]: newValue,
    };
    const config = {
      ...configData,
      images,
    };

    const searchButtonDisabled: boolean =
      images.recordDensity === '0' || images.indexDensity === '0';
    model.setState({
      config,
      searchButtonDisabled,
      applyButtonDisabled: searchButtonDisabled,
    });
  }
}

function onDensityChange(e: React.ChangeEvent<HTMLInputElement>, key: string) {
  let { value } = e.target;
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      [key]: formatToPositiveNumber(+value),
    };
    const config = {
      ...configData,
      images,
    };
    const searchButtonDisabled =
      images.recordDensity === '0' || images.indexDensity === '0';
    model.setState({
      config,
      searchButtonDisabled,
      applyButtonDisabled: searchButtonDisabled,
    });
  }
}

function onRecordDensityChange(event: ChangeEvent<{ value: number }>) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      recordDensity: formatToPositiveNumber(+event.target.value),
    };
    const config = {
      ...configData,
      images,
    };
    const searchButtonDisabled =
      images.recordDensity === '0' || images.indexDensity === '0';
    model.setState({
      config,
      searchButtonDisabled,
      applyButtonDisabled: searchButtonDisabled,
    });
  }
}

const onImageSizeChange = _.throttle((value: number) => {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      additionalProperties: {
        ...configData.images.additionalProperties,
        mediaItemSize: value,
      },
    };
    const config = {
      ...configData,
      images,
    };
    updateURL(config as IImagesExploreAppConfig);
    model.setState({
      config,
    });
  }
}, IMAGE_SIZE_CHANGE_DELAY);

function onImageRenderingChange(type: ImageRenderingEnum) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      additionalProperties: {
        ...configData.images.additionalProperties,

        imageRendering: type,
      },
    };
    const config = {
      ...configData,
      images,
    };
    updateURL(config as IImagesExploreAppConfig);
    model.setState({
      config,
    });
  }
}

function onImageAlignmentChange(
  option: { value: string; label: string } | null,
) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      additionalProperties: {
        ...configData.images.additionalProperties,
        alignmentType: option?.value,
      },
    };
    const config = {
      ...configData,
      images,
    };
    updateURL(config as IImagesExploreAppConfig);
    model.setState({
      config,
    });
  }
}

function isRangePanelShow() {
  return (
    !!getStateFromUrl('select')?.query ||
    !isEmpty(getStateFromUrl('select')?.images) ||
    (!!getStateFromUrl('select')?.advancedQuery &&
      !!getStateFromUrl('select')?.advancedMode)
  );
}

const imagesExploreAppModel = {
  ...model,
  initialize,
  getImagesData,
  abortRequest,
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
  updateColumnsWidths,
  onSortChange,
  onSortReset,
  onExportTableData,
  onRowVisibilityChange,
  onTableResizeEnd,
  onTableResizeModeChange,
  onSearchQueryCopy,
  getQueryStringFromSelect,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  onImagesExploreSelectChange,
  toggleSelectAdvancedMode,
  onColumnsOrderChange,
  onColumnsVisibilityChange,
  onTableDiffShow,
  onRowHeightChange,
  onImageVisibilityChange,
  onSliceRangeChange,
  onDensityChange,
  onRecordDensityChange,
  getImagesBlobsData,
  onChangeTooltip,
  onActivePointChange,
  onImageSizeChange,
  onImageRenderingChange,
  onImageAlignmentChange,
  isRangePanelShow,
  getGroupingSelectOptions,
  getDataAsImageSet,
};

export default imagesExploreAppModel;
