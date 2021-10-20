import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';
import { saveAs } from 'file-saver';

import runsService from 'services/api/runs/runsService';
import createModel from '../model';
import { decode, encode } from 'utils/encoder/encoder';
import getObjectPaths from 'utils/getObjectPaths';
import contextToString from 'utils/contextToString';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import filterTooltipContent from 'utils/filterTooltipContent';
import getUrlWithParam from 'utils/getUrlWithParam';
import { getItem, setItem } from 'utils/storage';
import getStateFromUrl from 'utils/getStateFromUrl';
// Types
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum } from 'utils/d3';
import {
  GroupNameType,
  IAppData,
  IChartTitle,
  IChartTitleData,
  IChartTooltip,
  IDashboardData,
  IGetGroupingPersistIndex,
  IGroupingSelectOption,
  IMetricAppConfig,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ITooltipData,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';
import { IParamTrace, IRun } from 'types/services/models/metrics/runModel';
import {
  IParam,
  IParamsAppConfig,
} from 'types/services/models/params/paramsAppModel';
import { IDimensionsType } from 'types/utils/d3/drawParallelAxes';
import { ISelectParamsOption } from 'types/pages/params/components/SelectForm/SelectForm';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';
import { IBookmarkFormState } from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import {
  getParamsTableColumns,
  paramsTableRowRenderer,
} from 'pages/Params/components/ParamsTableGrid/ParamsTableGrid';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import JsonToCSV from 'utils/JsonToCSV';
import { formatValue } from 'utils/formatValue';
import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum, RowHeightEnum } from 'config/enums/tableEnums';
import * as analytics from 'services/analytics';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';

// TODO need to implement state type
const model = createModel<Partial<any>>({
  isParamsLoading: null,
  config: getConfig(),
});

let tooltipData: ITooltipData = {};

let appRequestRef: {
  call: () => Promise<IAppData>;
  abort: () => void;
};

let liveUpdateInstance: LiveUpdateService | null;

function getConfig() {
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
      selectOptions: [],
    },
    chart: {
      curveInterpolation: CurveEnum.Linear,
      isVisibleColorIndicator: false,
      focusedState: {
        key: null,
        xValue: null,
        yValue: null,
        active: false,
        chartIndex: null,
      },
      tooltip: {
        content: {},
        display: true,
        selectedParams: [],
      },
    },
    select: {
      params: [],
      query: '',
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
    },
    liveUpdate: {
      delay: 7000,
      enabled: false,
    },
  };
}

let getRunsRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<any>;
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

  const liveUpdateState = model.getState()?.config.liveUpdate;

  if (liveUpdateState?.enabled) {
    liveUpdateInstance = new LiveUpdateService(
      'params',
      updateData,
      liveUpdateState.delay,
    );
  }
}

function updateData(newData: any) {
  const { data, params, metricsColumns } = processData(newData);

  const configData = model.getState()?.config;
  if (configData) {
    configData.grouping.selectOptions = [...getGroupingSelectOptions(params)];
  }

  const sortFields = model.getState()?.config?.table.sortFields;

  const tableData = getDataAsTableRows(
    data,
    metricsColumns,
    params,
    false,
    configData,
  );

  const tableColumns = getParamsTableColumns(
    metricsColumns,
    params,
    data[0]?.config,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
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
    data,
    highPlotData: getDataAsLines(data),
    chartTitleData: getChartTitleData(data),
    params,
    metricsColumns,
    rawData: newData,
    config: configData,
    tableData: tableData.rows,
    tableColumns: tableColumns,
    sameValueColumns: tableData.sameValueColumns,
    isParamsLoading: false,
    groupingSelectOptions: [...getGroupingSelectOptions(params)],
  });
}

