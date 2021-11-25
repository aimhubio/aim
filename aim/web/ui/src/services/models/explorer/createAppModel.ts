import _ from 'lodash';
import moment from 'moment';
import { saveAs } from 'file-saver';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { RowHeightSize } from 'config/table/tableConfigs';
import { DensityOptions } from 'config/enums/densityEnum';

import {
  metricsTableRowRenderer,
  getMetricsTableColumns,
} from 'pages/Metrics/components/MetricsTableGrid/MetricsTableGrid';
import {
  paramsTableRowRenderer,
  getParamsTableColumns,
} from 'pages/Params/components/ParamsTableGrid/ParamsTableGrid';
import {
  getRunsTableColumns,
  runsTableRowRenderer,
} from 'pages/Runs/components/RunsTableGrid/RunsTableGrid';

import * as analytics from 'services/analytics';
import appsService from 'services/api/apps/appsService';
import metricsService from 'services/api/metrics/metricsService';
import runsService from 'services/api/runs/runsService';
import createMetricModel from 'services/models/metrics/metricModel';
import { createRunModel } from 'services/models/metrics/runModel';
import createModel from 'services/models/model';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { ILine } from 'types/components/LineChart/LineChart';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { ISelectParamsOption } from 'types/pages/params/components/SelectForm/SelectForm';
import { IMetric } from 'types/services/models/metrics/metricModel';
import {
  IMetricAppModelState,
  IAppData,
  IMetricAppConfig,
  IMetricsCollection,
  IMetricTableRowData,
  SortField,
  IOnGroupingSelectChangeParams,
  IOnGroupingModeChangeParams,
  GroupNameType,
  IChartZoom,
  IAggregationConfig,
  IPanelTooltip,
  ITooltipData,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import {
  IRun,
  IMetricTrace,
  IParamTrace,
  ISequence,
} from 'types/services/models/metrics/runModel';
import { IModel } from 'types/services/models/model';
import {
  IParamsAppModelState,
  IParamsAppConfig,
  IParam,
} from 'types/services/models/params/paramsAppModel';
import {
  IRunsAppModelState,
  IRunsAppConfig,
} from 'types/services/models/runs/runsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IDimensionsType } from 'types/utils/d3/drawParallelAxes';
import {
  IAppInitialConfig,
  IAppModelConfig,
  IAppModelState,
} from 'types/services/models/explorer/createAppModel';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
  aggregateGroupData,
} from 'utils/aggregateGroupData';
import exceptionHandler from 'utils/app/exceptionHandler';
import getAggregatedData from 'utils/app/getAggregatedData';
import getChartTitleData from 'utils/app/getChartTitleData';
import { getFilteredGroupingOptions } from 'utils/app/getFilteredGroupingOptions';
import getFilteredRow from 'utils/app/getFilteredRow';
import { getGroupingPersistIndex } from 'utils/app/getGroupingPersistIndex';
import getGroupingSelectOptions from 'utils/app/getGroupingSelectOptions';
import getQueryStringFromSelect from 'utils/app/getQuertStringFromSelect';
import getRunData from 'utils/app/getRunData';
import getTooltipData from 'utils/app/getTooltipData';
import onAggregationConfigChange from 'utils/app/onAggregationConfigChange';
import onAlignmentMetricChange from 'utils/app/onAlignmentMetricChange';
import onAlignmentTypeChange from 'utils/app/onAlignmentTypeChange';
import onAxesScaleTypeChange from 'utils/app/onAxesScaleTypeChange';
import onChangeTooltip from 'utils/app/onChangeTooltip';
import onColorIndicatorChange from 'utils/app/onColorIndicatorChange';
import onColumnsOrderChange from 'utils/app/onColumnsOrderChange';
import onColumnsVisibilityChange from 'utils/app/onColumnsVisibilityChange';
import onCurveInterpolationChange from 'utils/app/onCurveInterpolationChange';
import onGroupingApplyChange from 'utils/app/onGroupingApplyChange';
import onGroupingModeChange from 'utils/app/onGroupingModeChange';
import onGroupingPaletteChange from 'utils/app/onGroupingPaletteChange';
import onGroupingPersistenceChange from 'utils/app/onGroupingPersistenceChange';
import onGroupingReset from 'utils/app/onGroupingReset';
import onGroupingSelectChange from 'utils/app/onGroupingSelectChange';
import onHighlightModeChange from 'utils/app/onHighlightModeChange';
import onIgnoreOutliersChange from 'utils/app/onIgnoreOutliersChange';
import onMetricsSelectChange from 'utils/app/onMetricsSelectChange';
import onMetricVisibilityChange from 'utils/app/onMetricsVisibilityChange';
import onParamVisibilityChange from 'utils/app/onParamsVisibilityChange';
import onRowHeightChange from 'utils/app/onRowHeightChange';
import onRowVisibilityChange from 'utils/app/onRowVisibilityChange';
import onSelectAdvancedQueryChange from 'utils/app/onSelectAdvancedQueryChange';
import onSelectRunQueryChange from 'utils/app/onSelectRunQueryChange';
import onSmoothingChange from 'utils/app/onSmoothingChange';
import onSortFieldsChange from 'utils/app/onSortFieldsChange';
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
import {
  ChartTypeEnum,
  ScaleEnum,
  CurveEnum,
  AlignmentOptionsEnum,
} from 'utils/d3';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { filterArrayByIndexes } from 'utils/filterArrayByIndexes';
import filterMetricData from 'utils/filterMetricData';
import filterTooltipContent from 'utils/filterTooltipContent';
import { formatValue } from 'utils/formatValue';
import getClosestValue from 'utils/getClosestValue';
import getObjectPaths from 'utils/getObjectPaths';
import getSmoothenedData from 'utils/getSmoothenedData';
import getStateFromUrl from 'utils/getStateFromUrl';
import JsonToCSV from 'utils/JsonToCSV';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { getItem, setItem } from 'utils/storage';
import { decode, encode } from 'utils/encoder/encoder';
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
import { isSystemMetric } from 'utils/isSystemMetric';

