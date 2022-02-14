import moment from 'moment';
import { saveAs } from 'file-saver';
import _ from 'lodash-es';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { RowHeightSize } from 'config/table/tableConfigs';
import { DensityOptions } from 'config/enums/densityEnum';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import {
  getMetricsTableColumns,
  metricsTableRowRenderer,
} from 'pages/Metrics/components/MetricsTableGrid/MetricsTableGrid';

import * as analytics from 'services/analytics';
import metricsService from 'services/api/metrics/metricsService';
import runsService from 'services/api/runs/runsService';
import createMetricModel from 'services/models/metrics/metricModel';
import { createRunModel } from 'services/models/metrics/runModel';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { ILine } from 'types/components/LineChart/LineChart';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IMetric } from 'types/services/models/metrics/metricModel';
import {
  GroupNameType,
  IAggregationConfig,
  IChartZoom,
  IGroupingSelectOption,
  IMetricAppModelState,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IPanelTooltip,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import {
  IMetricTrace,
  IRun,
  ISequence,
} from 'types/services/models/metrics/runModel';
import { IModel } from 'types/services/models/model';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import {
  IAppModelConfig,
  IAppModelState,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';

import { aggregateGroupData } from 'utils/aggregateGroupData';
import exceptionHandler from 'utils/app/exceptionHandler';
import getAggregatedData from 'utils/app/getAggregatedData';
import getChartTitleData from 'utils/app/getChartTitleData';
import { getFilteredGroupingOptions } from 'utils/app/getFilteredGroupingOptions';
import getFilteredRow from 'utils/app/getFilteredRow';
import { getGroupingPersistIndex } from 'utils/app/getGroupingPersistIndex';
import getGroupingSelectOptions from 'utils/app/getGroupingSelectOptions';
import getQueryStringFromSelect from 'utils/app/getQueryStringFromSelect';
import getRunData from 'utils/app/getRunData';
import getTooltipData from 'utils/app/getTooltipData';
import onAggregationConfigChange from 'utils/app/onAggregationConfigChange';
import onAlignmentMetricChange from 'utils/app/onAlignmentMetricChange';
import onAlignmentTypeChange from 'utils/app/onAlignmentTypeChange';
import onAxesScaleTypeChange from 'utils/app/onAxesScaleTypeChange';
import onChangeTooltip from 'utils/app/onChangeTooltip';
import onColumnsOrderChange from 'utils/app/onColumnsOrderChange';
import onColumnsVisibilityChange from 'utils/app/onColumnsVisibilityChange';
import onGroupingApplyChange from 'utils/app/onGroupingApplyChange';
import onGroupingModeChange from 'utils/app/onGroupingModeChange';
import onGroupingPaletteChange from 'utils/app/onGroupingPaletteChange';
import onGroupingPersistenceChange from 'utils/app/onGroupingPersistenceChange';
import onGroupingReset from 'utils/app/onGroupingReset';
import onGroupingSelectChange from 'utils/app/onGroupingSelectChange';
import onHighlightModeChange from 'utils/app/onHighlightModeChange';
import onIgnoreOutliersChange from 'utils/app/onIgnoreOutliersChange';
import onSelectOptionsChange from 'utils/app/onSelectOptionsChange';
import onMetricVisibilityChange from 'utils/app/onMetricsVisibilityChange';
import onRowHeightChange from 'utils/app/onRowHeightChange';
import onRowVisibilityChange from 'utils/app/onRowVisibilityChange';
import onSelectAdvancedQueryChange from 'utils/app/onSelectAdvancedQueryChange';
import onSelectRunQueryChange from 'utils/app/onSelectRunQueryChange';
import onSmoothingChange from 'utils/app/onSmoothingChange';
import { onTableDiffShow } from 'utils/app/onTableDiffShow';
import { onTableResizeEnd } from 'utils/app/onTableResizeEnd';
import onTableResizeModeChange from 'utils/app/onTableResizeModeChange';
import onTableRowClick from 'utils/app/onTableRowClick';
import onTableRowHover from 'utils/app/onTableRowHover';
import onTableSortChange from 'utils/app/onTableSortChange';
import onZoomChange from 'utils/app/onZoomChange';
import setAggregationEnabled from 'utils/app/setAggregationEnabled';
import toggleSelectAdvancedMode from 'utils/app/toggleSelectAdvancedMode';
import updateColumnsWidths from 'utils/app/updateColumnsWidths';
import updateSortFields from 'utils/app/updateTableSortFields';
import contextToString from 'utils/contextToString';
import { AlignmentOptionsEnum, ChartTypeEnum } from 'utils/d3';
import { filterArrayByIndexes } from 'utils/filterArrayByIndexes';
import filterMetricData from 'utils/filterMetricData';
import filterTooltipContent from 'utils/filterTooltipContent';
import { formatValue } from 'utils/formatValue';
import getClosestValue from 'utils/getClosestValue';
import getObjectPaths from 'utils/getObjectPaths';
import getSmoothenedData from 'utils/getSmoothenedData';
import JsonToCSV from 'utils/JsonToCSV';
import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';
import onBookmarkCreate from 'utils/app/onBookmarkCreate';
import onBookmarkUpdate from 'utils/app/onBookmarkUpdate';
import onNotificationDelete from 'utils/app/onNotificationDelete';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import onResetConfigData from 'utils/app/onResetConfigData';
import onShuffleChange from 'utils/app/onShuffleChange';
import setComponentRefs from 'utils/app/setComponentRefs';
import updateURL from 'utils/app/updateURL';
import onDensityTypeChange from 'utils/app/onDensityTypeChange';
import getValueByField from 'utils/getValueByField';
import sortDependingArrays from 'utils/app/sortDependingArrays';
import { getValue } from 'utils/helper';
import onRowSelect from 'utils/app/onRowSelect';
import { SortField } from 'utils/getSortedFields';

export default function getMetricsModelMethods({
  appName,
  model,
  grouping,
  components,
  selectForm,
  setModelDefaultAppConfigData,
  getModelAppConfigData,
  getConfig,
}: any) {
  let metricsRequestRef: {
    call: (
      exceptionHandler: (detail: any) => void,
    ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
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
  let tooltipData: ITooltipData = {};
  let liveUpdateInstance: LiveUpdateService | null;

  function initialize(appId: string): void {
    model.init();
    const state: Partial<IAppModelState> = {};
    if (grouping) {
      state.groupingSelectOptions = [];
    }
    if (components?.table) {
      state.refs = {
        ...state.refs,
        tableRef: { current: null },
      };
    }
    if (components?.charts?.[0]) {
      tooltipData = {};
      state.refs = {
        ...state.refs,
        chartPanelRef: { current: null },
      };
    }
    model.setState({ ...state });
    if (!appId) {
      setModelDefaultAppConfigData();
    }

    const liveUpdateState = model.getState()?.config?.liveUpdate;

    if (liveUpdateState?.enabled) {
      liveUpdateInstance = new LiveUpdateService(
        appName,
        updateData,
        liveUpdateState.delay,
      );
    }
  }

  function updateData(newData: ISequence<IMetricTrace>[]): void {
    const configData = model.getState()?.config;
    if (configData) {
      setModelData(newData, configData);
    }
  }

  function abortRequest(): void {
    if (metricsRequestRef) {
      metricsRequestRef.abort();
    }

    model.setState({
      requestIsPending: false,
    });

    onModelNotificationAdd({
      id: Date.now(),
      severity: 'info',
      message: 'Request has been cancelled',
    });
  }

  function getMetricsData(
    shouldUrlUpdate?: boolean,
    shouldResetSelectedRows?: boolean,
  ): {
    call: () => Promise<void>;
    abort: () => void;
  } {
    if (metricsRequestRef) {
      metricsRequestRef.abort();
    }
    const configData = model.getState()?.config;
    if (shouldUrlUpdate) {
      updateURL({ configData, appName });
    }
    const metric = configData?.chart?.alignmentConfig?.metric;
    let query = getQueryStringFromSelect(configData?.select);
    metricsRequestRef = metricsService.getMetricsData({
      q: query,
      p: configData?.chart?.densityType,
      ...(metric ? { x_axis: metric } : {}),
    });
    return {
      call: async () => {
        if (query === '()') {
          let state: Partial<IMetricAppModelState> = {};
          if (
            Array.isArray(components?.charts) &&
            components?.charts?.indexOf(ChartTypeEnum.LineChart) !== -1
          ) {
            state.lineChartData = [];
          }
          if (components.table) {
            state.tableData = [];
            state.config = {
              ...configData,
              table: {
                ...configData?.table,
                resizeMode: ResizeModeEnum.Resizable,
              },
            };
          }
          model.setState({
            requestIsPending: false,
            queryIsEmpty: true,
            selectedRows: shouldResetSelectedRows
              ? {}
              : model.getState()?.selectedRows,
            ...state,
          });
        } else {
          model.setState({
            requestIsPending: true,
            queryIsEmpty: false,
            selectedRows: shouldResetSelectedRows
              ? {}
              : model.getState()?.selectedRows,
          });
          liveUpdateInstance?.stop().then();
          try {
            const stream = await metricsRequestRef.call((detail) =>
              exceptionHandler({ detail, model }),
            );
            const runData = await getRunData(stream);
            updateData(runData);
          } catch (ex: Error | any) {
            if (ex.name === 'AbortError') {
              // Abort Error
            } else {
              console.log('Unhandled error: ', ex);
            }
          }

          liveUpdateInstance?.start({
            q: query,
            p: configData?.chart?.densityType,
            ...(metric && { x_axis: metric }),
          });
        }
      },
      abort: metricsRequestRef.abort,
    };
  }

  function getDataAsTableRows(
    processedData: IMetricsCollection<IMetric>[],
    xValue: number | string | null = null,
    paramKeys: string[],
    isRowData: boolean,
    config: IAppModelConfig,
    groupingSelectOptions: IGroupingSelectOption[],
    dynamicUpdate?: boolean,
  ): {
    rows: IMetricTableRowData[] | any;
    sameValueColumns: string[];
  } {
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
              config?.grouping?.chart?.length ||
              config?.grouping?.reverseMode?.chart
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
          groups: groupConfigData,
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
          selectKey: `${metric.run.hash}/${metric.key}`,
          runHash: metric.run.hash,
          isHidden: metric.isHidden,
          index: rowIndex,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.dasharray,
          experiment: metric.run.props?.experiment?.name ?? 'default',
          run: moment(metric.run.props.creation_time * 1000).format(
            'HH:mm:ss · D MMM, YY',
          ),
          metric: metric.name,
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
              min: metricsCollection.aggregation!.area.min?.yValues[
                closestIndex
              ],
              max: metricsCollection.aggregation!.area.max?.yValues[
                closestIndex
              ],
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
            isRowData
              ? rowValues
              : metricsTableRowRenderer(rowValues, {
                  toggleVisibility: (e) => {
                    e.stopPropagation();
                    onRowVisibilityChange({
                      metricKey: rowValues.key,
                      model,
                      appName,
                      updateModelData,
                    });
                  },
                }),
          );
        } else {
          rows.push(
            isRowData
              ? rowValues
              : metricsTableRowRenderer(rowValues, {
                  toggleVisibility: (e) => {
                    e.stopPropagation();
                    onRowVisibilityChange({
                      metricKey: rowValues.key,
                      model,
                      appName,
                      updateModelData,
                    });
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
      if (metricsCollection.config !== null && !isRowData) {
        rows[groupKey!].data = metricsTableRowRenderer(
          rows[groupKey!].data,
          {},
          true,
          ['value', 'groups'].concat(Object.keys(columnsValues)),
        );
      }
    });
    return { rows, sameValueColumns };
  }

  function processData(data: ISequence<IMetricTrace>[]): {
    data: IMetricsCollection<IMetric>[];
    params: string[];
    highLevelParams: string[];
    contexts: string[];
    selectedRows: any;
  } {
    const configData = model.getState()?.config;
    let selectedRows = model.getState()?.selectedRows;
    let metrics: IMetric[] = [];
    let index: number = -1;
    let params: string[] = [];
    let highLevelParams: string[] = [];
    let contexts: string[] = [];
    const paletteIndex: number = configData?.grouping?.paletteIndex || 0;

    data?.forEach((run: ISequence<IMetricTrace>) => {
      params = params.concat(getObjectPaths(run.params, run.params));
      highLevelParams = highLevelParams.concat(
        getObjectPaths(run.params, run.params, '', false, true),
      );
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
            configData?.chart?.smoothingAlgorithm &&
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
            metricName: trace.name,
            traceContext: trace.context,
          });
          return createMetricModel({
            ...trace,
            run: createRunModel(_.omit(run, 'traces') as IRun<IMetricTrace>),
            key: metricKey,
            dasharray: '0',
            color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
            isHidden: configData?.table?.hiddenMetrics!.includes(metricKey),
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
            function (metric: IMetric) {
              return getValue(metric, f.value, '');
            },
        ),
        sortFields?.map((f: SortField) => f.order),
      ),
    );
    const uniqParams = _.uniq(params);
    const uniqHighLevelParams = _.uniq(highLevelParams);
    const uniqContexts = _.uniq(contexts);

    const mappedData =
      data?.reduce((acc: any, item: any) => {
        acc[item.hash] = { runHash: item.hash, ...item.props };
        return acc;
      }, {}) || {};
    if (selectedRows && !_.isEmpty(selectedRows)) {
      selectedRows = Object.keys(selectedRows).reduce(
        (acc: any, key: string) => {
          const slicedKey = key.slice(0, key.indexOf('/'));
          acc[key] = {
            selectKey: key,
            ...mappedData[slicedKey],
          };
          return acc;
        },
        {},
      );
    }

    return {
      data: processedData,
      params: uniqParams,
      highLevelParams: uniqHighLevelParams,
      contexts: uniqContexts,
      selectedRows,
    };
  }

  function updateModelData(
    configData = model.getState()!.config!,
    shouldURLUpdate?: boolean,
  ): void {
    const { data, params, highLevelParams, contexts, selectedRows } =
      processData(model.getState()?.rawData as ISequence<IMetricTrace>[]);
    const sortedParams = params.concat(highLevelParams).sort();
    const groupingSelectOptions = [
      ...getGroupingSelectOptions({
        params: sortedParams,
        contexts,
        sequenceName: 'metric',
      }),
    ];
    tooltipData = getTooltipData({
      processedData: data,
      paramKeys: sortedParams,
      groupingSelectOptions,
      groupingItems: ['color', 'stroke', 'chart'],
      model,
    });
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
      groupingSelectOptions,
      data[0]?.config,
      configData.table?.columnsOrder!,
      configData.table?.hiddenColumns!,
      configData.chart?.aggregationConfig.methods,
      configData.table?.sortFields,
      onSortChange,
      configData.grouping as any,
      onModelGroupingSelectChange,
    );
    const tableRef: any = model.getState()?.refs?.tableRef;
    tableRef.current?.updateData({
      newData: tableData.rows,
      newColumns: tableColumns,
      hiddenColumns: configData.table?.hiddenColumns!,
    });

    if (shouldURLUpdate) {
      updateURL({ configData, appName });
    }

    model.setState({
      config: configData,
      data,
      lineChartData: getDataAsLines(data),
      chartTitleData: getChartTitleData<IMetric, Partial<IMetricAppModelState>>(
        {
          processedData: data,
          groupingSelectOptions,
          model: model as IModel<Partial<IMetricAppModelState>>,
        },
      ),
      aggregatedData: getAggregatedData<Partial<IMetricAppModelState>>({
        processedData: data,
        model: model as IModel<Partial<IMetricAppModelState>>,
      }),
      tableData: tableData.rows,
      tableColumns,
      sameValueColumns: tableData.sameValueColumns,
      groupingSelectOptions,
      selectedRows,
    });
  }

  function setModelData(
    rawData: ISequence<IMetricTrace>[],
    configData: IAppModelConfig,
  ): void {
    const sortFields = model.getState()?.config?.table?.sortFields;
    const { data, params, highLevelParams, contexts, selectedRows } =
      processData(rawData);
    if (configData) {
      setAggregationEnabled({ model, appName });
    }
    const sortedParams = params.concat(highLevelParams).sort();
    const groupingSelectOptions = [
      ...getGroupingSelectOptions({
        params: sortedParams,
        contexts,
        sequenceName: 'metric',
      }),
    ];
    tooltipData = getTooltipData({
      processedData: data,
      paramKeys: sortedParams,
      groupingSelectOptions,
      groupingItems: ['color', 'stroke', 'chart'],
      model,
    });
    const tableData = getDataAsTableRows(
      data,
      configData?.chart?.focusedState?.xValue ?? null,
      params,
      false,
      configData,
      groupingSelectOptions,
    );

    const tableColumns = getMetricsTableColumns(
      params,
      groupingSelectOptions,
      data[0]?.config,
      configData.table?.columnsOrder!,
      configData.table?.hiddenColumns!,
      configData?.chart?.aggregationConfig?.methods,
      sortFields,
      onSortChange,
      configData.grouping as any,
      onModelGroupingSelectChange,
    );
    if (!model.getState()?.requestIsPending) {
      model.getState()?.refs?.tableRef?.current?.updateData({
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
      chartTitleData: getChartTitleData<IMetric, Partial<IMetricAppModelState>>(
        {
          processedData: data,
          groupingSelectOptions,
          model: model as IModel<IMetricAppModelState>,
        },
      ),
      aggregatedData: getAggregatedData<Partial<IMetricAppModelState>>({
        processedData: data,
        model: model as IModel<IMetricAppModelState>,
      }),
      tableData: tableData.rows,
      tableColumns: tableColumns,
      sameValueColumns: tableData.sameValueColumns,
      groupingSelectOptions,
      selectedRows,
    });
  }

  function alignData(
    data: IMetricsCollection<IMetric>[],
    type: AlignmentOptionsEnum = model.getState()!.config!.chart
      ?.alignmentConfig.type!,
  ): IMetricsCollection<IMetric>[] {
    switch (type) {
      case AlignmentOptionsEnum.STEP:
        for (let i = 0; i < data.length; i++) {
          const metricCollection = data[i];
          for (let j = 0; j < metricCollection.data.length; j++) {
            const metric = metricCollection.data[j];
            metric.data = {
              ...metric.data,
              xValues: [...metric.data.steps],
              yValues: [...metric.data.values],
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

            metric.data = {
              ...metric.data,
              xValues: [
                ...metric.data.epochs.map(
                  (epoch, i) =>
                    epoch +
                    (epochs[epoch].length > 1
                      ? (0.99 / epochs[epoch].length) *
                        epochs[epoch].indexOf(metric.data.steps[i])
                      : 0),
                ),
              ],
              yValues: [...metric.data.values],
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

            metric.data = {
              ...metric.data,
              xValues: [
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
              yValues: [...metric.data.values],
            };
          }
        }
        break;
      case AlignmentOptionsEnum.ABSOLUTE_TIME:
        for (let i = 0; i < data.length; i++) {
          const metricCollection = data[i];
          for (let j = 0; j < metricCollection.data.length; j++) {
            const metric = metricCollection.data[j];

            metric.data = {
              ...metric.data,
              xValues: [...metric.data.timestamps],
              yValues: [...metric.data.values],
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
                const { sortedXValues, sortedArrays } = sortDependingArrays(
                  [...xAxisValues],
                  {
                    yValues: [...metric.data.values],
                    epochs: [...metric.data.epochs],
                    steps: [...metric.data.steps],
                    timestamps: [...metric.data.timestamps],
                    values: [...metric.data.values],
                  },
                );

                metric.data = {
                  ...metric.data,
                  ...sortedArrays,
                  xValues: sortedXValues,
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

                const { sortedXValues, sortedArrays } = sortDependingArrays(
                  [...xAxisValues],
                  {
                    yValues: [...yValues],
                    epochs: [...epochs],
                    steps: [...steps],
                    timestamps: [...timestamps],
                    values: [...values],
                  },
                );

                metric.data = {
                  ...metric.data,
                  ...sortedArrays,
                  xValues: sortedXValues,
                };
              }
            } else {
              missingTraces = true;
            }
          }
        }
        if (missingTraces) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'error',
              message: AlignmentNotificationsEnum.NOT_ALL_ALIGNED,
            },
            model,
          });
        }
        break;
      default:
        throw new Error('Unknown value for X axis alignment');
    }
    return data;
  }

  function groupData(data: IMetric[]): IMetricsCollection<IMetric>[] {
    const configData = model.getState()!.config;
    const grouping = configData!.grouping;
    const { paletteIndex = 0 } = grouping || {};
    const groupByColor = getFilteredGroupingOptions({
      groupName: 'color',
      model,
    });
    const groupByStroke = getFilteredGroupingOptions({
      groupName: 'stroke',
      model,
    });
    const groupByChart = getFilteredGroupingOptions({
      groupName: 'chart',
      model,
    });
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
        groupValue[field] = getValue(data[i], field);
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

        if (grouping?.persistence.color && grouping.isApplied.color) {
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
        if (grouping?.persistence.stroke && grouping.isApplied.stroke) {
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
          groupValue.dasharray =
            DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
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
        area: chartConfig!.aggregationConfig.methods.area,
        line: chartConfig!.aggregationConfig.methods.line,
      },
      scale: chartConfig!.axesScaleType,
    });
  }

  function onSearchQueryCopy(): void {
    const selectedMetricsData = model.getState()?.config?.select;
    let query = getQueryStringFromSelect(selectedMetricsData);
    navigator.clipboard.writeText(query);
    onModelNotificationAdd({
      id: Date.now(),
      severity: 'success',
      message: 'Run Expression Copied',
    });
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

  function onExportTableData(): void {
    const { data, params, config, groupingSelectOptions } = model.getState();

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
      groupingSelectOptions,
      data[0]?.config,
      config?.table?.columnsOrder!,
      config?.table?.hiddenColumns!,
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
        groupedRow?.forEach((row: IMetricTableRowData) => {
          const filteredRow = getFilteredRow<IMetricTableRowData>({
            columnKeys: filteredHeader,
            row,
          });
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
    saveAs(blob, `${appName}-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
    analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
  }

  const onActivePointChange = _.debounce(
    (activePoint: IActivePoint, focusedStateActive: boolean = false): void => {
      const { data, params, refs, config, groupingSelectOptions } =
        model.getState();
      if (!!config) {
        const tableRef: any = refs?.tableRef;
        let tableData = null;
        if (config.table?.resizeMode !== ResizeModeEnum.Hide) {
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

            if (focusedStateActive) {
              tableRef.current?.scrollToRow?.(activePoint.key);
              tableRef.current?.setActiveRow?.(
                focusedStateActive ? activePoint.key : null,
              );
            } else {
              tableRef.current?.setHoveredRow?.(activePoint.key);
            }
          }
        }
        let configData: IAppModelConfig = config;
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
                  configData.chart.tooltip?.selectedParams,
                ),
              } as IPanelTooltip,
            },
          };
          if (
            config.chart?.focusedState.active !== focusedStateActive ||
            (config.chart.focusedState.active &&
              activePoint.key !== config.chart.focusedState.key)
          ) {
            updateURL({ configData, appName });
          }
        }

        model.setState({ config: configData });
      }
    },
    50,
  );

  function onModelGroupingSelectChange({
    groupName,
    list,
  }: IOnGroupingSelectChangeParams): void {
    onGroupingSelectChange({
      groupName,
      list,
      model,
      appName,
      updateModelData,
      setAggregationEnabled,
    });
  }

  function onModelBookmarkCreate({
    name,
    description,
  }: {
    name: string;
    description: string;
  }): Promise<void> {
    return onBookmarkCreate({ name, description, model, appName });
  }

  function onModelBookmarkUpdate(id: string): void {
    onBookmarkUpdate({ id, model, appName });
  }

  function onModelNotificationDelete(id: number): void {
    onNotificationDelete({ id, model });
  }

  function onModelNotificationAdd<N>(notification: N & INotification): void {
    onNotificationAdd({ notification, model });
  }

  function onModelResetConfigData(): void {
    onResetConfigData({ model, getConfig, updateModelData });
  }

  function onSortChange({
    sortFields,
    order,
    index,
    actionType,
    field,
  }: any): void {
    onTableSortChange({
      field,
      sortFields,
      order,
      index,
      actionType,
      model,
      appName,
      updateModelData,
    });
  }

  function setModelComponentRefs(refElement: object): void {
    setComponentRefs({ refElement, model });
  }

  function changeLiveUpdateConfig(config: {
    enabled?: boolean;
    delay?: number;
  }): void {
    const state = model.getState();
    const configData = state?.config;
    const liveUpdateConfig = configData?.liveUpdate;
    const metric = configData?.chart?.alignmentConfig?.metric;
    let query = getQueryStringFromSelect(configData?.select);

    if (!liveUpdateConfig?.enabled && config.enabled && query !== '()') {
      liveUpdateInstance = new LiveUpdateService(
        appName,
        updateData,
        config.delay || liveUpdateConfig?.delay,
      );
      liveUpdateInstance?.start({
        p: configData?.chart?.densityType,
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
        liveUpdate: newLiveUpdateConfig,
      },
    });
    setItem('metricsLUConfig', encode(newLiveUpdateConfig));
    analytics.trackEvent(
      // @ts-ignore
      `${ANALYTICS_EVENT_KEYS[appName].liveUpdate} ${
        config.enabled ? 'on' : 'off'
      }`,
    );
  }

  function destroy(): void {
    liveUpdateInstance?.clear();
    liveUpdateInstance = null; //@TODO check is this need or not
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
              getMetricsData(false, true).call();
              onNotificationAdd({
                notification: {
                  id: Date.now(),
                  severity: 'success',
                  message: `Runs are successfully ${
                    archived ? 'archived' : 'unarchived'
                  } `,
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
                message: ex.message,
              },
              model,
            });
          }
        } finally {
          analytics.trackEvent(
            ANALYTICS_EVENT_KEYS[appName].table.archiveRunsBatch,
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
              getMetricsData(false, true).call();
              onNotificationAdd({
                notification: {
                  id: Date.now(),
                  severity: 'success',
                  message: 'Runs are successfully deleted',
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
                message: ex.message,
              },
              model,
            });
          }
        } finally {
          analytics.trackEvent(
            ANALYTICS_EVENT_KEYS[appName].table.deleteRunsBatch,
          );
        }
      },
      abort: runsDeleteRef.abort,
    };
  }

  const methods = {
    initialize,
    getAppConfigData: getModelAppConfigData,
    getMetricsData,
    abortRequest,
    getDataAsTableRows,
    setDefaultAppConfigData: setModelDefaultAppConfigData,
    setComponentRefs: setModelComponentRefs,
    updateModelData,
    onActivePointChange,
    onExportTableData,
    onBookmarkCreate: onModelBookmarkCreate,
    onBookmarkUpdate: onModelBookmarkUpdate,
    onNotificationAdd: onModelNotificationAdd,
    onNotificationDelete: onModelNotificationDelete,
    onResetConfigData: onModelResetConfigData,
    onSortChange,
    onSearchQueryCopy,
    changeLiveUpdateConfig,
    destroy,
    deleteRuns,
    archiveRuns,
  };

  if (grouping) {
    Object.assign(methods, {
      onGroupingSelectChange: onModelGroupingSelectChange,
      onGroupingModeChange({
        groupName,
        value,
      }: IOnGroupingModeChangeParams): void {
        onGroupingModeChange({
          groupName,
          value,
          model,
          appName,
          updateModelData,
          setAggregationEnabled,
        });
      },
      onGroupingPaletteChange(index: number): void {
        onGroupingPaletteChange({
          index,
          model,
          appName,
          updateModelData,
          setAggregationEnabled,
        });
      },
      onGroupingReset(groupName: GroupNameType): void {
        onGroupingReset({
          groupName,
          model,
          appName,
          updateModelData,
          setAggregationEnabled,
        });
      },
      onGroupingApplyChange(groupName: GroupNameType): void {
        onGroupingApplyChange({
          groupName,
          model,
          appName,
          updateModelData,
          setAggregationEnabled,
        });
      },
      onGroupingPersistenceChange(groupName: GroupNameType): void {
        onGroupingPersistenceChange({
          groupName,
          model,
          appName,
          updateModelData,
          setAggregationEnabled,
        });
      },
      onShuffleChange(name: 'color' | 'stroke'): void {
        onShuffleChange({ name, model, updateModelData });
      },
    });
  }
  if (selectForm) {
    Object.assign(methods, {
      onMetricsSelectChange<D>(data: D & Partial<ISelectOption[]>): void {
        onSelectOptionsChange({ data, model });
      },
      onSelectRunQueryChange(query: string): void {
        onSelectRunQueryChange({ query, model });
      },
      onSelectAdvancedQueryChange(query: string): void {
        onSelectAdvancedQueryChange({ query, model });
      },
      toggleSelectAdvancedMode(): void {
        toggleSelectAdvancedMode({ model, appName });
      },
    });
  }
  if (components?.charts?.[0]) {
    Object.assign(methods, {
      onHighlightModeChange(mode: HighlightEnum): void {
        onHighlightModeChange({ mode, model, appName });
      },
      onZoomChange(zoom: Partial<IChartZoom>): void {
        onZoomChange({
          zoom,
          model,
          appName,
        });
      },
      onSmoothingChange(args: IOnSmoothingChange): void {
        onSmoothingChange({ args, model, appName, updateModelData });
      },
      onIgnoreOutliersChange(): void {
        onIgnoreOutliersChange({ model, updateModelData });
      },
      onAxesScaleTypeChange(args: IAxesScaleState): void {
        onAxesScaleTypeChange({ args, model, appName, updateModelData });
      },
      onAggregationConfigChange(
        aggregationConfig: Partial<IAggregationConfig>,
      ): void {
        onAggregationConfigChange({
          aggregationConfig,
          model,
          appName,
          updateModelData,
        });
      },
      onAlignmentMetricChange(metric: string): Promise<void> {
        return onAlignmentMetricChange({
          metric,
          model,
          appName,
          updateModelData,
          setModelData,
        });
      },
      onAlignmentTypeChange(type: AlignmentOptionsEnum): void {
        onAlignmentTypeChange({ type, model, appName, updateModelData });
      },
      onChangeTooltip(tooltip: Partial<IPanelTooltip>): void {
        onChangeTooltip({ tooltip, tooltipData, model, appName });
      },
      onDensityTypeChange(type: DensityOptions): Promise<void> {
        return onDensityTypeChange({ type, model, appName, getMetricsData });
      },
    });
  }
  if (components?.table) {
    Object.assign(methods, {
      onRowHeightChange(height: RowHeightSize): void {
        onRowHeightChange({ height, model, appName });
      },
      onTableRowHover(rowKey?: string): void {
        onTableRowHover({ rowKey, model });
      },
      onTableRowClick(rowKey?: string): void {
        onTableRowClick({ rowKey, model });
      },
      onMetricVisibilityChange(metricsKeys: string[]): void {
        onMetricVisibilityChange({
          metricsKeys,
          model,
          appName,
          updateModelData,
        });
      },
      onColumnsVisibilityChange(hiddenColumns: string[]): void {
        onColumnsVisibilityChange({
          hiddenColumns,
          model,
          appName,
          updateModelData,
        });
      },
      onTableDiffShow(): void {
        onTableDiffShow({ model, appName, updateModelData });
      },
      onColumnsOrderChange(columnsOrder: any): void {
        onColumnsOrderChange({
          columnsOrder,
          model,
          appName,
          updateModelData,
        });
      },
      onTableResizeModeChange(mode: ResizeModeEnum): void {
        onTableResizeModeChange({ mode, model, appName });
      },
      onTableResizeEnd(tableHeight: string): void {
        onTableResizeEnd({ tableHeight, model, appName });
      },
      onSortReset(): void {
        updateSortFields({ sortFields: [], model, appName, updateModelData });
      },
      updateColumnsWidths(key: string, width: number, isReset: boolean): void {
        updateColumnsWidths({
          key,
          width,
          isReset,
          model,
          appName,
          updateModelData,
        });
      },
      onRowSelect({
        actionType,
        data,
      }: {
        actionType: 'single' | 'selectAll' | 'removeAll';
        data?: any;
      }): void {
        return onRowSelect({ actionType, data, model });
      },
    });
  }

  return methods;
}