function resetModelOnError(detail?: any) {
  model.setState({
    data: [],
    rowData: [],
    highPlotData: [],
    chartTitleData: null,
    requestIsPending: false,
    infiniteIsPending: false,
    tableColumns: [],
    tableData: [],
    isParamsLoading: false,
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

function setDefaultAppConfigData() {
  const grouping: IParamsAppConfig['grouping'] =
    getStateFromUrl('grouping') || getConfig().grouping;
  const chart: IParamsAppConfig['chart'] =
    getStateFromUrl('chart') || getConfig().chart;
  const select: IParamsAppConfig['select'] =
    getStateFromUrl('select') || getConfig().select;

  const tableConfigHash = getItem('paramsTable');
  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;

  const liveUpdateConfigHash = getItem('paramsLUConfig');
  const luConfig = liveUpdateConfigHash
    ? JSON.parse(decode(liveUpdateConfigHash))
    : getConfig().liveUpdate;

  const configData: IParamsAppConfig | any = _.merge(getConfig(), {
    chart,
    grouping,
    select,
    table,
    liveUpdate: luConfig,
  });

  model.setState({
    config: configData,
  });
}

function getParamsData(shouldUrlUpdate?: boolean) {
  return {
    call: async () => {
      if (shouldUrlUpdate) {
        updateURL();
      }
      liveUpdateInstance?.stop().then();
      const select = model.getState()?.config?.select;
      getRunsRequestRef = runsService.getRunsData(select?.query);
      if (_.isEmpty(select?.params)) {
        model.setState({
          highPlotData: [],
          tableData: [],
          data: [],
          rawData: [],
          tableColumns: [],
          isParamsLoading: false,
        });
      } else {
        model.setState({ isParamsLoading: true });
        const stream = await getRunsRequestRef.call(exceptionHandler);
        let gen = adjustable_reader(stream);
        let buffer_pairs = decode_buffer_pairs(gen);
        let decodedPairs = decodePathsVals(buffer_pairs);
        let objects = iterFoldTree(decodedPairs, 1);

        const runData: IRun<IParamTrace>[] = [];
        for await (let [keys, val] of objects) {
          runData.push({ ...(val as any), hash: keys[0] });
        }
        const { data, params, metricsColumns } = processData(runData);
        const configData = model.getState()?.config;
        if (configData) {
          configData.grouping.selectOptions = [
            ...getGroupingSelectOptions(params),
          ];
        }

        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          false,
          configData,
        );
        const sortFields = model.getState()?.config?.table.sortFields;

        model.setState({
          data,
          highPlotData: getDataAsLines(data),
          chartTitleData: getChartTitleData(data),
          params,
          metricsColumns,
          rawData: runData,
          config: configData,
          tableData: tableData.rows,
          tableColumns: getParamsTableColumns(
            metricsColumns,
            params,
            data[0]?.config,
            configData.table.columnsOrder!,
            configData.table.hiddenColumns!,
            sortFields,
            onSortChange,
            configData.grouping as any,
            onGroupingSelectChange,
          ),
          sameValueColumns: tableData.sameValueColumns,
          isParamsLoading: false,
          groupingSelectOptions: [...getGroupingSelectOptions(params)],
        });

        liveUpdateInstance?.start({
          q: select?.query,
        });
      }
    },
    abort: () => getRunsRequestRef.abort(),
  };
}

//Table Methods

function onTableRowHover(rowKey?: string): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;

    if (chartPanelRef && !configData.chart.focusedState.active) {
      chartPanelRef.current?.setActiveLineAndCircle(rowKey);
    }
  }
}

function onTableRowClick(rowKey?: string): void {
  const configData: IParamsAppConfig | undefined = model.getState()!.config!;
  const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;
  let focusedStateActive = !!rowKey;
  if (
    configData?.chart.focusedState.active &&
    configData?.chart.focusedState.key === rowKey
  ) {
    focusedStateActive = false;
  }
  chartPanelRef?.current?.setActiveLineAndCircle(
    rowKey || configData?.chart?.focusedState?.key,
    focusedStateActive,
    true,
  );
}

function getChartTitleData(
  processedData: IMetricsCollection<IParam>[],
  configData: any = model.getState()?.config,
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
            acc[groupItemKey.replace('run.params.', '')] = formatValue(
              metricsCollection.config[groupItemKey],
            );
          }
          return acc;
        },
        {},
      );
    }
  });
  return chartTitleData;
}

