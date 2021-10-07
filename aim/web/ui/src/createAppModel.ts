import { ChartTypeEnum, CurveEnum, ScaleEnum } from './utils/d3';
import {
  GroupNameType,
  IAggregationConfig,
  IAppData,
  IChartTooltip,
  IChartZoom,
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ITooltipData,
  SortField,
} from './types/services/models/metrics/metricsAppModel';
import createModel from './services/models/model';
import metricsService from './services/api/metrics/metricsService';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from './types/services/models/metrics/runModel';
import { HighlightEnum } from './components/HighlightModesPopover/HighlightModesPopover';
import { ZoomEnum } from './components/ZoomInPopover/ZoomInPopover';
import { SmoothingAlgorithmEnum } from './utils/smoothingData';
import { AlignmentOptions } from './config/alignment/alignmentOptions';
import {
  aggregateGroupData,
  AggregationAreaMethods,
  AggregationLineMethods,
} from './utils/aggregateGroupData';
import { ResizeModeEnum } from './config/enums/tableEnums';
import { RowHeightSize } from './config/table/tableConfigs';
import runsService from './services/api/runs/runsService';
import getStateFromUrl from './utils/getStateFromUrl';
import { getItem, setItem } from './utils/storage';
import { decode, encode } from './utils/encoder/encoder';
import _, { debounce } from 'lodash-es';
import {
  IParam,
  IParamsAppConfig,
  IParamsAppModelState,
} from './types/services/models/params/paramsAppModel';
import getQueryStringFromSelect from './utils/app/getQuertStringFromSelect';
import getRunData from './utils/app/getRunData';
import exceptionHandler from './utils/app/exceptionHandler';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from './utils/encoder/streamEncoding';
import getChartTitleData from './utils/app/getChartTitleData';
import {
  getParamsTableColumns,
  paramsTableRowRenderer,
} from './pages/Params/components/ParamsTableGrid/ParamsTableGrid';
import { IMetric } from './types/services/models/metrics/metricModel';
import getAggregatedData from './utils/app/getAggregatedData';
import {
  getMetricsTableColumns,
  metricsTableRowRenderer,
} from './pages/Metrics/components/MetricsTableGrid/MetricsTableGrid';
import getGroupingSelectOptions from './utils/app/getGroupingSelectOptions';
import { ILine } from './types/components/LineChart/LineChart';
import getSmoothenedData from './utils/getSmoothenedData';
import getObjectPaths from './utils/getObjectPaths';
import filterMetricData from './utils/filterMetricData';
import createMetricModel from './services/models/metrics/metricModel';
import { createRunModel } from './services/models/metrics/runModel';
import COLORS from './config/colors/colors';
import { getFilteredGroupingOptions } from './utils/app/getFilteredGroupingOptions';
import { getGroupingPersistIndex } from './utils/app/getGroupingPersistIndex';
import DASH_ARRAYS from './config/dash-arrays/dashArrays';
import { filterArrayByIndexes } from './utils/filterArrayByIndexes';
import { AlignmentNotificationsEnum } from './config/notification-messages/notificationMessages';
import onNotificationAdd from './utils/app/onNotificationAdd';
import getTooltipData from './utils/app/getTooltipData';
import setAggregationEnabled from './utils/app/setAggregationEnabled';
import getClosestValue from './utils/getClosestValue';
import { formatValue } from './utils/formatValue';
import onRowVisibilityChange from './utils/app/onRowVisibilityChange';
import onTableSortChange from './utils/app/onTableSortChange';
import { IModel } from './types/services/models/model';
import { IActivePoint } from './types/utils/d3/drawHoverAttributes';
import filterTooltipContent from './utils/filterTooltipContent';
import getUrlWithParam from './utils/getUrlWithParam';
import appsService from './services/api/apps/appsService';
import onHighlightModeChange from './utils/app/onHighlightModeChange';
import onZoomChange from './utils/app/onZoomChange';
import onSmoothingChange from './utils/app/onSmoothingChange';
import { IOnSmoothingChange } from './types/pages/metrics/Metrics';
import onIgnoreOutliersChange from './utils/app/onIgnoreOutliersChange';
import onAxesScaleTypeChange from './utils/app/onAxesScaleTypeChange';
import { IAxesScaleState } from './types/components/AxesScalePopover/AxesScalePopover';
import onAggregationConfigChange from './utils/app/onAggregationConfigChange';
import onTableRowHover from './utils/app/onTableRowHover';
import onTableRowClick from './utils/app/onTableRowClick';
import onGroupingSelectChange from './utils/app/onGroupingSelectChange';
import onGroupingModeChange from './utils/app/onGroupingModeChange';
import onGroupingPaletteChange from './utils/app/onGroupingPaletteChange';
import onGroupingReset from './utils/app/onGroupingReset';
import onGroupingApplyChange from './utils/app/onGroupingApplyChange';
import onGroupingPersistenceChange from './utils/app/onGroupingPersistenceChange';
import onBookmarkCreate from './utils/app/onBookmarkCreate';
import onNotificationDelete from './utils/app/onNotificationDelete';
import { INotification } from './types/components/NotificationContainer/NotificationContainer';
import onBookmarkUpdate from './utils/app/onBookmarkUpdate';
import onResetConfigData from './utils/app/onResetConfigData';
import onAlignmentMetricChange from './utils/app/onAlignmentMetricChange';
import onAlignmentTypeChange from './utils/app/onAlignmentTypeChange';
import onMetricsSelectChange from './utils/app/onMetricsSelectChange';
import { ISelectMetricsOption } from './types/pages/metrics/components/SelectForm/SelectForm';
import onSelectRunQueryChange from './utils/app/onSelectRunQueryChange';
import onSelectAdvancedQueryChange from './utils/app/onSelectAdvancedQueryChange';
import toggleSelectAdvancedMode from './utils/app/toggleAdvancedMode';
import onChangeTooltip from './utils/app/onChangeTooltip';
import { ITableColumn } from './types/pages/metrics/components/TableColumns/TableColumns';
import getFilteredRow from './utils/app/getFilteredRow';
import JsonToCSV from './utils/JsonToCSV';
import { saveAs } from 'file-saver';
import moment from 'moment';
import * as analytics from './services/analytics';
import onRowHeightChange from './utils/app/onRowHeightChange';
import onMetricVisibilityChange from './utils/app/onMetricsVisibilityChange';
import onColumnsVisibilityChange from './utils/app/onColumnsVisibilityChange';
import { onTableDiffShow } from './utils/app/onTableDiffShow';
import { IOnTableDiffShowParams } from './types/utils/app/onTableDiffShow';
import onColumnsOrderChange from './utils/app/onColumnsOrderChange';
import onTableResizeModeChange from './utils/app/onTableResizeModeChange';
import { onTableResizeEnd } from './utils/app/onTableResizeEnd';
import updateSortFields from './utils/app/updateTableSortFields';
import updateColumnsWidths from './utils/app/updateColumnsWidths';
import {
  IRunsAppConfig,
  IRunsAppModelState,
} from './types/services/models/runs/runsAppModel';
import contextToString from './utils/contextToString';
import { IDimensionsType } from './types/utils/d3/drawParallelAxes';
import { ISelectParamsOption } from './types/pages/params/components/SelectForm/SelectForm';
import onColorIndicatorChange from './utils/app/onColorIndicatorChange';
import onCurveInterpolationChange from './utils/app/onCurveInterpolationChange';
import React from 'react';
import onSortFieldsChange from './utils/app/onSortFieldsChange';
import onParamVisibilityChange from './utils/app/onParamsVisibilityChange';

