import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';
import { saveAs } from 'file-saver';

import { RowHeightSize } from 'config/table/tableConfigs';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { ResizeModeEnum, RowHeightEnum } from 'config/enums/tableEnums';
import { IMAGE_SIZE_CHANGE_DELAY } from 'config/mediaConfigs/mediaConfigs';
import { ImageRenderingEnum } from 'config/enums/imageEnums';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import COLORS from 'config/colors/colors';
import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DATE_EXPORTING_FORMAT, TABLE_DATE_FORMAT } from 'config/dates/dates';
import { getSuggestionsByExplorer } from 'config/monacoConfig/monacoConfig';

import {
  getImagesExploreTableColumns,
  imagesExploreTableRowRenderer,
} from 'pages/ImagesExplore/components/ImagesExploreTableGrid/ImagesExploreTableGrid';

import * as analytics from 'services/analytics';
import imagesExploreService from 'services/api/imagesExplore/imagesExploreService';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';
import blobsURIModel from 'services/models/media/blobsURIModel';
import projectsService from 'services/api/projects/projectsService';
import runsService from 'services/api/runs/runsService';

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
} from 'types/services/models/metrics/metricsAppModel';
import { IMetricTrace, IRun } from 'types/services/models/metrics/runModel';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
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
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';

import getAppConfigDataMethod from 'utils/app/getAppConfigData';
import onRowSelectAction from 'utils/app/onRowSelect';
import { decode, encode } from 'utils/encoder/encoder';
import getObjectPaths from 'utils/getObjectPaths';
import getUrlWithParam from 'utils/getUrlWithParam';
import getStateFromUrl from 'utils/getStateFromUrl';
import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { getItem, setItem } from 'utils/storage';
import JsonToCSV from 'utils/JsonToCSV';
import { formatValue } from 'utils/formatValue';
import getValueByField from 'utils/getValueByField';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';
import getTooltipData from 'utils/app/getTooltipData';
import filterTooltipContent from 'utils/filterTooltipContent';
import { getDataAsMediaSetNestedObject } from 'utils/app/getDataAsMediaSetNestedObject';
import { getCompatibleSelectConfig } from 'utils/app/getCompatibleSelectConfig';
import { getSortedFields, SortField, SortFields } from 'utils/getSortedFields';
import { getValue } from 'utils/helper';
import contextToString from 'utils/contextToString';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import onNotificationDelete from 'utils/app/onNotificationDelete';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import getAdvancedSuggestion from 'utils/getAdvancedSuggestions';

import createModel from '../model';
import { AppNameEnum } from '../explorer';

const model = createModel<Partial<IImagesExploreAppModelState>>({
  requestStatus: RequestStatusEnum.NotRequested,
  searchButtonDisabled: false,
  applyButtonDisabled: true,
  selectFormData: {
    options: undefined,
    suggestions: [],
  },
  config: getConfig(),
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
      indexDensity: '5',
      recordDensity: '50',
      tooltip: {
        content: {},
        display: CONTROLS_DEFAULT_CONFIG.images.tooltip.display,
        selectedParams: CONTROLS_DEFAULT_CONFIG.images.tooltip.selectedParams,
      },
      additionalProperties: {
        alignmentType: CONTROLS_DEFAULT_CONFIG.images.alignmentType,
        mediaItemSize: CONTROLS_DEFAULT_CONFIG.images.mediaItemSize,
        imageRendering: CONTROLS_DEFAULT_CONFIG.images.imageRendering,
        stacking: CONTROLS_DEFAULT_CONFIG.images.stacking,
      },
      focusedState: {
        active: false,
        key: null,
      },
      sortFields: [],
      sortFieldsDict: {},
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

let runsArchiveRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<any>;
  abort: () => void;
};
let runsDeleteRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<any>;
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
  projectsService
    .getProjectParams(['images'])
    .call()
    .then((data: IProjectParamsMetrics) => {
      const advancedSuggestions: Record<any, any> = getAdvancedSuggestion(
        data.images,
      );
      model.setState({
        selectFormData: {
          options: getSelectFormOptions(data),
          suggestions: getSuggestionsByExplorer(AppNameEnum.IMAGES, data),
          advancedSuggestions: {
            ...getSuggestionsByExplorer(AppNameEnum.IMAGES, data),
            images: {
              name: '',
              context: _.isEmpty(advancedSuggestions)
                ? ''
                : { ...advancedSuggestions },
            },
          },
        },
      });
    });
}