function processData(data: IRun<IParamTrace>[]): {
  data: IMetricsCollection<IParam>[];
  params: string[];
  metricsColumns: any;
} {
  const configData = model.getState()?.config;
  const grouping = model.getState()?.config?.grouping;
  let runs: IParam[] = [];
  let params: string[] = [];
  const paletteIndex: number = grouping?.paletteIndex || 0;
  const metricsColumns: any = {};

  data?.forEach((run: IRun<IParamTrace>, index) => {
    params = params.concat(getObjectPaths(run.params, run.params));
    run.traces.forEach((trace) => {
      metricsColumns[trace.metric_name] = {
        ...metricsColumns[trace.metric_name],
        [contextToString(trace.context) as string]: '-',
      };
    });
    runs.push({
      run,
      isHidden: configData!.table.hiddenMetrics!.includes(run.hash),
      color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      key: run.hash,
      dasharray: DASH_ARRAYS[0],
    });
  });

  const processedData = groupData(
    _.orderBy(
      runs,
      configData?.table?.sortFields?.map(
        (f: any) =>
          function (run: IParam) {
            return _.get(run, f[0], '');
          },
      ) ?? [],
      configData?.table?.sortFields?.map((f: any) => f[1]) ?? [],
    ),
  );
  const uniqParams = _.uniq(params);

  setTooltipData(processedData, uniqParams);

  return {
    data: processedData,
    params: uniqParams,
    metricsColumns,
  };
}

function getDataAsLines(
  processedData: IMetricsCollection<IParam>[],
  configData: any = model.getState()?.config,
): { dimensions: IDimensionsType; data: any }[] {
  if (!processedData || _.isEmpty(configData.select.params)) {
    return [];
  }
  const dimensionsObject: any = {};
  const lines = processedData.map(
    ({ chartIndex, color, data, dasharray }: IMetricsCollection<IParam>) => {
      if (!dimensionsObject[chartIndex]) {
        dimensionsObject[chartIndex] = {};
      }

      return data
        .filter((run) => !run.isHidden)
        .map((run: IParam) => {
          const values: { [key: string]: string | number | null } = {};
          configData.select.params.forEach(
            ({ type, label, value }: ISelectParamsOption) => {
              const dimension = dimensionsObject[chartIndex];
              if (!dimension[label] && type === 'params') {
                dimension[label] = {
                  values: new Set(),
                  scaleType: 'linear',
                  displayName: label,
                  dimensionType: 'param',
                };
              }
              if (type === 'metrics') {
                run.run.traces.forEach((trace: IParamTrace) => {
                  const formattedContext = `${
                    value?.param_name
                  }-${contextToString(trace.context)}`;
                  if (
                    trace.metric_name === value?.param_name &&
                    _.isEqual(trace.context, value?.context)
                  ) {
                    values[formattedContext] = trace.last_value.last;
                    if (dimension[formattedContext]) {
                      dimension[formattedContext].values.add(
                        trace.last_value.last,
                      );
                      if (typeof trace.last_value.last === 'string') {
                        dimension[formattedContext].scaleType = 'point';
                      }
                    } else {
                      dimension[formattedContext] = {
                        values: new Set().add(trace.last_value.last),
                        scaleType: 'linear',
                        displayName: `${value.param_name} ${contextToString(
                          trace.context,
                        )}`,
                        dimensionType: 'metric',
                      };
                    }
                  }
                });
              } else {
                const paramValue = _.get(run.run.params, label);
                values[label] = formatValue(paramValue, null);
                if (values[label] !== null) {
                  if (typeof values[label] === 'string') {
                    dimension[label].scaleType = 'point';
                  }
                  dimension[label].values.add(values[label]);
                }
              }
            },
          );
          return {
            values,
            color: color ?? run.color,
            dasharray: dasharray ?? run.dasharray,
            chartIndex: chartIndex,
            key: run.key,
          };
        });
    },
  );

  const flattedLines = lines.flat();
  const groupedByChartIndex = Object.values(
    _.groupBy(flattedLines, 'chartIndex'),
  );

  return Object.keys(dimensionsObject)
    .map((keyOfDimension, i) => {
      const dimensions: IDimensionsType = {};
      Object.keys(dimensionsObject[keyOfDimension]).forEach((key: string) => {
        if (dimensionsObject[keyOfDimension][key].scaleType === 'linear') {
          dimensions[key] = {
            scaleType: dimensionsObject[keyOfDimension][key].scaleType,
            domainData: [
              Math.min(...dimensionsObject[keyOfDimension][key].values),
              Math.max(...dimensionsObject[keyOfDimension][key].values),
            ],
            displayName: dimensionsObject[keyOfDimension][key].displayName,
            dimensionType: dimensionsObject[keyOfDimension][key].dimensionType,
          };
        } else {
          dimensions[key] = {
            scaleType: dimensionsObject[keyOfDimension][key].scaleType,
            domainData: [...dimensionsObject[keyOfDimension][key].values],
            displayName: dimensionsObject[keyOfDimension][key].displayName,
            dimensionType: dimensionsObject[keyOfDimension][key].dimensionType,
          };
        }
      });
      return {
        dimensions,
        data: groupedByChartIndex[i],
      };
    })
    .filter((data) => !_.isEmpty(data.data) && !_.isEmpty(data.dimensions));
}