enum AppDataTypeEnum {
  RUNS = 'runs',
  METRICS = 'metrics',
  IMAGES = 'images',
}

enum AppNameEnum {
  METRICS = 'metrics',
  PARAMS = 'params',
  RUNS = 'runs',
  IMAGES = 'images',
}

interface IAppInitialConfig {
  dataType: AppDataTypeEnum;
  selectForm: AppNameEnum;
  grouping: boolean;
  appName: AppNameEnum;
  components: {
    table?: boolean;
    charts?: string[];
  };
}

export const appInitialConfig: {
  [key: string]: IAppInitialConfig;
} = {
  METRICS: {
    dataType: AppDataTypeEnum.METRICS,
    selectForm: AppNameEnum.METRICS,
    grouping: true,
    appName: AppNameEnum.METRICS,
    components: { table: true, charts: [ChartTypeEnum.LineChart] },
  },
  PARAMS: {
    dataType: AppDataTypeEnum.RUNS,
    selectForm: AppNameEnum.PARAMS,
    grouping: true,
    appName: AppNameEnum.PARAMS,
    components: { table: true, charts: [ChartTypeEnum.HighPlot] },
  },
  RUNS: {
    dataType: AppDataTypeEnum.RUNS,
    selectForm: AppNameEnum.RUNS,
    grouping: false,
    appName: AppNameEnum.RUNS,
    components: { table: true },
  },
};

type IAppModelState =
  | IMetricAppModelState
  | IParamsAppModelState
  | IRunsAppModelState;