function setDefaultAppConfigData(recoverTableState: boolean = true) {
  const defaultConfig: Partial<IImagesExploreAppConfig> = {};

  const grouping: IImagesExploreAppConfig['grouping'] =
    getStateFromUrl('grouping') ?? {};

  defaultConfig.grouping = grouping;

  const compatibleSelectConfig = getCompatibleSelectConfig(
    ['images'],
    getStateFromUrl('select'),
  );
  const select: ISelectConfig = compatibleSelectConfig ?? {};

  defaultConfig.select = select;

  const images: IImagesExploreAppConfig['images'] =
    getStateFromUrl('images') ?? {};

  defaultConfig.images = images;

  if (recoverTableState) {
    const tableConfigHash = getItem('imagesExploreTable');
    const table = tableConfigHash
      ? JSON.parse(decode(tableConfigHash))
      : getConfig().table;

    defaultConfig.table = table;
  }

  const configData = _.mergeWith(
    {},
    model.getState().config,
    defaultConfig,
    (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return srcValue;
      }
    },
  );

  model.setState({ config: configData });
}

let imagesRequestRef: {
  call: (
    exceptionHandler: (detail: any) => void,
  ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
  abort: () => void;
};

function getAppConfigData(appId: string) {
  return getAppConfigDataMethod({
    appId,
    appRequest: appRequestRef,
    config: getConfig(),
    model,
  });
}

function resetModelState() {
  model.setState({
    ...model.getState(),
    data: [],
    params: [],
    imagesData: {},
    tableData: [],
    tableColumns: [],
    rawData: [],
  });
}

function abortRequest(): void {
  if (imagesRequestRef) {
    imagesRequestRef.abort();
  }
  model.setState({
    requestStatus: RequestStatusEnum.Ok,
  });
  onNotificationAdd({
    notification: {
      id: Date.now(),
      severity: 'info',
      messages: ['Request has been cancelled'],
    },
    model,
  });
}

function getImagesData(
  shouldUrlUpdate?: boolean,
  shouldResetSelectedRows?: boolean,
) {
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
  let query = getQueryStringFromSelect(configData?.select as any);
  let imageDataBody: any = {
    q: query !== '()' ? query : '',
  };
  if (recordSlice) {
    //TODO check values nullability
    imageDataBody = {
      ...imageDataBody,
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
  imagesRequestRef = imagesExploreService.getImagesExploreData(imageDataBody);
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
          const stream = await imagesRequestRef.call((detail) => {
            exceptionHandler({ detail, model });
            resetModelState();
          });
          const runData = await getImagesMetricsData(stream);

          if (configData) {
            setModelData(runData, configData);
          }
        } catch (ex: Error | any) {
          if (ex.name === 'AbortError') {
            // Abort Error
          } else {
            // eslint-disable-next-line no-console
            console.log('Unhandled error: ', ex);
          }
        }
      } else {
        model.setState({
          selectedRows: shouldResetSelectedRows
            ? {}
            : model.getState()?.selectedRows,
          queryIsEmpty: true,
          imagesData: {},
          tableData: [],
          images: {
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
            grouping: { ...getConfig().grouping },
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

function getSelectFormOptions(projectsData: IProjectParamsMetrics) {
  let data: ISelectOption[] = [];
  let index: number = 0;
  if (projectsData?.images) {
    for (let key in projectsData.images) {
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

      for (let val of projectsData.images[key]) {
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

function processData(data: any[]): {
  data: IMetricsCollection<IImageData>[];
  params: string[];
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

  const processedData = groupData(
    _.orderBy(
      metrics,
      sortFields?.map(
        (f: SortField) =>
          function (metric: SortField) {
            return getValue(metric, f.value, '');
          },
      ),
      sortFields?.map((f: any) => f.order),
    ),
  );
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
    params: [...new Set(uniqParams.concat(uniqHighLevelParams))].sort(),
    contexts: uniqContexts,
    selectedRows,
  };
}

function setModelData(rawData: any[], configData: IImagesExploreAppConfig) {
  const sortFields = model.getState()?.config?.table.sortFields;
  const { data, params, contexts, selectedRows } = processData(rawData);
  const groupingSelectOptions = [
    ...getGroupingSelectOptions({
      params,
      contexts,
    }),
  ];
  const { mediaSetData, orderedMap } = getDataAsMediaSetNestedObject({
    data,
    groupingSelectOptions,
    model,
  });

  tooltipData = getTooltipData({
    processedData: data,
    paramKeys: params,
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
  const ranges = rawData?.[0]?.ranges;
  const tableData = getDataAsTableRows(
    data,
    params,
    false,
    configData,
    groupingSelectOptions,
  );
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
    !config.images.recordDensity ||
    +config.images.recordDensity < ranges?.record_range_total[0] ||
    +config.images.recordDensity > recordRangeTotalCount
      ? `${recordRangeTotalCount === 0 ? 1 : recordRangeTotalCount}`
      : config.images.recordDensity;
  const indexDensity =
    !config.images.indexDensity ||
    +config.images.indexDensity < ranges?.index_range_total[0] ||
    +config.images.indexDensity > indexRangeTotalCount
      ? `${indexRangeTotalCount === 0 ? 1 : indexRangeTotalCount}`
      : config.images.indexDensity;

  config.images = {
    ...config.images,
    stepRange: !_.isEmpty(rawData)
      ? [ranges?.record_range_total[0], ranges?.record_range_total[1] - 1]
      : config.images.stepRange,
    indexRange: !_.isEmpty(rawData)
      ? [ranges?.index_range_total[0], ranges?.index_range_total[1] - 1]
      : config.images.indexRange,
    recordSlice,
    indexSlice,
    recordDensity,
    indexDensity,
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
    requestStatus: RequestStatusEnum.Ok,
    rawData,
    config,
    params,
    data,
    selectedRows,
    imagesData: mediaSetData,
    orderedMap,
    tableData: tableData.rows,
    tableColumns: getImagesExploreTableColumns(
      params,
      groupingSelectOptions,
      data[0]?.config,
      configData.table.columnsOrder!,
      configData.table.hiddenColumns!,
      sortFields,
      onTableSortChange,
    ),
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
  });
}

function updateModelData(
  configData: IImagesExploreAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params, contexts, selectedRows } = processData(
    model.getState()?.rawData as any[],
  );
  const groupingSelectOptions = [
    ...getGroupingSelectOptions({
      params,
      contexts,
    }),
  ];
  const { mediaSetData, orderedMap } = getDataAsMediaSetNestedObject({
    data,
    groupingSelectOptions,
    model,
  });
  tooltipData = getTooltipData({
    processedData: data,
    paramKeys: params,
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
    groupingSelectOptions,
    data[0]?.config,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
    configData.table.sortFields,
    onTableSortChange,
  );
  const tableRef: any = model.getState()?.refs?.tableRef;
  tableRef?.current?.updateData({
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
    imagesData: mediaSetData,
    orderedMap,
    tableData: tableData.rows,
    tableColumns,
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
    selectedRows,
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
      label: 'run.name',
      value: 'run.props.name',
    },
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
    {
      group: 'run',
      label: 'run.creation_time',
      value: 'run.props.creation_time',
    },
    ...paramsOptions,
    {
      group: 'images',
      label: 'images.name',
      value: 'images_name',
    },
    {
      group: 'images',
      label: 'images.context',
      value: 'context',
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
      groupValue[field] = getValue(data[i], field);
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
    if (
      configData.images?.additionalProperties?.stacking &&
      (_.isEmpty(configData.grouping.group) ||
        configData.grouping.reverseMode.group)
    ) {
      onStackingToggle();
    }
  }
  analytics.trackEvent(
    // @ts-ignore
    `${ANALYTICS_EVENT_KEYS.images.groupings[groupName].select}`,
  );
}

function onGroupingModeChange({ value }: IOnGroupingModeChangeParams): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      reverseMode: {
        ...configData.grouping.reverseMode,
        group: value,
      },
    };
    updateModelData(configData, true);
    if (
      configData.images?.additionalProperties?.stacking &&
      (_.isEmpty(configData.grouping.group) ||
        configData.grouping.reverseMode.group)
    ) {
      onStackingToggle();
    }
  }
  if (value) {
    analytics.trackEvent(
      // @ts-ignore
      ANALYTICS_EVENT_KEYS.images.groupings.group.modeChange,
      //@TODO change group to dynamic groupName when adding grouping type
    );
  }
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
    if (
      configData.images?.additionalProperties?.stacking &&
      (_.isEmpty(configData.grouping.group) ||
        configData.grouping.reverseMode.group)
    ) {
      onStackingToggle();
    }
  }
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
    setItem('imagesUrl', url);
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
  let bufferPairs = decodeBufferPairs(stream);
  let decodedPairs = decodePathsVals(bufferPairs);
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
        .call((detail: any) => {
          exceptionHandler({ detail, model });
        })
        .then(async (stream) => {
          let bufferPairs = decodeBufferPairs(stream);
          let decodedPairs = decodePathsVals(bufferPairs);
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
            // eslint-disable-next-line no-console
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
  if (!_.isEmpty(data)) {
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
          const value = getValue(group.data[0], field);
          _.set(
            imagesDataForOrdering,
            acc.concat(['ordering']),
            new Set([
              ...(getValue(imagesDataForOrdering, acc.concat(['ordering'])) ||
                []),
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
      imageSetData: _.isEmpty(imageSetData) ? data[0].data : imageSetData,
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
  if (config?.table.resizeMode !== ResizeModeEnum.Hide) {
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
  analytics.trackEvent(
    ANALYTICS_EVENT_KEYS.images.imagesPanel.controls.tooltip
      .changeTooltipContent,
  );
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
        date: '',
        description: '',
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
          selectKey: `${metric.run.hash}/${metric.seqKey}`,
          runHash: metric.run.hash,
          isHidden: config?.table?.hiddenMetrics?.includes(metric.key),
          index: rowIndex,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.dasharray,
          experiment: metric.run.props.experiment?.name ?? 'default',
          run: metric.run.props?.name ?? '-',
          description: metric.run.props?.description ?? '-',
          date: moment(metric.run.props.creation_time * 1000).format(
            TABLE_DATE_FORMAT,
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
            const value = getValue(metric.run.params, paramKey, '-');
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
            ? paramKeys.includes(columnKey)
              ? formatValue(columnsValues[columnKey][0])
              : columnsValues[columnKey][0]
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

async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    const app: IAppData | any = await appsService
      .createApp({ state: configData, type: 'images' })
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
  analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.createBookmark);
}

function onBookmarkUpdate(id: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: 'images' })
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
function updateTableSortFields(sortFields: SortFields) {
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
    updateModelData(configUpdate, true);
  }
  analytics.trackEvent(
    `${ANALYTICS_EVENT_KEYS.images.table.changeSorting} ${
      _.isEmpty(sortFields) ? 'Reset' : 'Apply'
    }`,
  );
}
// internal function to update config.table.sortFields and cache data
function updateImagesSortFields(sortFields: SortFields, sortFieldsDict: any) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    const images = {
      ...configData.images,
      sortFields,
      sortFieldsDict,
    };
    const configUpdate = {
      ...configData,
      images,
    };
    model.setState({
      config: configUpdate,
    });

    updateModelData(configUpdate, true);
  }
  analytics.trackEvent(
    `${ANALYTICS_EVENT_KEYS.images.imagesPanel.controls.changeSorting} ${
      _.isEmpty(sortFields) ? 'Reset' : 'Apply'
    } images sorting by a key`,
  );
}

// set empty array to config.table.sortFields
function onSortReset() {
  updateTableSortFields([]);
}

function onImagesSortReset() {
  updateImagesSortFields([], {});
}

/**
 * function onTableSortChange has 3 major functionalities
 *    1. if only field param passed, the function will change sort option with the following cycle ('asc' -> 'desc' -> none -> 'asc)
 *    2. if value param passed 'asc' or 'desc', the function will replace the sort option of the field in sortFields
 *    3. if value param passed 'none', the function will delete the field from sortFields
 * @param {String} field  - the name of the field (i.e params.dataset.preproc)
 * @param {'asc' | 'desc' | 'none'} value - 'asc' | 'desc' | 'none'
 */
function onTableSortChange({
  sortFields,
  order,
  index,
  actionType,
  field,
}: any) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;

  updateTableSortFields(
    getSortedFields({
      sortFields: sortFields || configData?.table.sortFields || [],
      order,
      index,
      actionType,
      field,
    }),
  );
}

function onImagesSortChange({
  sortFields,
  order,
  index,
  actionType,
  field,
}: any) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  const resultSortFields = getSortedFields({
    sortFields: sortFields || configData?.images.sortFields || [],
    order,
    index,
    actionType,
    field,
  });
  updateImagesSortFields(
    resultSortFields,
    resultSortFields.reduce((acc: any, field: any) => {
      acc[field.value] = field;
      return acc;
    }, {}),
  );
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
    groupingSelectOptions,
    data[0]?.config,
    config?.table.columnsOrder!,
    config?.table.hiddenColumns!,
    config?.table.sortFields,
    onTableSortChange,
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
    groupedRow?.forEach((row: any) => {
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
  saveAs(blob, `images-${moment().format(DATE_EXPORTING_FORMAT)}.csv`);
  analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.table.exports.csv);
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
      images: { ...configData.images },
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
  analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.table.changeResizeMode);
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
      images: { ...configData.images },
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
      images: { ...configData.images },
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
    `${ANALYTICS_EVENT_KEYS.images.useAdvancedSearch} ${
      !configData?.select.advancedMode ? 'on' : 'off'
    }`,
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
  analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.table.changeColumnsOrder);
}

function onColumnsVisibilityChange(hiddenColumns: string[] | string | any) {
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
    analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.table.showAllColumns);
  } else if (_.isEmpty(hiddenColumns)) {
    analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.table.hideAllColumns);
  }
}

function onTableDiffShow() {
  const sameValueColumns = model.getState()?.sameValueColumns;
  if (sameValueColumns) {
    onColumnsVisibilityChange(sameValueColumns);
  }
  analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.table.showDiff);
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
    `${
      ANALYTICS_EVENT_KEYS.images.table.changeTableRowHeight
    } to "${RowHeightEnum[height].toLowerCase()}"`,
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
    `${ANALYTICS_EVENT_KEYS.images.table.metricVisibilityChange} ${
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

    model.setState({
      config,
    });
  }
}

function onDensityChange(name: string, value: number, metaData: any) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      [name]: +value,
      inputsValidations: {
        ...configData.images?.inputsValidations,
        [name]: metaData?.isValid,
      },
    };
    const config = {
      ...configData,
      images,
    };
    model.setState({
      config,
    });
  }
  applyBtnDisabledHandler();
}

function applyBtnDisabledHandler() {
  const state = model.getState();
  const inputsValidations = state.config?.images?.inputsValidations || {};

  const isInputsValid =
    _.size(
      Object.keys(inputsValidations).filter((key) => {
        return inputsValidations[key] === false;
      }),
    ) <= 0;

  model.setState({
    ...state,
    applyButtonDisabled: !isInputsValid,
  });
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

  analytics.trackEvent(
    `${ANALYTICS_EVENT_KEYS.images.imagesPanel.controls.changeImageProperties} / size`,
  );
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
  analytics.trackEvent(
    `${ANALYTICS_EVENT_KEYS.images.imagesPanel.controls.changeImageProperties} / image rendering to ${type}`,
  );
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
    model.setState({ config });
  }

  analytics.trackEvent(
    `${ANALYTICS_EVENT_KEYS.images.imagesPanel.controls.changeImageProperties} / Alignment to ${option?.label}`,
  );
}

function showRangePanel() {
  return (
    model.getState().requestStatus !== RequestStatusEnum.Pending &&
    !model.getState().queryIsEmpty
  );
}

function archiveRuns(
  ids: string[],
  archived: boolean,
): {
  call: () => Promise<void>;
  abort: () => void;
} {
  runsArchiveRef = runsService.archiveRuns(ids, archived);
  return {
    call: async () => {
      try {
        await runsArchiveRef
          .call((detail) => exceptionHandler({ detail, model }))
          .then(() => {
            getImagesData(false, true).call();
            onNotificationAdd({
              notification: {
                id: Date.now(),
                severity: 'success',
                messages: [
                  `Runs are successfully ${
                    archived ? 'archived' : 'unarchived'
                  } `,
                ],
              },
              model,
            });
          });
      } catch (ex: Error | any) {
        if (ex.name === 'AbortError') {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'error',
              messages: [ex.message],
            },
            model,
          });
        }
      } finally {
        analytics.trackEvent(
          ANALYTICS_EVENT_KEYS.images.table.archiveRunsBatch,
        );
      }
    },
    abort: runsArchiveRef.abort,
  };
}

function deleteRuns(ids: string[]): {
  call: () => Promise<void>;
  abort: () => void;
} {
  runsDeleteRef = runsService.deleteRuns(ids);
  return {
    call: async () => {
      try {
        await runsDeleteRef
          .call((detail) => exceptionHandler({ detail, model }))
          .then(() => {
            getImagesData(false, true).call();
            onNotificationAdd({
              notification: {
                id: Date.now(),
                severity: 'success',
                messages: ['Runs are successfully deleted'],
              },
              model,
            });
          });
      } catch (ex: Error | any) {
        if (ex.name === 'AbortError') {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'error',
              messages: [ex.message],
            },
            model,
          });
        }
      } finally {
        analytics.trackEvent(ANALYTICS_EVENT_KEYS.images.table.deleteRunsBatch);
      }
    },
    abort: runsDeleteRef.abort,
  };
}

function onRowSelect({
  actionType,
  data,
}: {
  actionType: 'single' | 'selectAll' | 'removeAll';
  data?: any;
}): void {
  return onRowSelectAction({ actionType, data, model });
}

function onModelNotificationDelete(id: number): void {
  onNotificationDelete({ id, model });
}

function onStackingToggle(): void {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      additionalProperties: {
        ...configData.images.additionalProperties,
        stacking: !configData.images.additionalProperties.stacking,
      },
    };
    const config = { ...configData, images };
    updateURL(config as IImagesExploreAppConfig);
    model.setState({ config });
    analytics.trackEvent(
      `${ANALYTICS_EVENT_KEYS.images.imagesPanel.controls.groupStacking} to ${
        !configData.images.additionalProperties.stacking
          ? 'Enabled'
          : 'Disabled'
      }`,
    );
  }
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
  onNotificationDelete: onModelNotificationDelete,
  onNotificationAdd,
  onResetConfigData,
  updateURL,
  updateModelData,
  onBookmarkUpdate,
  onBookmarkCreate,
  getAppConfigData,
  setDefaultAppConfigData,
  updateColumnsWidths,
  onTableSortChange,
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
  getImagesBlobsData,
  onChangeTooltip,
  onActivePointChange,
  onImageSizeChange,
  onImageRenderingChange,
  onImageAlignmentChange,
  showRangePanel,
  getGroupingSelectOptions,
  getDataAsImageSet,
  onStackingToggle,
  onImagesSortChange,
  onImagesSortReset,
  deleteRuns,
  archiveRuns,
  onRowSelect,
};

export default imagesExploreAppModel;