function getGroupConfig(
  metricsCollection: IMetricsCollection<IParam>,
  groupingItems: GroupNameType[] = ['color', 'stroke', 'chart'],
) {
  const configData = model.getState()?.config;
  let groupConfig: { [key: string]: {} } = {};

  for (let groupItemKey of groupingItems) {
    const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
    if (groupItem.length) {
      groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
        Object.assign(acc, {
          [paramKey.replace('run.props', 'run').replace('run.params', 'run')]:
            _.get(metricsCollection.config, paramKey),
        });
        return acc;
      }, {});
    }
  }
  return groupConfig;
}

function setTooltipData(
  processedData: IMetricsCollection<IParam>[],
  paramKeys: string[],
): void {
  const data: { [key: string]: any } = {};

  for (let metricsCollection of processedData) {
    const groupConfig = getGroupConfig(metricsCollection);
    for (let param of metricsCollection.data) {
      data[param.key] = {
        runHash: param.run.hash,
        groupConfig,
        params: paramKeys.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey]: _.get(param, `run.params.${paramKey}`),
          });
          return acc;
        }, {}),
      };
    }
  }

  tooltipData = data;
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

function getFilteredGroupingOptions(
  grouping: IParamsAppConfig['grouping'],
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

function groupData(data: IParam[]): IMetricsCollection<IParam>[] {
  const grouping = model.getState()!.config!.grouping;
  const { paletteIndex } = grouping;
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStroke = getFilteredGroupingOptions(grouping, 'stroke');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
  if (
    groupByColor.length === 0 &&
    groupByStroke.length === 0 &&
    groupByChart.length === 0
  ) {
    return [
      {
        config: null,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data,
      },
    ];
  }

  const groupValues: {
    [key: string]: IMetricsCollection<IParam> | any;
  } = {};

  const groupingFields = _.uniq(
    groupByColor.concat(groupByStroke).concat(groupByChart),
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
  return Object.values(groupValues);
}

function onColorIndicatorChange(): void {
  const configData: IParamsAppConfig = model.getState()?.config;
  if (configData?.chart) {
    const chart = { ...configData.chart };
    chart.isVisibleColorIndicator = !configData.chart.isVisibleColorIndicator;
    updateModelData({ ...configData, chart }, true);
  }
  analytics.trackEvent(
    `[ParamsExplorer][Chart] ${
      configData.chart.isVisibleColorIndicator ? 'Disable' : 'Enable'
    } color indicator`,
  );
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

function onCurveInterpolationChange(): void {
  const configData: IParamsAppConfig = model.getState()?.config;
  if (configData?.chart) {
    const chart = { ...configData.chart };
    chart.curveInterpolation =
      configData.chart.curveInterpolation === CurveEnum.Linear
        ? CurveEnum.MonotoneX
        : CurveEnum.Linear;
    updateModelData({ ...configData, chart }, true);
  }
  analytics.trackEvent(
    `[ParamsExplorer][Chart] Set interpolation mode to "${
      configData.chart.curveInterpolation === CurveEnum.Linear
        ? 'cubic'
        : 'linear'
    }"`,
  );
}

function onActivePointChange(
  activePoint: IActivePoint,
  focusedStateActive: boolean = false,
): void {
  const { refs, config } = model.getState() as any;
  if (config.table.resizeMode !== ResizeModeEnum.Hide) {
    const tableRef: any = refs?.tableRef;
    if (tableRef) {
      tableRef.current?.setHoveredRow?.(activePoint.key);
      tableRef.current?.setActiveRow?.(
        focusedStateActive ? activePoint.key : null,
      );
      if (focusedStateActive) {
        tableRef.current?.scrollToRow?.(activePoint.key);
      }
    }
  }
  let configData: IParamsAppConfig = config;
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
        (activePoint.key !== config.chart.focusedState.key ||
          activePoint.xValue !== config.chart.focusedState.xValue))
    ) {
      updateURL(configData);
    }
  }

  model.setState({
    config: configData,
  });
}