function createAppModel(appInitialConfig: IAppInitialConfig) {
  const model = createModel<IAppModelState>({
    requestIsPending: false,
  });

  let appRequestRef: {
    call: () => Promise<IAppData>;
    abort: () => void;
  };

  function getConfig() {
    const { dataType, grouping, components, selectForm } = appInitialConfig;
    switch (dataType) {
      case AppDataTypeEnum.METRICS: {
        const config: IMetricAppConfig = {};
        if (grouping) {
          config.grouping = {
            color: [],
            stroke: [],
            chart: [],
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
          };
        }
        if (components?.table) {
          config.table = {
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
          };
        }
        if (components?.charts?.[0]) {
          config.chart = {
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
              type: AlignmentOptions.STEP,
            },
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
          };
        }
        if (selectForm === AppNameEnum.METRICS) {
          config.select = {
            metrics: [],
            query: '',
            advancedMode: false,
            advancedQuery: '',
          };
        }
        return config;
      }
      case AppDataTypeEnum.RUNS: {
        const config: IParamsAppConfig & IRunsAppConfig = {};
        if (grouping) {
          config.grouping = {
            color: [],
            stroke: [],
            chart: [],
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
          };
        }
        if (components?.table) {
          config.table = {
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
          };
        }
        if (components?.charts?.[0]) {
          config.chart = {
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
          };
        }
        if (selectForm === AppNameEnum.PARAMS) {
          (config as IParamsAppConfig).select = {
            params: [],
            query: '',
          };
        } else if (selectForm === AppNameEnum.RUNS) {
          (config as IRunsAppConfig).select = {
            metrics: [],
            query: '',
            advancedMode: false,
            advancedQuery: '',
          };
          config.pagination = {
            limit: 45,
            offset: null,
            isLatest: false,
          };
        }
        return config;
      }
    }
  }

  function getAppModelMethods() {
    const { dataType, appName, grouping, components, selectForm } =
      appInitialConfig;

    switch (dataType) {
      case AppDataTypeEnum.METRICS: {
        let metricsRequestRef: {
          call: (
            exceptionHandler: (detail: any) => void,
          ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
          abort: () => void;
        };

        const methods: any = {};
        if (grouping) {
          Object.assign(methods, {
            onGroupingSelectChange({
              groupName,
              list,
            }: IOnGroupingSelectChangeParams) {
              onGroupingSelectChange({ groupName, list }, model);
            },
            onGroupingModeChange({
              groupName,
              value,
            }: IOnGroupingModeChangeParams) {
              onGroupingModeChange({ groupName, value }, model);
            },
            onGroupingPaletteChange(index: number) {
              onGroupingPaletteChange(index, model, appName);
            },
            onGroupingReset(groupName: GroupNameType) {
              onGroupingReset(groupName, model, appName);
            },
            onGroupingApplyChange(groupName: GroupNameType) {
              onGroupingApplyChange(groupName, model);
            },
            onGroupingPersistenceChange(groupName: GroupNameType) {
              onGroupingPersistenceChange(groupName, model, appName);
            },
          });
        }
        if (selectForm) {
          Object.assign(methods, {
            onMetricsSelectChange<M, D>(
              data: D & Partial<ISelectMetricsOption[]>,
            ) {
              onMetricsSelectChange(data, model);
            },
            onSelectRunQueryChange(query: string) {
              onSelectRunQueryChange(query, model);
            },
            onSelectAdvancedQueryChange(query: string) {
              onSelectAdvancedQueryChange(query, model);
            },
            toggleSelectAdvancedMode() {
              toggleSelectAdvancedMode(model, appName);
            },
          });
        }
        if (components?.charts?.[0]) {
          Object.assign(methods, {
            onHighlightModeChange(mode: HighlightEnum) {
              onHighlightModeChange(mode, model, appName);
            },
            onZoomChange(zoom: Partial<IChartZoom>) {
              onZoomChange(zoom, model, appName);
            },
            onSmoothingChange(args: IOnSmoothingChange) {
              onSmoothingChange(args, model, appName);
            },
            onIgnoreOutliersChange(model: IModel<IMetricAppModelState>) {
              onIgnoreOutliersChange(model);
            },
            onAxesScaleTypeChange(args: IAxesScaleState) {
              onAxesScaleTypeChange(args, model, appName);
            },
            onAggregationConfigChange(
              aggregationConfig: Partial<IAggregationConfig>,
            ) {
              onAggregationConfigChange(aggregationConfig, model, appName);
            },
            onAlignmentMetricChange(metric: string) {
              return onAlignmentMetricChange(metric, model);
            },
            onAlignmentTypeChange(type: AlignmentOptions) {
              onAlignmentTypeChange(type, model, appName);
            },
            onChangeTooltip(tooltip: Partial<IChartTooltip>) {
              onChangeTooltip(tooltip, model, appName);
            },
          });
        }
        if (components?.table) {
          Object.assign(methods, {
            onRowHeightChange(height: RowHeightSize) {
              onRowHeightChange(height, model, appName);
            },
            onTableRowHover(rowKey?: string) {
              onTableRowHover({ rowKey, model });
            },
            onTableRowClick(rowKey?: string) {
              onTableRowClick({ rowKey, model });
            },
            onMetricVisibilityChange(metricsKeys: string[]) {
              onMetricVisibilityChange(metricsKeys, model);
            },
            onColumnsVisibilityChange(hiddenColumns: string[]) {
              onColumnsVisibilityChange(hiddenColumns, model, appName);
            },
            onTableDiffShow(args: IOnTableDiffShowParams) {
              onTableDiffShow(args, model, appName);
            },
            onColumnsOrderChange(columnsOrder: any) {
              onColumnsOrderChange(columnsOrder, model);
            },
            onTableResizeModeChange(mode: ResizeModeEnum) {
              onTableResizeModeChange(mode, model, appName);
            },
            onTableResizeEnd(tableHeight: string) {
              onTableResizeEnd(tableHeight, model, appName);
            },
            onSortReset() {
              updateSortFields([], model, appName);
            },
            onSortChange(field: string, value?: 'asc' | 'desc' | 'none') {
              onTableSortChange(field, model, value);
            },
            updateColumnsWidths(key: string, width: number, isReset: boolean) {
              updateColumnsWidths(key, width, isReset, model, appName);
            },
          });
        }

        return {
          ...methods,
          initialize(appId: string): void {
            model.init();
            const state: Partial<IMetricAppModelState> = {};
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
              state.tooltipData = {};
              state.refs = {
                ...state.refs,
                chartPanelRef: { current: null },
              };
            }
            model.setState({ ...state });
            if (!appId) {
              this.setDefaultAppConfigData();
            }
          },
          getAppConfigData(appId: string) {
            if (appRequestRef) {
              appRequestRef.abort();
            }
            appRequestRef = appsService.fetchApp(appId);
            return {
              call: async () => {
                const appData = await appRequestRef.call();
                const configData: IMetricAppConfig = _.merge(
                  getConfig(),
                  appData.state,
                );
                model.setState({ config: configData });
              },
              abort: appRequestRef.abort,
            };
          },
          getMetricsData() {
            if (metricsRequestRef) {
              metricsRequestRef.abort();
            }
            const configData: IMetricAppConfig = model.getState()?.config;
            const metric = configData?.chart?.alignmentConfig?.metric;
            let query = getQueryStringFromSelect(configData?.select);
            metricsRequestRef = metricsService.getMetricsData({
              q: query,
              ...(metric ? { x_axis: metric } : {}),
            });
            return {
              call: async () => {
                if (query === '') {
                  model.setState({
                    requestIsPending: false,
                    queryIsEmpty: true,
                  });
                } else {
                  model.setState({
                    requestIsPending: true,
                    queryIsEmpty: false,
                  });
                  const stream = await metricsRequestRef.call((detail) =>
                    exceptionHandler(detail, model),
                  );
                  const runData = await getRunData(stream);
                  if (configData) {
                    this.setModelData(runData, configData);
                  }
                }
              },
              abort: metricsRequestRef.abort,
            };
          },
          setDefaultAppConfigData() {
            const defaultConfig: IMetricAppConfig = {};
            const config = getConfig() as IMetricAppConfig;
            if (grouping) {
              defaultConfig.grouping =
                getStateFromUrl('grouping') || config?.grouping;
            }
            if (selectForm) {
              defaultConfig.select =
                getStateFromUrl('select') || config?.select;
            }
            if (components.charts) {
              defaultConfig.chart = getStateFromUrl('chart') || config?.chart;
            }
            if (components.table) {
              const tableConfigHash = getItem(`${appName}Table`);
              defaultConfig.table = tableConfigHash
                ? JSON.parse(decode(tableConfigHash))
                : config?.table;
            }
            const configData: IMetricAppConfig = _.merge(config, defaultConfig);
            model.setState({ config: configData });
          },
          processData(data: IRun<IMetricTrace>[]): {
            data: IMetricsCollection<IMetric>[];
            params: string[];
          } {
            const configData = model.getState()?.config;
            let metrics: IMetric[] = [];
            let index: number = -1;
            let params: string[] = [];

            data?.forEach((run: IRun<IMetricTrace>) => {
              params = params.concat(getObjectPaths(run.params, run.params));
              metrics = metrics.concat(
                run.traces.map((trace: IMetricTrace) => {
                  index++;

                  const { values, steps, epochs, timestamps } =
                    filterMetricData({
                      values: [...new Float64Array(trace.values.blob)],
                      steps: [...new Float64Array(trace.iters.blob)],
                      epochs: [...new Float64Array(trace.epochs?.blob)],
                      timestamps: [...new Float64Array(trace.timestamps.blob)],
                      axesScaleType: configData?.chart?.axesScaleType,
                    });

                  let yValues = values;
                  if (
                    configData?.chart?.smoothingAlgorithm &&
                    configData.chart.smoothingFactor
                  ) {
                    yValues = getSmoothenedData({
                      smoothingAlgorithm: configData.chart.smoothingAlgorithm,
                      smoothingFactor: configData.chart.smoothingFactor,
                      data: values,
                    });
                  }
                  const metricKey = encode({
                    runHash: run.hash,
                    metricName: trace.metric_name,
                    traceContext: trace.context,
                  });

                  const paletteIndex = configData?.grouping?.paletteIndex || 0;
                  return createMetricModel({
                    ...trace,
                    run: createRunModel(
                      _.omit(run, 'traces') as IRun<IMetricTrace>,
                    ),
                    key: metricKey,
                    dasharray: '0',
                    color:
                      COLORS[paletteIndex][index % COLORS[paletteIndex].length],
                    isHidden:
                      configData!.table.hiddenMetrics!.includes(metricKey),
                    data: {
                      values,
                      steps,
                      epochs,
                      timestamps,
                      xValues: steps,
                      yValues,
                    },
                  } as IMetric);
                }),
              );
            });

            const processedData = this.groupData(
              _.orderBy(
                metrics,
                configData?.table?.sortFields?.map(
                  (f: SortField) => (metric: IMetric) =>
                    _.get(metric, f[0], ''),
                ) ?? [],
                configData?.table?.sortFields?.map((f: SortField) => f[1]) ??
                  [],
              ),
            );

            const uniqParams = _.uniq(params);

            if (components?.charts?.[0]) {
              model.setState({
                tooltipData: getTooltipData(processedData, uniqParams, model),
              });
            }

            return {
              data: processedData,
              params: uniqParams,
            };
          },
          updateModelData(
            configData: IMetricAppConfig = model.getState()!.config!,
            shouldURLUpdate?: boolean,
          ) {
            const { data, params } = this.processData(
              model.getState()?.rawData as IRun<IMetricTrace>[],
            );
            const tableData = this.getDataAsTableRows(
              data,
              configData?.chart?.focusedState.xValue ?? null,
              params,
              false,
              configData,
            );
            const groupingSelectOptions = [...getGroupingSelectOptions(params)];
            const tableColumns = getMetricsTableColumns(
              params,
              data[0]?.config,
              configData.table?.columnsOrder!,
              configData.table?.hiddenColumns!,
              configData?.chart?.aggregationConfig.methods,
              configData.table?.sortFields,
              this.onSortChange,
            );
            const tableRef: any = model.getState()?.refs?.tableRef;
            tableRef.current?.updateData({
              newData: tableData.rows,
              newColumns: tableColumns,
              hiddenColumns: configData.table?.hiddenColumns!,
            });

            if (shouldURLUpdate) {
              this.updateURL(configData);
            }

            model.setState({
              config: configData,
              data,
              lineChartData: this.getDataAsLines(data),
              chartTitleData: getChartTitleData<IMetric, IMetricAppModelState>(
                data,
                model as IModel<IMetricAppModelState>,
              ),
              aggregatedData: getAggregatedData<IMetricAppModelState>(
                data,
                model as IModel<IMetricAppModelState>,
              ),
              tableData: tableData.rows,
              tableColumns,
              sameValueColumns: tableData.sameValueColumns,
              groupingSelectOptions,
            });
          },
          setModelData(
            rawData: IRun<IMetricTrace>[],
            configData: IMetricAppConfig,
          ) {
            const sortFields = model.getState()?.config?.table.sortFields;
            const { data, params } = this.processData(rawData);
            if (configData) {
              setAggregationEnabled(model, appName);
            }
            const tableData = this.getDataAsTableRows(
              data,
              configData?.chart?.focusedState.xValue ?? null,
              params,
              false,
              configData,
            );
            model.setState({
              requestIsPending: false,
              rawData,
              config: configData,
              params,
              data,
              lineChartData: this.getDataAsLines(data),
              chartTitleData: getChartTitleData<IMetric, IMetricAppModelState>(
                data,
                model as IModel<IMetricAppModelState>,
              ),
              aggregatedData: getAggregatedData<IMetricAppModelState>(
                data,
                model as IModel<IMetricAppModelState>,
              ),
              tableData: tableData.rows,
              tableColumns: getMetricsTableColumns(
                params,
                data[0]?.config,
                configData.table?.columnsOrder!,
                configData.table?.hiddenColumns!,
                configData?.chart?.aggregationConfig.methods,
                sortFields,
                this.onSortChange,
              ),
              sameValueColumns: tableData.sameValueColumns,
              groupingSelectOptions: [...getGroupingSelectOptions(params)],
            });
          },
          updateURL(configData = model.getState()!.config!) {
            const { grouping, chart, select } = configData;
            const url: string = getUrlWithParam(
              ['grouping', 'chart', 'select'],
              [encode(grouping), encode(chart), encode(select)],
            );

            if (
              url === `${window.location.pathname}${window.location.search}`
            ) {
              return;
            }

            const appId: string = window.location.pathname.split('/')[2];
            if (!appId) {
              setItem('metricsUrl', url);
            }

            window.history.pushState(null, '', url);
          },
          alignData(
            data: IMetricsCollection<IMetric>[],
            type: AlignmentOptions = model.getState()!.config?.chart
              ?.alignmentConfig.type!,
          ): IMetricsCollection<IMetric>[] {
            switch (type) {
              case AlignmentOptions.STEP:
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
              case AlignmentOptions.EPOCH:
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
              case AlignmentOptions.RELATIVE_TIME:
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
                                timestamps[timestamp].indexOf(
                                  metric.data.steps[i],
                                )
                              : 0),
                        ),
                      ],
                      yValues: [...metric.data.values],
                    };
                  }
                }
                break;
              case AlignmentOptions.ABSOLUTE_TIME:
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
              case AlignmentOptions.CUSTOM_METRIC:
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
                        metric.data = {
                          ...metric.data,
                          xValues: [...xAxisValues.sort((a, b) => a - b)],
                          yValues: [...metric.data.values],
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
                        metric.data = {
                          epochs,
                          steps,
                          timestamps,
                          values,
                          xValues: [...xAxisValues],
                          yValues: [...yValues],
                        };
                      }
                    } else {
                      missingTraces = true;
                    }
                  }
                }
                if (missingTraces) {
                  let configData = model.getState()?.config;
                  onNotificationAdd(
                    {
                      id: Date.now(),
                      severity: 'error',
                      message: AlignmentNotificationsEnum.NOT_ALL_ALIGNED,
                    },
                    model,
                  );
                  if (configData?.chart) {
                    configData.chart = {
                      ...configData.chart,
                      alignmentConfig: {
                        metric: '',
                        type: AlignmentOptions.STEP,
                      },
                    };
                    model.setState({ config: configData });
                  }
                }
                break;
              default:
                throw new Error('Unknown value for X axis alignment');
            }
            return data;
          },
          groupData(data: IMetric[]): IMetricsCollection<IMetric>[] {
            const configData = model.getState()!.config;
            const grouping = configData!.grouping;
            const { paletteIndex } = grouping;
            const groupByColor = getFilteredGroupingOptions('color', model);
            const groupByStroke = getFilteredGroupingOptions('stroke', model);
            const groupByChart = getFilteredGroupingOptions('chart', model);
            if (
              groupByColor.length === 0 &&
              groupByStroke.length === 0 &&
              groupByChart.length === 0
            ) {
              return this.alignData([
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
                    COLORS[paletteIndex][
                      colorIndex % COLORS[paletteIndex].length
                    ];
                  colorIndex++;
                }
              }

              if (groupByStroke.length > 0) {
                const dasharrayConfig = _.pick(
                  groupValue.config,
                  groupByStroke,
                );
                const dasharrayKey = encode(dasharrayConfig);
                if (grouping.persistence.stroke && grouping.isApplied.stroke) {
                  let index = getGroupingPersistIndex({
                    groupValues,
                    groupKey,
                    grouping,
                  });
                  groupValue.dasharray =
                    DASH_ARRAYS[Number(index % BigInt(DASH_ARRAYS.length))];
                } else if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
                  groupValue.dasharray =
                    DASH_ARRAYS[
                      dasharrayConfigsMap[dasharrayKey] % DASH_ARRAYS.length
                    ];
                } else {
                  dasharrayConfigsMap[dasharrayKey] = dasharrayIndex;
                  groupValue.dasharray =
                    DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
                  dasharrayIndex++;
                }
              }

              if (groupByChart.length > 0) {
                const chartIndexConfig = _.pick(
                  groupValue.config,
                  groupByChart,
                );
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

            const groups = this.alignData(Object.values(groupValues));
            const chartConfig = configData!.chart;

            return aggregateGroupData({
              groupData: groups,
              methods: {
                area: chartConfig.aggregationConfig.methods.area,
                line: chartConfig.aggregationConfig.methods.line,
              },
              scale: chartConfig.axesScaleType,
            });
          },
          getDataAsLines(
            processedData: IMetricsCollection<IMetric>[],
            configData: IMetricAppConfig = model.getState()?.config,
          ): ILine[][] {
            if (!processedData) {
              return [];
            }
            const { smoothingAlgorithm, smoothingFactor } =
              configData?.chart || {};
            const lines = processedData
              .map((metricsCollection: IMetricsCollection<IMetric>) =>
                metricsCollection.data
                  .filter((metric) => !metric.isHidden)
                  .map((metric: IMetric) => {
                    let yValues;
                    if (smoothingAlgorithm && smoothingFactor) {
                      yValues = getSmoothenedData({
                        smoothingAlgorithm,
                        smoothingFactor,
                        data: metric.data.yValues,
                      });
                    } else {
                      yValues = metric.data.yValues;
                    }
                    return {
                      ...metric,
                      groupKey: metricsCollection.key,
                      color: metricsCollection.color ?? metric.color,
                      dasharray: metricsCollection.dasharray ?? metric.color,
                      chartIndex: metricsCollection.chartIndex,
                      selectors: [metric.key, metric.key, metric.run.hash],
                      data: {
                        xValues: metric.data.xValues,
                        yValues,
                      },
                    };
                  }),
              )
              .flat();

            return Object.values(_.groupBy(lines, 'chartIndex'));
          },
          getDataAsTableRows(
            processedData: IMetricsCollection<IMetric>[],
            xValue: number | string | null = null,
            paramKeys: string[],
            isRawData: boolean,
            config: IMetricAppConfig,
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

            processedData.forEach(
              (metricsCollection: IMetricsCollection<IMetric>) => {
                const groupKey = metricsCollection.key;
                const columnsValues: { [key: string]: string[] } = {};

                if (metricsCollection.config !== null) {
                  const groupHeaderRow = {
                    meta: {
                      chartIndex:
                        config?.grouping?.chart?.length! > 0 ||
                        config?.grouping?.reverseMode.chart
                          ? metricsCollection.chartIndex + 1
                          : null,
                      color: metricsCollection.color,
                      dasharray: metricsCollection.dasharray,
                      itemsCount: metricsCollection.data.length,
                    },
                    key: groupKey!,
                    groupRowsKeys: metricsCollection.data.map(
                      (metric) => metric.key,
                    ),
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
                      : getClosestValue(
                          metric.data.xValues as number[],
                          xValue as number,
                        ).index;
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
                    run: metric.run.props.name,
                    metric: metric.metric_name,
                    context: Object.entries(metric.context).map((entry) =>
                      entry.join(':'),
                    ),
                    value:
                      closestIndex === null
                        ? '-'
                        : `${metric.data.values[closestIndex] ?? '-'}`,
                    step:
                      closestIndex === null
                        ? '-'
                        : `${metric.data.steps[closestIndex] ?? '-'}`,
                    epoch:
                      closestIndex === null
                        ? '-'
                        : `${metric.data.epochs[closestIndex] ?? '-'}`,
                    time:
                      closestIndex !== null
                        ? metric.data.timestamps[closestIndex]
                        : null,
                    parentId: groupKey,
                  };
                  rowIndex++;

                  if (
                    metricsCollection.config !== null &&
                    closestIndex !== null
                  ) {
                    rows[groupKey!].data.aggregation = {
                      area: {
                        min: metricsCollection.aggregation!.area.min?.yValues[
                          closestIndex
                        ],
                        max: metricsCollection.aggregation!.area.max?.yValues[
                          closestIndex
                        ],
                      },
                      line: metricsCollection.aggregation!.line?.yValues[
                        closestIndex
                      ],
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
                              onRowVisibilityChange(
                                rowValues.key,
                                model,
                                appName,
                              );
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
                              onRowVisibilityChange(
                                rowValues.key,
                                model,
                                appName,
                              );
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
                  rows[groupKey!].data = metricsTableRowRenderer(
                    rows[groupKey!].data,
                    {},
                    true,
                    ['value'].concat(Object.keys(columnsValues)),
                  );
                }
              },
            );

            return { rows, sameValueColumns };
          },
          onExportTableData() {
            const { data, params, config } =
              model.getState() as IMetricAppModelState;

            const tableData = this.getDataAsTableRows(
              data,
              config?.chart?.focusedState.xValue ?? null,
              params,
              true,
              config,
            );
            const tableColumns: ITableColumn[] = getMetricsTableColumns(
              params,
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
                    (groupedRowKey: string) =>
                      tableData.rows[groupedRowKey].items,
                  )
                : [tableData.rows];

            const dataToExport: { [key: string]: string }[] = [];

            groupedRows.forEach(
              (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
                groupedRow.forEach((row: IMetricTableRowData) => {
                  const filteredRow = getFilteredRow<IMetricTableRowData>(
                    filteredHeader,
                    row,
                  );
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
            saveAs(
              blob,
              `${appName}-${moment().format('HH:mm:ss · D MMM, YY')}.csv`,
            );
            analytics.trackEvent(`[${appName}] Export runs data to CSV`);
          },
          onActivePointChange(
            activePoint: IActivePoint,
            focusedStateActive: boolean = false,
          ): void {
            const { data, params, refs, config } =
              model.getState() as IMetricAppModelState;
            const tableRef: any = refs?.tableRef;
            let tableData = null;
            if (config?.table?.resizeMode !== ResizeModeEnum.Hide) {
              tableData = this.getDataAsTableRows(
                data,
                activePoint.xValue,
                params,
                false,
                config,
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
                      model.getState().tooltipData[activePoint.key],
                      configData?.chart.tooltip.selectedParams,
                    ),
                  },
                },
              };

              if (
                config?.chart?.focusedState.active !== focusedStateActive ||
                (config?.chart?.focusedState.active &&
                  activePoint.key !== config.chart.focusedState.key)
              ) {
                this.updateURL(configData);
              }
            }
            model.setState({ config: configData });
          },
          onBookmarkCreate({ name, description }: any) {
            return onBookmarkCreate({ name, description }, model, appName);
          },
          onBookmarkUpdate(id: string) {
            onBookmarkUpdate(id, model, appName);
          },
          onNotificationDelete(id: number) {
            onNotificationDelete(id, model);
          },
          onNotificationAdd<M, N>(notification: N & INotification) {
            onNotificationAdd(notification, model);
          },
          onResetConfigData() {
            onResetConfigData(model);
          },
        };
      }
      case AppDataTypeEnum.RUNS: {
        let runsRequestRef: {
          call: (
            exceptionHandler: (detail: any) => void,
          ) => Promise<ReadableStream<IRun<IParamTrace>[]>>;
          abort: () => void;
        };

        const methods: any = {};

        if (appName === AppNameEnum.PARAMS) {
          if (grouping) {
            Object.assign(methods, {
              onGroupingSelectChange({
                groupName,
                list,
              }: IOnGroupingSelectChangeParams) {
                onGroupingSelectChange({ groupName, list }, model);
              },
              onGroupingModeChange({
                groupName,
                value,
              }: IOnGroupingModeChangeParams) {
                onGroupingModeChange({ groupName, value }, model);
              },
              onGroupingPaletteChange(index: number) {
                onGroupingPaletteChange(index, model, appName);
              },
              onGroupingReset(groupName: GroupNameType) {
                onGroupingReset(groupName, model, appName);
              },
              onGroupingApplyChange(groupName: GroupNameType) {
                onGroupingApplyChange(groupName, model);
              },
              onGroupingPersistenceChange(groupName: GroupNameType) {
                onGroupingPersistenceChange(groupName, model, appName);
              },
            });
          }
          if (selectForm) {
            Object.assign(methods, {
              onParamsSelectChange(data: any[]) {
                const configData: IParamsAppConfig = model.getState()?.config;
                if (configData?.select) {
                  const newConfig = {
                    ...configData,
                    select: { ...configData.select, params: data },
                  };

                  // TODO need to fix for all separated functions
                  // this.updateURL(newConfig);

                  model.setState({ config: newConfig });
                }
              },
              onSelectRunQueryChange(query: string) {
                onSelectRunQueryChange(query, model);
              },
            });
          }
          if (components?.charts?.[0]) {
            Object.assign(methods, {
              onChangeTooltip(tooltip: Partial<IChartTooltip>) {
                onChangeTooltip(tooltip, model, appName);
              },
              onColorIndicatorChange() {
                onColorIndicatorChange(model, appName);
              },
              onCurveInterpolationChange() {
                onCurveInterpolationChange(model, appName);
              },
            });
          }
          if (components?.table) {
            Object.assign(methods, {
              onRowHeightChange(height: RowHeightSize) {
                onRowHeightChange(height, model, appName);
              },
              onTableRowHover(rowKey?: string) {
                onTableRowHover({ rowKey, model });
              },
              onTableRowClick(rowKey?: string) {
                onTableRowClick({ rowKey, model });
              },
              onSortReset() {
                updateSortFields([], model, appName);
              },
              onSortChange(field: string, value?: 'asc' | 'desc' | 'none') {
                onTableSortChange(field, model, value);
              },
              onSortFieldsChange(sortFields: [string, any][]) {
                onSortFieldsChange(sortFields, model, appName);
              },
              onParamVisibilityChange(metricsKeys: string[]) {
                onParamVisibilityChange(metricsKeys, model);
              },
              onColumnsOrderChange(columnsOrder: any) {
                onColumnsOrderChange(columnsOrder, model);
              },
              onColumnsVisibilityChange(hiddenColumns: string[]) {
                onColumnsVisibilityChange(hiddenColumns, model, appName);
              },
              onTableResizeModeChange(mode: ResizeModeEnum) {
                onTableResizeModeChange(mode, model, appName);
              },
              onTableDiffShow(args: IOnTableDiffShowParams) {
                onTableDiffShow(args, model, appName);
              },
              onTableResizeEnd(tableHeight: string) {
                onTableResizeEnd(tableHeight, model, appName);
              },
              updateColumnsWidths(
                key: string,
                width: number,
                isReset: boolean,
              ) {
                updateColumnsWidths(key, width, isReset, model, appName);
              },
            });
          }

          return {
            ...methods,
            initialize(appId: string): void {
              model.init();
              const state: Partial<IParamsAppModelState> = {};
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
                state.tooltipData = {};
                state.refs = {
                  ...state.refs,
                  chartPanelRef: { current: null },
                };
              }
              model.setState({ ...state });
              if (!appId) {
                this.setDefaultAppConfigData();
              }
            },
            setDefaultAppConfigData() {
              const defaultConfig: IParamsAppConfig = {};
              const config = getConfig();
              if (grouping) {
                defaultConfig.grouping =
                  getStateFromUrl('grouping') || config?.grouping;
              }
              if (selectForm) {
                defaultConfig.select =
                  getStateFromUrl('select') || config?.select;
              }
              if (components.charts) {
                defaultConfig.chart = getStateFromUrl('chart') || config?.chart;
              }
              if (components.table) {
                const tableConfigHash = getItem(`${appName}Table`);
                defaultConfig.table = tableConfigHash
                  ? JSON.parse(decode(tableConfigHash))
                  : config?.table;
              }
              const configData: IParamsAppConfig | IRunsAppConfig = _.merge(
                config,
                defaultConfig,
              );
              model.setState({ config: configData });
            },
            getAppConfigData(appId: string) {
              if (appRequestRef) {
                appRequestRef.abort();
              }
              appRequestRef = appsService.fetchApp(appId);
              return {
                call: async () => {
                  const appData = await appRequestRef.call();
                  const configData: IParamsAppConfig = _.merge(
                    getConfig(),
                    appData.state,
                  );
                  model.setState({ config: configData });
                },
                abort: appRequestRef.abort,
              };
            },
            getParamsData() {
              if (runsRequestRef) {
                runsRequestRef.abort();
              }
              const configData: IParamsAppConfig = model.getState()?.config;
              runsRequestRef = runsService.getRunsData(
                configData?.select?.query,
              );
              return {
                call: async () => {
                  if (_.isEmpty(configData?.select?.params)) {
                    model.setState({
                      // highPlotData: [],
                      // tableData: [],
                      // isParamsLoading: false,
                      requestIsPending: false,
                      queryIsEmpty: true,
                    });
                  } else {
                    model.setState({
                      // isParamsLoading: true,
                      requestIsPending: true,
                      queryIsEmpty: false,
                    });
                    const stream = await runsRequestRef.call((detail) =>
                      exceptionHandler(detail, model),
                    );
                    const runData = await getRunData(stream);
                    if (configData) {
                      this.setModelData(runData, configData);
                    }
                  }
                },
                abort: () => runsRequestRef.abort(),
              };
            },
            getDataAsTableRows(
              processedData: IMetricsCollection<IParam>[],
              metricsColumns: any,
              paramKeys: string[],
              isRawData: boolean,
              config: IParamsAppConfig,
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
              const initialMetricsRowData = Object.keys(metricsColumns).reduce(
                (acc: any, key: string) => {
                  const groupByMetricName: any = {};
                  Object.keys(metricsColumns[key]).forEach(
                    (metricContext: string) => {
                      groupByMetricName[`${key}_${metricContext}`] = '-';
                    },
                  );
                  acc = { ...acc, ...groupByMetricName };
                  return acc;
                },
                {},
              );
              const rows: IMetricTableRowData[] | any =
                processedData[0]?.config !== null ? {} : [];

              let rowIndex = 0;
              const sameValueColumns: string[] = [];

              processedData.forEach(
                (metricsCollection: IMetricsCollection<IParam>) => {
                  const groupKey = metricsCollection.key;
                  const columnsValues: { [key: string]: string[] } = {};

                  if (metricsCollection.config !== null) {
                    const groupHeaderRow = {
                      meta: {
                        chartIndex:
                          config.grouping?.chart.length! > 0 ||
                          config.grouping?.reverseMode.chart
                            ? metricsCollection.chartIndex + 1
                            : null,
                        color: metricsCollection.color,
                        dasharray: metricsCollection.dasharray,
                        itemsCount: metricsCollection.data.length,
                      },
                      key: groupKey!,
                      groupRowsKeys: metricsCollection.data.map(
                        (metric) => metric.key,
                      ),
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
                    metric.run.traces.map((trace: any) => {
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
                      dasharray:
                        metricsCollection.dasharray ?? metric.dasharray,
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
                                onRowVisibilityChange(
                                  rowValues.key,
                                  model,
                                  appName,
                                );
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
                                onRowVisibilityChange(
                                  rowValues.key,
                                  model,
                                  appName,
                                );
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
                },
              );

              return { rows, sameValueColumns };
            },
            getDataAsLines(
              processedData: IMetricsCollection<IParam>[],
              configData: IParamsAppConfig = model.getState()?.config,
            ): { dimensions: IDimensionsType; data: any }[] {
              if (
                !processedData ||
                (configData?.select?.params &&
                  _.isEmpty(configData.select.params))
              ) {
                return [];
              }
              const dimensionsObject: any = {};
              const lines = processedData.map(
                ({
                  chartIndex,
                  color,
                  data,
                  dasharray,
                }: IMetricsCollection<IParam>) => {
                  if (!dimensionsObject[chartIndex]) {
                    dimensionsObject[chartIndex] = {};
                  }

                  return data
                    .filter((run) => !run.isHidden)
                    .map((run: IParam) => {
                      const values: { [key: string]: string | number | null } =
                        {};
                      configData.select!.params.forEach(
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
                                values[formattedContext] =
                                  trace.last_value.last;
                                if (dimension[formattedContext]) {
                                  dimension[formattedContext].values.add(
                                    trace.last_value.last,
                                  );
                                  if (
                                    typeof trace.last_value.last === 'string'
                                  ) {
                                    dimension[formattedContext].scaleType =
                                      'point';
                                  }
                                } else {
                                  dimension[formattedContext] = {
                                    values: new Set().add(
                                      trace.last_value.last,
                                    ),
                                    scaleType: 'linear',
                                    displayName: `${
                                      value.param_name
                                    } ${contextToString(trace.context)}`,
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

              return Object.keys(dimensionsObject).map((keyOfDimension, i) => {
                const dimensions: IDimensionsType = {};
                Object.keys(dimensionsObject[keyOfDimension]).forEach(
                  (key: string) => {
                    if (
                      dimensionsObject[keyOfDimension][key].scaleType ===
                      'linear'
                    ) {
                      dimensions[key] = {
                        scaleType:
                          dimensionsObject[keyOfDimension][key].scaleType,
                        domainData: [
                          Math.min(
                            ...dimensionsObject[keyOfDimension][key].values,
                          ),
                          Math.max(
                            ...dimensionsObject[keyOfDimension][key].values,
                          ),
                        ],
                        displayName:
                          dimensionsObject[keyOfDimension][key].displayName,
                        dimensionType:
                          dimensionsObject[keyOfDimension][key].dimensionType,
                      };
                    } else {
                      dimensions[key] = {
                        scaleType:
                          dimensionsObject[keyOfDimension][key].scaleType,
                        domainData: [
                          ...dimensionsObject[keyOfDimension][key].values,
                        ],
                        displayName:
                          dimensionsObject[keyOfDimension][key].displayName,
                        dimensionType:
                          dimensionsObject[keyOfDimension][key].dimensionType,
                      };
                    }
                  },
                );
                return {
                  dimensions,
                  data: groupedByChartIndex[i],
                };
              });
            },
            setModelData(
              rawData: IRun<IParamTrace>[],
              configData: IParamsAppConfig,
            ) {
              const { data, params, metricsColumns } =
                this.processData(rawData);

              if (configData?.grouping) {
                configData.grouping.selectOptions = [
                  ...getGroupingSelectOptions(params),
                ];
              }

              const tableData = this.getDataAsTableRows(
                data,
                metricsColumns,
                params,
                false,
                configData,
              );
              const sortFields = model.getState()?.config?.table.sortFields;

              model.setState({
                requestIsPending: false,
                data,
                highPlotData: this.getDataAsLines(data),
                chartTitleData: getChartTitleData<IParam, IParamsAppModelState>(
                  data,
                  model as IModel<IParamsAppModelState>,
                ),
                params,
                metricsColumns,
                rawData,
                config: configData,
                tableData: tableData.rows,
                tableColumns: getParamsTableColumns(
                  metricsColumns,
                  params,
                  data[0]?.config,
                  configData.table?.columnsOrder!,
                  configData.table?.hiddenColumns!,
                  sortFields,
                  this.onSortChange,
                ),
                sameValueColumns: tableData.sameValueColumns,
                groupingSelectOptions: [...getGroupingSelectOptions(params)],
              });
            },
            groupData(data: IParam[]): IMetricsCollection<IParam>[] {
              const grouping = model.getState()!.config!.grouping;
              const { paletteIndex } = grouping;
              const groupByColor = getFilteredGroupingOptions('color', model);
              const groupByStroke = getFilteredGroupingOptions('stroke', model);
              const groupByChart = getFilteredGroupingOptions('chart', model);
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
                      COLORS[paletteIndex][
                        colorIndex % COLORS[paletteIndex].length
                      ];
                    colorIndex++;
                  }
                }

                if (groupByStroke.length > 0) {
                  const dasharrayConfig = _.pick(
                    groupValue.config,
                    groupByStroke,
                  );
                  const dasharrayKey = encode(dasharrayConfig);
                  if (
                    grouping.persistence.stroke &&
                    grouping.isApplied.stroke
                  ) {
                    let index = getGroupingPersistIndex({
                      groupValues,
                      groupKey,
                      grouping,
                    });
                    groupValue.dasharray =
                      DASH_ARRAYS[Number(index % BigInt(DASH_ARRAYS.length))];
                  } else if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
                    groupValue.dasharray =
                      DASH_ARRAYS[
                        dasharrayConfigsMap[dasharrayKey] % DASH_ARRAYS.length
                      ];
                  } else {
                    dasharrayConfigsMap[dasharrayKey] = dasharrayIndex;
                    groupValue.dasharray =
                      DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
                    dasharrayIndex++;
                  }
                }

                if (groupByChart.length > 0) {
                  const chartIndexConfig = _.pick(
                    groupValue.config,
                    groupByChart,
                  );
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
            },
            processData(data: IRun<IParamTrace>[]): {
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

              data.forEach((run: IRun<IParamTrace>, index) => {
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
                  color:
                    COLORS[paletteIndex][index % COLORS[paletteIndex].length],
                  key: run.hash,
                  dasharray: DASH_ARRAYS[0],
                });
              });

              const processedData = this.groupData(
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

              if (components?.charts?.[0]) {
                model.setState({
                  tooltipData: getTooltipData(processedData, uniqParams, model),
                });
              }
              return {
                data: processedData,
                params: uniqParams,
                metricsColumns,
              };
            },
            updateURL(configData = model.getState()!.config!) {
              const { grouping, chart, select } = configData;
              const url: string = getUrlWithParam(
                ['grouping', 'chart', 'select'],
                [encode(grouping), encode(chart), encode(select)],
              );

              if (
                url === `${window.location.pathname}${window.location.search}`
              ) {
                return;
              }

              const appId: string = window.location.pathname.split('/')[2];
              if (!appId) {
                setItem('paramsUrl', url);
              }

              window.history.pushState(null, '', url);
            },
            onActivePointChange(
              activePoint: IActivePoint,
              focusedStateActive: boolean = false,
            ): void {
              const { refs, config } = model.getState() as IParamsAppModelState;
              if (config.table?.resizeMode !== ResizeModeEnum.Hide) {
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
                        model.getState().tooltipData[activePoint.key],
                        configData?.chart.tooltip.selectedParams,
                      ),
                    },
                  },
                };

                if (
                  config.chart?.focusedState.active !== focusedStateActive ||
                  (config.chart.focusedState.active &&
                    (activePoint.key !== config.chart.focusedState.key ||
                      activePoint.xValue !== config.chart.focusedState.xValue))
                ) {
                  this.updateURL(configData);
                }
              }

              model.setState({
                config: configData,
              });
            },
            onExportTableData(): void {
              const { data, params, config, metricsColumns } =
                model.getState() as any;
              const tableData = this.getDataAsTableRows(
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
                config.table?.columnsOrder!,
                config.table?.hiddenColumns!,
              );
              const excludedFields: string[] = ['#', 'actions'];
              const filteredHeader: string[] = tableColumns.reduce(
                (acc: string[], column: ITableColumn) =>
                  acc.concat(
                    excludedFields.indexOf(column.key) === -1 &&
                      !column.isHidden
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
                      (groupedRowKey: string) =>
                        tableData.rows[groupedRowKey].items,
                    )
                  : [tableData.rows];

              const dataToExport: { [key: string]: string }[] = [];

              groupedRows.forEach(
                (
                  groupedRow: IMetricTableRowData[],
                  groupedRowIndex: number,
                ) => {
                  groupedRow.forEach((row: IMetricTableRowData) => {
                    const filteredRow = getFilteredRow<IMetricTableRowData>(
                      filteredHeader,
                      row,
                    );
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
              saveAs(
                blob,
                `params-${moment().format('HH:mm:ss · D MMM, YY')}.csv`,
              );
              analytics.trackEvent('[ParamsExplorer] Export runs data to CSV');
            },
            updateModelData(
              configData: IParamsAppConfig = model.getState()!.config!,
              shouldURLUpdate?: boolean,
            ): void {
              const { data, params, metricsColumns } = this.processData(
                model.getState()?.rawData as IRun<IParamTrace>[],
              );
              const tableData = this.getDataAsTableRows(
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
                configData.table?.columnsOrder!,
                configData.table?.hiddenColumns!,
                configData.table?.sortFields,
                this.onSortChange,
              );
              const tableRef: any = model.getState()?.refs?.tableRef;
              tableRef.current?.updateData({
                newData: tableData.rows,
                newColumns: tableColumns,
                hiddenColumns: configData.table?.hiddenColumns!,
              });

              if (shouldURLUpdate) {
                this.updateURL(configData);
              }

              model.setState({
                config: configData,
                data,
                highPlotData: this.getDataAsLines(data),
                chartTitleData: getChartTitleData<IParam, IParamsAppModelState>(
                  data,
                  model as IModel<IParamsAppModelState>,
                ),
                groupingSelectOptions: [...getGroupingSelectOptions(params)],
                tableData: tableData.rows,
                tableColumns,
                sameValueColumns: tableData.sameValueColumns,
              });
            },
            onBookmarkCreate({ name, description }: any) {
              return onBookmarkCreate({ name, description }, model, appName);
            },
            onBookmarkUpdate(id: string) {
              onBookmarkUpdate(id, model, appName);
            },
            onNotificationDelete(id: number) {
              onNotificationDelete(id, model);
            },
            onNotificationAdd<M, N>(notification: N & INotification) {
              onNotificationAdd(notification, model);
            },
            onResetConfigData() {
              onResetConfigData(model);
            },
          };
        } else if (appName === AppNameEnum.RUNS) {
          if (grouping) {
            Object.assign(methods, {});
          }
          if (selectForm) {
            Object.assign(methods, {});
          }
          if (components?.charts?.[0]) {
            Object.assign(methods, {});
          }
          if (components?.table) {
          }

          return {
            ...methods,
          };
        }
      }
    }
  }

  return {
    ...model,
    ...getAppModelMethods(),
  };
}

export default createAppModel;

// const methods = {
//   runs: {
//     table: {},
//     chart: {},
//   },
// };
//
// return {
//   ...methods[dataType][component],
// };