import { AppDataTypeEnum, AppNameEnum } from './index';

/**
 * function createAppModel has 2 major functionalities:
 *    1. getConfig() function which depends on appInitialConfig returns corresponding config state
 *    2. getAppModelMethods() function which depends on appInitialConfig returns corresponding methods
 * @appInitialConfig {IAppInitialConfig}
 * {
    dataType: AppDataTypeEnum.METRICS,
    selectForm: AppNameEnum.METRICS,
    grouping: true,
    appName: AppNameEnum.METRICS,
    components: { table: true, charts: [ChartTypeEnum.LineChart] },
   }, - the config which describe app model
 */

function createAppModel({
  appName,
  dataType,
  grouping,
  components,
  selectForm,
}: IAppInitialConfig) {
  const model = createModel<IAppModelState>({
    requestIsPending: false,
    config: getConfig(),
  });

  let appRequestRef: {
    call: () => Promise<IAppData>;
    abort: () => void;
  };

  function getConfig(): IAppModelConfig {
    switch (dataType) {
      case AppDataTypeEnum.METRICS: {
        const config: IMetricAppConfig = {
          liveUpdate: {
            delay: 2000,
            enabled: false,
          },
        };
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
      default:
        return {};
    }
  }

  function getMetricsAppModelMethods() {
    let metricsRequestRef: {
      call: (
        exceptionHandler: (detail: any) => void,
      ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
      abort: () => void;
    };
    let tooltipData: ITooltipData = {};
    let liveUpdateInstance: LiveUpdateService | null;

    function initialize(appId: string): void {
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
        tooltipData = {};
        state.refs = {
          ...state.refs,
          chartPanelRef: { current: null },
        };
      }
      model.setState({ ...state });
      if (!appId) {
        setDefaultAppConfigData();
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

    function getMetricsData(shouldUrlUpdate?: boolean): {
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
              ...state,
            });
          } else {
            model.setState({
              requestIsPending: true,
              queryIsEmpty: false,
            });
            liveUpdateInstance?.stop().then();
            try {
              const stream = await metricsRequestRef.call((detail) =>
                exceptionHandler({ detail, model }),
              );
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

    function getAppConfigData(appId: string): {
      call: () => Promise<void>;
      abort: () => void;
    } {
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
    }

    function getDataAsTableRows(
      processedData: IMetricsCollection<IMetric>[],
      xValue: number | string | null = null,
      paramKeys: string[],
      isRowData: boolean,
      config: IMetricAppConfig,
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

      processedData.forEach(
        (metricsCollection: IMetricsCollection<IMetric>) => {
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
                  config?.grouping?.chart.length ||
                  config?.grouping?.reverseMode.chart
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
                closestIndex !== null
                  ? metric.data.timestamps[closestIndex]
                  : null,
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
              ['value'].concat(Object.keys(columnsValues)),
            );
          }
        },
      );

      return { rows, sameValueColumns };
    }

    function setDefaultAppConfigData(): void {
      const config = getConfig() as IMetricAppConfig;

      const liveUpdateConfigHash = getItem('metricsLUConfig');
      const luConfig = liveUpdateConfigHash
        ? JSON.parse(decode(liveUpdateConfigHash))
        : config.liveUpdate;

      const defaultConfig: IMetricAppConfig = { liveUpdate: luConfig };

      if (grouping) {
        defaultConfig.grouping =
          getStateFromUrl('grouping') || config?.grouping;
      }
      if (selectForm) {
        defaultConfig.select = getStateFromUrl('select') || config?.select;
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
    }

    function processData(data: ISequence<IMetricTrace>[]): {
      data: IMetricsCollection<IMetric>[];
      params: string[];
      highLevelParams: string[];
      contexts: string[];
    } {
      const configData = model.getState()?.config;
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

      const processedData = groupData(
        _.orderBy(
          metrics,
          configData?.table?.sortFields?.map(
            (f: SortField) =>
              function (metric: IMetric) {
                return _.get(metric, f[0], '');
              },
          ) ?? [],
          configData?.table?.sortFields?.map((f: SortField) => f[1]) ?? [],
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

    function updateModelData(
      configData = model.getState()!.config!,
      shouldURLUpdate?: boolean,
    ): void {
      const { data, params, highLevelParams, contexts } = processData(
        model.getState()?.rawData as ISequence<IMetricTrace>[],
      );
      const groupingSelectOptions = [
        ...getGroupingSelectOptions({
          params: params.concat(highLevelParams).sort(),
          contexts,
        }),
      ];
      tooltipData = getTooltipData({
        processedData: data,
        paramKeys: params,
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
        chartTitleData: getChartTitleData<
          IMetric,
          Partial<IMetricAppModelState>
        >({
          processedData: data,
          groupingSelectOptions,
          model: model as IModel<Partial<IMetricAppModelState>>,
        }),
        aggregatedData: getAggregatedData<Partial<IMetricAppModelState>>({
          processedData: data,
          model: model as IModel<Partial<IMetricAppModelState>>,
        }),
        tableData: tableData.rows,
        tableColumns,
        sameValueColumns: tableData.sameValueColumns,
        groupingSelectOptions,
      });
    }

    function setModelData(
      rawData: ISequence<IMetricTrace>[],
      configData: IMetricAppConfig,
    ): void {
      const sortFields = model.getState()?.config?.table?.sortFields;
      const { data, params, highLevelParams, contexts } = processData(rawData);
      if (configData) {
        setAggregationEnabled({ model, appName });
      }
      const groupingSelectOptions = [
        ...getGroupingSelectOptions({
          params: params.concat(highLevelParams).sort(),
          contexts,
        }),
      ];
      tooltipData = getTooltipData({
        processedData: data,
        paramKeys: params,
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
        data[0]?.config,
        configData.table?.columnsOrder!,
        configData.table?.hiddenColumns!,
        configData?.chart?.aggregationConfig.methods,
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
        chartTitleData: getChartTitleData<
          IMetric,
          Partial<IMetricAppModelState>
        >({
          processedData: data,
          groupingSelectOptions,
          model: model as IModel<IMetricAppModelState>,
        }),
        aggregatedData: getAggregatedData<Partial<IMetricAppModelState>>({
          processedData: data,
          model: model as IModel<IMetricAppModelState>,
        }),
        tableData: tableData.rows,
        tableColumns: tableColumns,
        sameValueColumns: tableData.sameValueColumns,
        groupingSelectOptions,
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
          groupedRow.forEach((row: IMetricTableRowData) => {
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
      analytics.trackEvent(`[${appName}Explore] Export runs data to CSV`);
    }

    const onActivePointChange = _.debounce(
      (
        activePoint: IActivePoint,
        focusedStateActive: boolean = false,
      ): void => {
        const { data, params, refs, config, groupingSelectOptions } =
          model.getState() as IMetricAppModelState;
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

    function onSortChange(
      field: string,
      value?: 'asc' | 'desc' | 'none',
    ): void {
      onTableSortChange({ field, model, appName, updateModelData, value });
    }

    function setModelComponentRefs(refElement: object): void {
      setComponentRefs({ refElement, model });
    }

    function changeLiveUpdateConfig(config: {
      enabled?: boolean;
      delay?: number;
    }): void {
      const state = model.getState() as IMetricAppModelState;
      const configData = state?.config;
      const liveUpdateConfig = configData?.liveUpdate;
      const metric = configData?.chart?.alignmentConfig.metric;
      let query = getQueryStringFromSelect(configData?.select);

      if (!liveUpdateConfig?.enabled && config.enabled && query !== '()') {
        liveUpdateInstance = new LiveUpdateService(
          appName,
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
          liveUpdate: newLiveUpdateConfig,
        },
      });
      setItem('metricsLUConfig', encode(newLiveUpdateConfig));
      analytics.trackEvent(
        `[${appName}Explorer] Switch live-update ${
          config.enabled ? 'on' : 'off'
        }`,
      );
    }

    function destroy(): void {
      liveUpdateInstance?.clear();
      liveUpdateInstance = null; //@TODO check is this need or not
    }

    const methods = {
      initialize,
      getAppConfigData,
      getMetricsData,
      getDataAsTableRows,
      setDefaultAppConfigData,
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
        onMetricsSelectChange<D>(
          data: D & Partial<ISelectMetricsOption[]>,
        ): void {
          onMetricsSelectChange({ data, model });
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
        updateColumnsWidths(
          key: string,
          width: number,
          isReset: boolean,
        ): void {
          updateColumnsWidths({
            key,
            width,
            isReset,
            model,
            appName,
            updateModelData,
          });
        },
      });
    }

    return methods;
  }

  function getRunsAppModelMethods() {
    switch (appName) {
      case AppNameEnum.PARAMS:
        return getParamsModelMethods();
      case AppNameEnum.RUNS:
        return getRunsModelMethods();
      default:
        return {};
    }

    function getRunsModelMethods() {
      let runsRequestRef: {
        call: (
          exceptionHandler: (detail: any) => void,
        ) => Promise<ReadableStream<IRun<IParamTrace>[]>>;
        abort: () => void;
      };
      let liveUpdateInstance: LiveUpdateService | null;

      function initialize(appId: string = ''): {
        call: () => Promise<void>;
        abort: () => void;
      } {
        model.init();
        const state: Partial<IRunsAppModelState> = {};
        // if (grouping) {
        //   state.groupingSelectOptions = [];
        // }
        if (components?.table) {
          state.refs = {
            ...state.refs,
            tableRef: { current: null },
          };
        }
        // if (components?.charts?.[0]) {
        //   tooltipData = {};
        //   state.refs = {
        //     ...state.refs,
        //     chartPanelRef: { current: null },
        //   };
        // }
        model.setState({ ...state });
        if (!appId) {
          setDefaultAppConfigData();
        }

        const liveUpdateState = model.getState()?.config.liveUpdate;

        if (liveUpdateState?.enabled) {
          liveUpdateInstance = new LiveUpdateService(
            appName,
            updateData,
            liveUpdateState.delay,
          );
        }

        return getRunsData();
      }

      function getRunsData(
        shouldUrlUpdate?: boolean,
        isInitial = true,
      ): {
        call: () => Promise<void>;
        abort: () => void;
      } {
        // if (runsRequestRef) {
        //   runsRequestRef.abort();
        // }
        // isInitial: true --> when search button clicked or data is loading at the first time
        const modelState = prepareModelStateToCall(isInitial);
        const configData = modelState?.config;

        const query = configData?.select?.query || '';
        const pagination = configData?.pagination;

        liveUpdateInstance?.stop().then();

        const { call, abort } = runsService.getRunsData(
          query,
          pagination?.limit,
          pagination?.offset,
        );

        if (shouldUrlUpdate) {
          updateURL({ configData, appName });
        }

        return {
          call: async () => {
            try {
              const stream = await call((detail) =>
                exceptionHandler({ detail, model }),
              );
              let gen = adjustable_reader(stream as ReadableStream<any>);
              let buffer_pairs = decode_buffer_pairs(gen);
              let decodedPairs = decodePathsVals(buffer_pairs);
              let objects = iterFoldTree(decodedPairs, 1);

              const runsData: IRun<IMetricTrace | IParamTrace>[] = isInitial
                ? []
                : modelState?.rawData;
              let count = 0;
              for await (let [keys, val] of objects) {
                if (isInitial) {
                  const runData: any = val;
                  runsData.push({ ...runData, hash: keys[0] } as any);
                } else {
                  if (count > 0) {
                    const runData: any = val;
                    runsData.push({ ...runData, hash: keys[0] } as any);
                  }
                }
                count++;
              }
              const { data, params, metricsColumns } = processData(runsData);

              const tableData = getDataAsTableRows(
                data,
                metricsColumns,
                params,
              );
              const tableColumns = getRunsTableColumns(
                metricsColumns,
                params,
                data[0]?.config,
                model.getState()?.config?.table.columnsOrder!,
                model.getState()?.config?.table.hiddenColumns!,
              );

              model.setState({
                data,
                rawData: runsData,
                requestIsPending: false,
                infiniteIsPending: false,
                tableColumns,
                tableData: tableData.rows,
                sameValueColumns: tableData.sameValueColumns,
                config: {
                  ...modelState?.config,
                  pagination: {
                    ...modelState?.config.pagination,
                    isLatest:
                      !isInitial && count < modelState?.config.pagination.limit,
                  },
                },
              });

              const tableRef: any = model.getState()?.refs?.tableRef;
              tableRef.current?.updateData({
                newData: tableData.rows,
                newColumns: tableColumns,
                hiddenColumns: configData.table.hiddenColumns!,
              });
            } catch (ex) {
              if (ex.name === 'AbortError') {
                // Abort Error
              } else {
                console.log('Unhandled error: ', ex);
              }
            }
          },
          abort,
        };
      }

      function setDefaultAppConfigData(): void {
        const config = getConfig() as IRunsAppConfig;

        const liveUpdateConfigHash = getItem('runsLUConfig');
        const luConfig = liveUpdateConfigHash
          ? JSON.parse(decode(liveUpdateConfigHash))
          : config?.liveUpdate;

        const defaultConfig: IParamsAppConfig & IRunsAppConfig = {
          liveUpdate: luConfig,
        };

        // if (grouping) {
        //   defaultConfig.grouping =
        //     getStateFromUrl('grouping') || config?.grouping;
        // }
        if (selectForm) {
          defaultConfig.select = getStateFromUrl('select') || config?.select;
        }
        // if (components.charts) {
        //   defaultConfig.chart = getStateFromUrl('chart') || config?.chart;
        // }
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
      }

      function updateModelData(
        configData = model.getState()!.config!,
        shouldURLUpdate?: boolean,
      ): void {
        const { data, params, metricsColumns } = processData(
          model.getState()?.rawData as IRun<IMetricTrace>[],
        );
        const tableData = getDataAsTableRows(data, metricsColumns, params);
        const tableColumns: ITableColumn[] = getRunsTableColumns(
          metricsColumns,
          params,
          data[0]?.config,
          configData?.table?.columnsOrder!,
          configData?.table?.hiddenColumns!,
        );
        const tableRef: any = model.getState()?.refs?.tableRef;
        tableRef.current?.updateData({
          newData: tableData.rows,
          newColumns: tableColumns,
          hiddenColumns: configData?.table?.hiddenColumns!,
        });
        model.setState({
          config: configData,
          data,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
        });
      }

      function prepareModelStateToCall(isInitial: boolean): IRunsAppModelState {
        const config = model.getState()?.config;
        if (isInitial) {
          model.setState({
            config: {
              ...config,
              pagination: {
                limit: 45,
                offset: null,
                isLatest: false,
              },
            },
            notifyData: [],
            rawData: [],
            tableColumns: [],
            tableData: [],
            data: [],
          });
        }

        model.setState({
          requestIsPending: isInitial,
          infiniteIsPending: !isInitial,
        });

        return model.getState();
      }

      function processData(data: any[]): {
        data: any[];
        params: string[];
        metricsColumns: any;
      } {
        const grouping = model.getState()?.config?.grouping;
        let runs: IParam[] = [];
        let params: string[] = [];
        const paletteIndex: number = grouping?.paletteIndex || 0;
        const metricsColumns: any = {};

        data?.forEach((run: IRun<IParamTrace>, index) => {
          params = params.concat(getObjectPaths(run.params, run.params));
          run.traces.metric.forEach((trace) => {
            metricsColumns[trace.name] = {
              ...metricsColumns[trace.name],
              [contextToString(trace.context) as string]: '-',
            };
          });
          runs.push({
            run,
            isHidden: false,
            color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
            key: run.hash,
            dasharray: DASH_ARRAYS[0],
          });
        });
        const processedData = groupData(runs);
        const uniqParams = _.uniq(params);

        return {
          data: processedData,
          params: uniqParams,
          metricsColumns,
        };
      }

      function groupData(data: any): IMetricsCollection<IMetric>[] {
        const configData = model.getState()!.config;
        const grouping = configData!.grouping;

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
        const { paletteIndex = 0 } = grouping || {};

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

        const groups = Object.values(groupValues);
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

      function getDataAsTableRows(
        processedData: any,
        metricsColumns: any,
        paramKeys: string[],
        isRawData?: boolean,
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
            Object.keys(metricsColumns[key]).forEach(
              (metricContext: string) => {
                groupByMetricName[
                  `${isSystemMetric(key) ? key : `${key}_${metricContext}`}`
                ] = '-';
              },
            );
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
              runHash: metric.run.hash,
              index: rowIndex,
              color: metricsCollection.color ?? metric.color,
              dasharray: metricsCollection.dasharray ?? metric.dasharray,
              experiment: metric.run.props.experiment.name ?? 'default',
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
                isRawData ? rowValues : runsTableRowRenderer(rowValues),
              );
            } else {
              rows.push(
                isRawData ? rowValues : runsTableRowRenderer(rowValues),
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
              rows[groupKey!].data = runsTableRowRenderer(
                rows[groupKey!].data,
                true,
                Object.keys(columnsValues),
              );
            }
          }
        });

        return { rows, sameValueColumns };
      }

      function getLastRunsData(
        lastRow: any,
      ): { call: () => Promise<void>; abort: () => void } | undefined {
        const modelData: Partial<IRunsAppModelState> = model.getState();
        const infiniteIsPending = modelData?.infiniteIsPending;
        const isLatest = modelData?.config.pagination.isLatest;

        if (!infiniteIsPending && !isLatest) {
          const lastRowKey =
            modelData?.rawData[modelData?.rawData.length - 1].hash;
          model.setState({
            config: {
              ...modelData?.config,
              pagination: {
                ...modelData?.config.pagination,
                offset: lastRowKey,
              },
            },
          });
          return getRunsData(false, false);
        }
      }

      function onExportTableData(): void {
        // @TODO need to get data and params from state not from processData
        const { data, params, metricsColumns } = processData(
          model.getState()?.rawData as IRun<IMetricTrace>[],
        );
        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          true,
        );
        const configData = model.getState()?.config;
        const tableColumns: ITableColumn[] = getRunsTableColumns(
          metricsColumns,
          params,
          data[0]?.config,
          configData?.table.columnsOrder!,
          configData?.table.hiddenColumns!,
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
              const filteredRow = getFilteredRow({
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
        saveAs(blob, `runs-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
        analytics.trackEvent(
          `[${appName}Explore][Table] Export runs data to CSV`,
        );
      }

      function onModelNotificationDelete(id: number): void {
        onNotificationDelete({ id, model });
      }

      function updateData(newData: any): void {
        const { data, params, metricsColumns } = processData(newData);
        const modelState = model.getState() as IRunsAppModelState;
        const tableData = getDataAsTableRows(data, metricsColumns, params);
        const tableColumns = getRunsTableColumns(
          metricsColumns,
          params,
          data[0]?.config,
          model.getState()?.config?.table.columnsOrder!,
          model.getState()?.config?.table.hiddenColumns!,
        );
        model.setState({
          data,
          rowData: newData,
          requestIsPending: false,
          infiniteIsPending: false,
          tableColumns,
          tableData: tableData.rows,
          sameValueColumns: tableData.sameValueColumns,
          config: {
            ...modelState?.config,
            pagination: {
              ...modelState?.config.pagination,
              isLatest: false,
            },
          },
        });

        const tableRef: any = model.getState()?.refs?.tableRef;
        tableRef.current?.updateData({
          newData: tableData.rows,
          newColumns: tableColumns,
          hiddenColumns: modelState?.config.table.hiddenColumns!,
        });
      }

      function destroy(): void {
        liveUpdateInstance?.clear();
        liveUpdateInstance = null; //@TODO check is this need or not
      }

      function changeLiveUpdateConfig(config: {
        enabled?: boolean;
        delay?: number;
      }): void {
        const state = model.getState() as IRunsAppModelState;
        const configData = state?.config;
        const liveUpdateConfig = configData.liveUpdate;

        if (!liveUpdateConfig?.enabled && config.enabled) {
          const query = configData?.select?.query || '';
          const pagination = configData?.pagination;

          liveUpdateInstance = new LiveUpdateService(
            appName,
            updateData,
            config?.delay || liveUpdateConfig?.delay,
          );
          liveUpdateInstance.start({
            q: query,
            limit: pagination.limit + state?.rawData?.length || 0,
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

        setItem('runsLUConfig', encode(newLiveUpdateConfig));
        analytics.trackEvent(
          `[${appName}Explorer] Switch live-update ${
            config.enabled ? 'on' : 'off'
          }`,
        );
      }

      const methods = {
        destroy,
        initialize,
        getRunsData,
        getLastRunsData,
        onExportTableData,
        onNotificationDelete: onModelNotificationDelete,
        setDefaultAppConfigData,
        changeLiveUpdateConfig,
      };

      // if (grouping) {
      //   Object.assign(methods, {});
      // }
      if (selectForm) {
        Object.assign(methods, {
          onSelectRunQueryChange(query: string): void {
            onSelectRunQueryChange({ query, model });
          },
        });
      }
      // if (components?.charts?.[0]) {
      //   Object.assign(methods, {});
      // }
      if (components?.table) {
        Object.assign(methods, {
          onRowHeightChange(height: RowHeightSize): void {
            onRowHeightChange({ height, model, appName });
          },
          onColumnsOrderChange(columnsOrder: any): void {
            onColumnsOrderChange({
              columnsOrder,
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
          onSortReset(): void {
            updateSortFields({
              sortFields: [],
              model,
              appName,
              updateModelData,
            });
          },
          updateColumnsWidths(
            key: string,
            width: number,
            isReset: boolean,
          ): void {
            updateColumnsWidths({
              key,
              width,
              isReset,
              model,
              appName,
              updateModelData,
            });
          },
        });
      }

      return methods;
    }

    function getParamsModelMethods() {
      let runsRequestRef: {
        call: (
          exceptionHandler: (detail: any) => void,
        ) => Promise<ReadableStream<IRun<IParamTrace>[]>>;
        abort: () => void;
      };
      let tooltipData: ITooltipData = {};
      let liveUpdateInstance: LiveUpdateService | null;

      function initialize(appId: string): void {
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
          setDefaultAppConfigData();
        }
        const liveUpdateState = model.getState()?.config.liveUpdate;

        if (liveUpdateState?.enabled) {
          liveUpdateInstance = new LiveUpdateService(
            appName,
            updateData,
            liveUpdateState.delay,
          );
        }
      }

      function getAppConfigData(appId: string): {
        call: () => Promise<void>;
        abort: () => void;
      } {
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
      }

      function setDefaultAppConfigData(): void {
        const config = getConfig() as IParamsAppConfig;

        const liveUpdateConfigHash = getItem('paramsLUConfig');
        const luConfig = liveUpdateConfigHash
          ? JSON.parse(decode(liveUpdateConfigHash))
          : config?.liveUpdate;

        const defaultConfig: IParamsAppConfig = { liveUpdate: luConfig };

        if (grouping) {
          defaultConfig.grouping =
            getStateFromUrl('grouping') || config?.grouping;
        }
        if (selectForm) {
          defaultConfig.select = getStateFromUrl('select') || config?.select;
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
      }

      function updateData(newData: IRun<IParamTrace>[]): void {
        const configData = model.getState()?.config;
        if (configData) {
          setModelData(newData, configData);
        }
      }

      function getParamsData(shouldUrlUpdate?: boolean): {
        call: () => Promise<void>;
        abort: () => void;
      } {
        if (runsRequestRef) {
          runsRequestRef.abort();
        }
        const configData = model.getState()?.config;
        if (shouldUrlUpdate) {
          updateURL({ configData, appName });
        }
        runsRequestRef = runsService.getRunsData(configData?.select?.query);
        return {
          call: async () => {
            if (_.isEmpty(configData?.select?.params)) {
              let state: Partial<IParamsAppModelState> = {};
              if (components?.charts?.indexOf(ChartTypeEnum.HighPlot) !== -1) {
                state.highPlotData = [];
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
                ...state,
              });
            } else {
              model.setState({
                requestIsPending: true,
                queryIsEmpty: false,
              });
              liveUpdateInstance?.stop().then();
              try {
                const stream = await runsRequestRef.call((detail) =>
                  exceptionHandler({ detail, model }),
                );
                const runData = await getRunData(stream);
                updateData(runData);

                liveUpdateInstance?.start({
                  q: configData?.select?.query,
                });
              } catch (ex) {
                if (ex.name === 'AbortError') {
                  // Abort Error
                } else {
                  console.log('Unhandled error: ', ex);
                }
              }
            }
          },
          abort: runsRequestRef.abort,
        };
      }

      function getDataAsTableRows(
        processedData: IMetricsCollection<IParam>[],
        metricsColumns: any,
        paramKeys: string[],
        isRowData: boolean,
        config: IParamsAppConfig,
        groupingSelectOptions: IGroupingSelectOption[],
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
            Object.keys(metricsColumns[key]).forEach(
              (metricContext: string) => {
                groupByMetricName[
                  `${isSystemMetric(key) ? key : `${key}_${metricContext}`}`
                ] = '-';
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
              const groupConfigData: { [key: string]: string } = {};
              for (let key in metricsCollection.config) {
                groupConfigData[getValueByField(groupingSelectOptions, key)] =
                  metricsCollection.config[key];
              }
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
                  config: groupConfigData,
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
                rowMeta: {
                  color: metricsCollection.color ?? metric.color,
                },
                key: metric.key,
                runHash: metric.run.hash,
                isHidden: metric.isHidden,
                index: rowIndex,
                color: metricsCollection.color ?? metric.color,
                dasharray: metricsCollection.dasharray ?? metric.dasharray,
                experiment: metric.run.props.experiment.name ?? 'default',
                run: moment(metric.run.props.creation_time * 1000).format(
                  'HH:mm:ss · D MMM, YY',
                ),
                metric: metric.name,
                ...metricsRowValues,
              };
              rowIndex++;

              for (let key in metricsRowValues) {
                columnsValues[key] = ['-'];
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
                  isRowData
                    ? rowValues
                    : paramsTableRowRenderer(rowValues, {
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
                    : paramsTableRowRenderer(rowValues, {
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
      }

      function getDataAsLines(
        processedData: IMetricsCollection<IParam>[],
        configData = model.getState()?.config,
      ): { dimensions: IDimensionsType; data: any }[] {
        if (!processedData || _.isEmpty(configData.select.params)) {
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
                      run.run.traces.metric.forEach((trace: IParamTrace) => {
                        const formattedContext = `${
                          value?.param_name
                        }-${contextToString(trace.context)}`;
                        if (
                          trace.name === value?.param_name &&
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

        return Object.keys(dimensionsObject)
          .map((keyOfDimension, i) => {
            const dimensions: IDimensionsType = {};
            Object.keys(dimensionsObject[keyOfDimension]).forEach(
              (key: string) => {
                if (
                  dimensionsObject[keyOfDimension][key].scaleType === 'linear'
                ) {
                  dimensions[key] = {
                    scaleType: dimensionsObject[keyOfDimension][key].scaleType,
                    domainData: [
                      Math.min(...dimensionsObject[keyOfDimension][key].values),
                      Math.max(...dimensionsObject[keyOfDimension][key].values),
                    ],
                    displayName:
                      dimensionsObject[keyOfDimension][key].displayName,
                    dimensionType:
                      dimensionsObject[keyOfDimension][key].dimensionType,
                  };
                } else {
                  dimensions[key] = {
                    scaleType: dimensionsObject[keyOfDimension][key].scaleType,
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
          })
          .filter(
            (data) => !_.isEmpty(data.data) && !_.isEmpty(data.dimensions),
          );
      }

      function setModelData(
        rawData: IRun<IParamTrace>[],
        configData: IParamsAppConfig,
      ): void {
        const { data, params, highLevelParams, metricsColumns } =
          processData(rawData);

        const groupingSelectOptions = [
          ...getGroupingSelectOptions({
            params: params.concat(highLevelParams).sort(),
          }),
        ];

        tooltipData = getTooltipData({
          processedData: data,
          paramKeys: params,
          groupingSelectOptions,
          groupingItems: ['color', 'stroke', 'chart'],
          model,
        });

        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          false,
          configData,
          groupingSelectOptions,
        );
        const sortFields = model.getState()?.config?.table.sortFields;

        const tableColumns = getParamsTableColumns(
          metricsColumns,
          params,
          data[0]?.config,
          configData.table?.columnsOrder!,
          configData.table?.hiddenColumns!,
          sortFields,
          onSortChange,
          configData.grouping as any,
          onModelGroupingSelectChange,
        );

        if (!model.getState()?.requestIsPending) {
          model.getState()?.refs?.tableRef.current?.updateData({
            newData: tableData.rows,
            newColumns: tableColumns,
          });
        }

        model.setState({
          requestIsPending: false,
          data,
          highPlotData: getDataAsLines(data),
          chartTitleData: getChartTitleData<IParam, IParamsAppModelState>({
            processedData: data,
            groupingSelectOptions,
            model: model as IModel<IParamsAppModelState>,
          }),
          params,
          metricsColumns,
          rawData,
          config: configData,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
          groupingSelectOptions,
        });
      }

      function groupData(data: IParam[]): IMetricsCollection<IParam>[] {
        const grouping = model.getState()!.config!.grouping;
        const { paletteIndex } = grouping;
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

      function processData(data: IRun<IParamTrace>[]): {
        data: IMetricsCollection<IParam>[];
        params: string[];
        highLevelParams: string[];
        metricsColumns: any;
      } {
        const configData = model.getState()?.config;
        const grouping = model.getState()?.config?.grouping;
        let runs: IParam[] = [];
        let params: string[] = [];
        let highLevelParams: string[] = [];
        const paletteIndex: number = grouping?.paletteIndex || 0;
        const metricsColumns: any = {};

        data?.forEach((run: IRun<IParamTrace>, index) => {
          params = params.concat(getObjectPaths(run.params, run.params));
          highLevelParams = highLevelParams.concat(
            getObjectPaths(run.params, run.params, '', false, true),
          );
          run.traces.metric.forEach((trace) => {
            metricsColumns[trace.name] = {
              ...metricsColumns[trace.name],
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
              (f: SortField) =>
                function (run: IParam) {
                  return _.get(run, f[0], '');
                },
            ) ?? [],
            configData?.table?.sortFields?.map((f: SortField) => f[1]) ?? [],
          ),
        );
        const uniqParams = _.uniq(params);
        const uniqHighLevelParams = _.uniq(highLevelParams);

        return {
          data: processedData,
          params: uniqParams,
          highLevelParams: uniqHighLevelParams,
          metricsColumns,
        };
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
        let configData = config;
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
            updateURL({ configData, appName });
          }
        }

        model.setState({ config: configData });
      }

      function onExportTableData(): void {
        const { data, params, config, metricsColumns, groupingSelectOptions } =
          model.getState() as IParamsAppModelState;
        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          true,
          config,
          groupingSelectOptions,
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
        saveAs(blob, `params-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
        analytics.trackEvent('[ParamsExplorer] Export runs data to CSV');
      }

      function updateModelData(
        configData = model.getState()!.config!,
        shouldURLUpdate?: boolean,
      ): void {
        const { data, params, highLevelParams, metricsColumns } = processData(
          model.getState()?.rawData as IRun<IParamTrace>[],
        );
        const groupingSelectOptions = [
          ...getGroupingSelectOptions({
            params: params.concat(highLevelParams).sort(),
          }),
        ];
        tooltipData = getTooltipData({
          processedData: data,
          paramKeys: params,
          groupingSelectOptions,
          groupingItems: ['color', 'stroke', 'chart'],
          model,
        });
        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          false,
          configData,
          groupingSelectOptions,
        );
        const tableColumns = getParamsTableColumns(
          metricsColumns,
          params,
          data[0]?.config,
          configData.table?.columnsOrder!,
          configData.table?.hiddenColumns!,
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
          highPlotData: getDataAsLines(data),
          chartTitleData: getChartTitleData<IParam, IParamsAppModelState>({
            processedData: data,
            groupingSelectOptions,
            model: model as IModel<IParamsAppModelState>,
          }),
          groupingSelectOptions,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
        });
      }

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

      function onModelNotificationAdd<N>(
        notification: N & INotification,
      ): void {
        onNotificationAdd({ notification, model });
      }

      function onModelResetConfigData(): void {
        onResetConfigData({ model, getConfig, updateModelData });
      }

      function onSortChange(
        field: string,
        value?: 'asc' | 'desc' | 'none',
      ): void {
        onTableSortChange({ field, model, appName, updateModelData, value });
      }

      function changeLiveUpdateConfig(config: {
        enabled?: boolean;
        delay?: number;
      }): void {
        const state = model.getState();
        const configData = state?.config;
        const query = configData.select?.query;
        const liveUpdateConfig = configData.liveUpdate;

        if (!liveUpdateConfig?.enabled && config.enabled && query !== '()') {
          liveUpdateInstance = new LiveUpdateService(
            appName,
            updateData,
            config?.delay || liveUpdateConfig?.delay,
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
          config: {
            ...configData,
            liveUpdate: newLiveUpdateConfig,
          },
        });

        setItem('paramsLUConfig', encode(newLiveUpdateConfig));
        analytics.trackEvent(
          `[${appName}Explorer] Switch live-update ${
            config.enabled ? 'on' : 'off'
          }`,
        );
      }

      function destroy(): void {
        liveUpdateInstance?.clear();
        liveUpdateInstance = null; //@TODO check is this need or not
      }

      const methods = {
        initialize,
        getAppConfigData,
        getParamsData,
        setDefaultAppConfigData,
        updateModelData,
        onActivePointChange,
        onExportTableData,
        onBookmarkCreate: onModelBookmarkCreate,
        onBookmarkUpdate: onModelBookmarkUpdate,
        onNotificationAdd: onModelNotificationAdd,
        onNotificationDelete: onModelNotificationDelete,
        onResetConfigData: onModelResetConfigData,
        destroy,
        changeLiveUpdateConfig,
        onShuffleChange,
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
            });
          },
          onGroupingPaletteChange(index: number): void {
            onGroupingPaletteChange({ index, model, appName, updateModelData });
          },
          onGroupingReset(groupName: GroupNameType): void {
            onGroupingReset({ groupName, model, appName, updateModelData });
          },
          onGroupingApplyChange(groupName: GroupNameType): void {
            onGroupingApplyChange({
              groupName,
              model,
              appName,
              updateModelData,
            });
          },
          onGroupingPersistenceChange(groupName: GroupNameType): void {
            onGroupingPersistenceChange({
              groupName,
              model,
              appName,
              updateModelData,
            });
          },
          onShuffleChange(name: 'color' | 'stroke'): void {
            onShuffleChange({ name, model, updateModelData });
          },
        });
      }
      if (selectForm) {
        Object.assign(methods, {
          onParamsSelectChange(data: any[]): void {
            const configData = model.getState()?.config;
            if (configData?.select) {
              const newConfig = {
                ...configData,
                select: { ...configData.select, params: data },
              };

              model.setState({ config: newConfig });
            }
          },
          onSelectRunQueryChange(query: string): void {
            onSelectRunQueryChange({ query, model });
          },
        });
      }
      if (components?.charts?.[0]) {
        Object.assign(methods, {
          onChangeTooltip(tooltip: Partial<IPanelTooltip>): void {
            onChangeTooltip({ tooltip, tooltipData, model, appName });
          },
          onColorIndicatorChange(): void {
            onColorIndicatorChange({ model, appName, updateModelData });
          },
          onCurveInterpolationChange(): void {
            onCurveInterpolationChange({ model, appName, updateModelData });
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
          onSortFieldsChange(sortFields: [string, any][]): void {
            onSortFieldsChange({ sortFields, model, appName, updateModelData });
          },
          onParamVisibilityChange(metricsKeys: string[]): void {
            onParamVisibilityChange({
              metricsKeys,
              model,
              appName,
              updateModelData,
            });
          },
          onColumnsOrderChange(columnsOrder: any): void {
            onColumnsOrderChange({
              columnsOrder,
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
          onTableResizeModeChange(mode: ResizeModeEnum): void {
            onTableResizeModeChange({ mode, model, appName });
          },
          onTableDiffShow(): void {
            onTableDiffShow({ model, appName, updateModelData });
          },
          onTableResizeEnd(tableHeight: string): void {
            onTableResizeEnd({ tableHeight, model, appName });
          },
          onSortReset(): void {
            updateSortFields({
              sortFields: [],
              model,
              appName,
              updateModelData,
            });
          },
          updateColumnsWidths(
            key: string,
            width: number,
            isReset: boolean,
          ): void {
            updateColumnsWidths({
              key,
              width,
              isReset,
              model,
              appName,
              updateModelData,
            });
          },
        });
      }

      return methods;
    }
  }

  function getAppModelMethods() {
    switch (dataType) {
      case AppDataTypeEnum.METRICS:
        return getMetricsAppModelMethods();
      case AppDataTypeEnum.RUNS:
        return getRunsAppModelMethods();
      default:
        return {};
    }
  }

  return {
    ...model,
    ...getAppModelMethods(),
  };
}

export default createAppModel;