function onParamsSelectChange(data: any[]) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, params: data },
    };

    model.setState({
      config: newConfig,
    });
  }
}

function onSelectRunQueryChange(query: string) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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

function getGroupingSelectOptions(params: string[]): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    group: 'run',
    label: `run.${param}`,
    value: `run.params.${param}`,
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
  ];
}

function onGroupingSelectChange({
  groupName,
  list,
}: IOnGroupingSelectChangeParams) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    updateModelData(configData, true);
  }
  analytics.trackEvent(`[ParamsExplorer] Group by ${groupName}`);
}

function onGroupingModeChange({
  groupName,
  value,
}: IOnGroupingModeChangeParams): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      [groupName]: value,
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[ParamsExplorer] ${
      value ? 'Disable' : 'Enable'
    } grouping by ${groupName} reverse mode`,
  );
}

function onGroupingPaletteChange(index: number): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      paletteIndex: index,
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[ParamsExplorer] Set color palette to "${
      index === 0 ? '8 distinct colors' : '24 colors'
    }"`,
  );
}

function onGroupingReset(groupName: GroupNameType) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
  analytics.trackEvent('[ParamsExplorer] Reset grouping');
}

function updateModelData(
  configData: IParamsAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params, metricsColumns } = processData(
    model.getState()?.rawData as IRun<IParamTrace>[],
  );
  const tableData = getDataAsTableRows(
    data,
    metricsColumns,
    params,
    false,
    configData,
  );
  const tableColumns = getParamsTableColumns(
    metricsColumns,
    params,
    data[0]?.config,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
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
    highPlotData: getDataAsLines(data),
    chartTitleData: getChartTitleData(data),
    groupingSelectOptions: [...getGroupingSelectOptions(params)],
    tableData: tableData.rows,
    tableColumns,
    sameValueColumns: tableData.sameValueColumns,
  });
}

function getDataAsTableRows(
  processedData: IMetricsCollection<any>[],
  metricsColumns: any,
  paramKeys: string[],
  isRawData: boolean,
  config: IParamsAppConfig,
): { rows: IMetricTableRowData[] | any; sameValueColumns: string[] } {
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
        groupByMetricName[`${key}_${metricContext}`] = '-';
      });
      acc = { ...acc, ...groupByMetricName };
      return acc;
    },
    {},
  );
  const rows: IMetricTableRowData[] | any =
    processedData[0]?.config !== null ? {} : [];

  let rowIndex = 0;
  const sameValueColumns: string[] = [];

  processedData.forEach((metricsCollection: IMetricsCollection<IParam>) => {
    const groupKey = metricsCollection.key;
    const columnsValues: { [key: string]: string[] } = {};

    if (metricsCollection.config !== null) {
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
        },
        key: groupKey!,
        groupRowsKeys: metricsCollection.data.map((metric) => metric.key),
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
      metric.run.traces.forEach((trace: any) => {
        metricsRowValues[
          `${trace.metric_name}_${contextToString(trace.context)}`
        ] = formatValue(trace.last_value.last);
      });
      const rowValues: any = {
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
        run: metric.run.props.name ?? '-',
        metric: metric.metric_name,
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
        const value = _.get(metric.run.params, paramKey, '-');
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
          isRawData
            ? rowValues
            : paramsTableRowRenderer(rowValues, {
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
            : paramsTableRowRenderer(rowValues, {
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
      rows[groupKey!].data = paramsTableRowRenderer(
        rows[groupKey!].data,
        {},
        true,
        Object.keys(columnsValues),
      );
    }
  });

  return { rows, sameValueColumns };
}

function onGroupingApplyChange(groupName: GroupNameType): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
    `[ParamsExplorer] ${
      !configData?.grouping.persistence[groupName] ? 'Enable' : 'Disable'
    } ${groupName} persistence`,
  );
}

async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    const data: IAppData | any = await appsService
      .createApp({ state: configData, type: 'params' })
      .call();
    if (data.id) {
      dashboardService
        .createDashboard({ app_id: data.id, name, description })
        .call()
        .then((res: IDashboardData | any) => {
          if (res.id) {
            onNotificationAdd({
              id: Date.now(),
              severity: 'success',
              message: BookmarkNotificationsEnum.CREATE,
            });
          }
        })
        .catch(() => {
          onNotificationAdd({
            id: Date.now(),
            severity: 'error',
            message: BookmarkNotificationsEnum.ERROR,
          });
        });
    }
  }
  analytics.trackEvent('[ParamsExplorer] Create bookmark');
}

function onBookmarkUpdate(id: string) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: 'params' })
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
  analytics.trackEvent('[ParamsExplorer] Update bookmark');
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
  analytics.trackEvent('[ParamsExplorer] Change tooltip content');
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
  const { data, params, config, metricsColumns } = model.getState() as any;
  const tableData = getDataAsTableRows(
    data,
    metricsColumns,
    params,
    true,
    config,
  );
  const tableColumns: ITableColumn[] = getParamsTableColumns(
    metricsColumns,
    params,
    data[0]?.config,
    config.table.columnsOrder!,
    config.table.hiddenColumns!,
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
  saveAs(blob, `params-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
  analytics.trackEvent('[ParamsExplorer] Export runs data to CSV');
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
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData) {
    configData.grouping = {
      ...getConfig().grouping,
    };
    configData.chart = { ...getConfig().chart };
    updateModelData(configData, true);
  }
}

/**
 * function updateURL has 2 major functionalities:
 *    1. Keeps URL in sync with the app config
 *    2. Stores updated URL in localStorage if App is not in the bookmark state
 * @param {IParamsAppConfig} configData - the current state of the app config
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
    setItem('paramsUrl', url);
  }

  window.history.pushState(null, '', url);
}

function onRowHeightChange(height: RowHeightSize) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      rowHeight: height,
    };
    model.setState({
      config: {
        ...configData,
        table,
      },
    });
    setItem('paramsTable', encode(table));
  }
  analytics.trackEvent(
    `[ParamsExplorer][Table] Set table row height to "${RowHeightEnum[
      height
    ].toLowerCase()}"`,
  );
}

function onSortFieldsChange(sortFields: [string, any][]) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const configUpdate = {
      ...configData,
      table: {
        ...configData.table,
        sortFields: sortFields,
      },
    };
    model.setState({
      config: configUpdate,
    });
    updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[ParamsExplorer][Table] ${
      _.isEmpty(sortFields) ? 'Reset' : 'Apply'
    } table sorting by a key`,
  );
}

function onParamVisibilityChange(metricsKeys: string[]) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  const processedData: IMetricsCollection<IParam>[] = model.getState()?.data;
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
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });
    setItem('paramsTable', encode(table));
    updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[ParamsExplorer][Table] ${
      metricsKeys[0] === 'all'
        ? 'Visualize all hidden metrics from table'
        : 'Hide all metrics from table'
    }`,
  );
}

function onColumnsVisibilityChange(hiddenColumns: string[]) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
    setItem('paramsTable', encode(table));
    updateModelData(configUpdate);
  }
  if (hiddenColumns[0] === 'all') {
    analytics.trackEvent('[ParamsExplorer][Table] Hide all table columns');
  } else if (_.isEmpty(hiddenColumns)) {
    analytics.trackEvent('[ParamsExplorer][Table] Show all table columns');
  }
}

function onColumnsOrderChange(columnsOrder: any) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      columnsOrder: columnsOrder,
    };
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });
    setItem('paramsTable', encode(table));
    updateModelData(configUpdate);
  }
  if (
    _.isEmpty(columnsOrder?.left) &&
    _.isEmpty(columnsOrder?.middle) &&
    _.isEmpty(columnsOrder?.right)
  ) {
    analytics.trackEvent('[ParamsExplorer][Table] Reset table columns order');
  }
}

function onTableResizeModeChange(mode: ResizeModeEnum): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
    setItem('paramsTable', encode(table));
    updateModelData(config);
  }
  analytics.trackEvent(
    `[ParamsExplorer][Table] Set table view mode to "${mode}"`,
  );
}

function onTableDiffShow() {
  const sameValueColumns = model.getState()?.sameValueColumns;
  if (sameValueColumns) {
    onColumnsVisibilityChange(sameValueColumns);
  }
  analytics.trackEvent('[ParamsExplorer][Table] Show table columns diff');
}

function onRowVisibilityChange(metricKey: string) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
    model.setState({
      config,
    });
    setItem('paramsTable', encode(table));
    updateModelData(config);
  }
}

function onTableResizeEnd(tableHeight: string) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
    updateModelData(config);
  }
}

// internal function to update config.table.sortFields and cache data
function updateSortFields(sortFields: SortField[]) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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

    setItem('paramsTable', encode(table));
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
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
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
    setItem('paramsTable', encode(table));
    updateModelData(config);
  }
}

function changeLiveUpdateConfig(config: { enabled?: boolean; delay?: number }) {
  const state = model.getState();
  const configData = state?.config;
  const query = configData.select?.query;
  const liveUpdateConfig = configData.liveUpdate;

  if (!liveUpdateConfig?.enabled && config.enabled && query !== '()') {
    liveUpdateInstance = new LiveUpdateService(
      'params',
      updateData,
      config.delay || liveUpdateConfig.delay,
    );
    liveUpdateInstance?.start({
      q: query,
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
    // @ts-ignore
    config: {
      ...configData,
      liveUpdate: newLiveUpdateConfig,
    },
  });

  setItem('paramsLUConfig', encode(newLiveUpdateConfig));
}

function destroy() {
  liveUpdateInstance?.clear();
  liveUpdateInstance = null; //@TODO check is this need or not
}

const paramsAppModel = {
  ...model,
  destroy,
  initialize,
  getParamsData,
  onColorIndicatorChange,
  onCurveInterpolationChange,
  onActivePointChange,
  onParamsSelectChange,
  onSelectRunQueryChange,
  onRowHeightChange,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
  onNotificationAdd,
  onNotificationDelete,
  onChangeTooltip,
  onExportTableData,
  onTableRowHover,
  onTableRowClick,
  setDefaultAppConfigData,
  onSortFieldsChange,
  onParamVisibilityChange,
  onColumnsOrderChange,
  onColumnsVisibilityChange,
  onTableResizeModeChange,
  getAppConfigData,
  onTableDiffShow,
  onTableResizeEnd,
  onSortReset,
  onSortChange,
  updateColumnsWidths,
  updateURL,
  updateModelData,
  changeLiveUpdateConfig,
  onShuffleChange,
};

export default paramsAppModel;
