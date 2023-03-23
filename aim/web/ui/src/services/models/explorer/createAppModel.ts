import moment from 'moment';
import { saveAs } from 'file-saver';
import _ from 'lodash-es';

import { IPoint } from 'components/ScatterPlot';
import { IAxesScaleRange } from 'components/AxesPropsPopover';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize, TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';
import { DensityOptions } from 'config/enums/densityEnum';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DATE_EXPORTING_FORMAT, TABLE_DATE_FORMAT } from 'config/dates/dates';
import { getSuggestionsByExplorer } from 'config/monacoConfig/monacoConfig';
import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import {
  getMetricsTableColumns,
  metricsTableRowRenderer,
} from 'pages/Metrics/components/MetricsTableGrid/MetricsTableGrid';
import {
  getParamsTableColumns,
  paramsTableRowRenderer,
} from 'pages/Params/components/ParamsTableGrid/ParamsTableGrid';
import {
  getRunsTableColumns,
  runsTableRowRenderer,
} from 'pages/Runs/components/RunsTableGrid/RunsTableGrid';

import * as analytics from 'services/analytics';
import metricsService from 'services/api/metrics/metricsService';
import runsService from 'services/api/runs/runsService';
import createMetricModel from 'services/models/metrics/metricModel';
import { createRunModel } from 'services/models/metrics/runModel';
import createModel from 'services/models/model';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';
import projectsService from 'services/api/projects/projectsService';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { ILine } from 'types/components/LineChart/LineChart';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IMetric } from 'types/services/models/metrics/metricModel';
import {
  IAggregationConfig,
  IAppData,
  IChartZoom,
  IGroupingSelectOption,
  IMetricAppModelState,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ISmoothing,
  ITooltip,
  LegendsConfig,
} from 'types/services/models/metrics/metricsAppModel';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
  ISequence,
} from 'types/services/models/metrics/runModel';
import { IModel } from 'types/services/models/model';
import {
  IParam,
  IParamsAppModelState,
} from 'types/services/models/params/paramsAppModel';
import { IRunsAppModelState } from 'types/services/models/runs/runsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import {
  IDimensionsType,
  IDimensionType,
} from 'types/utils/d3/drawParallelAxes';
import {
  IAppInitialConfig,
  IAppModelConfig,
  IAppModelState,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import {
  IScatterAppModelState,
  ITrendlineOptions,
} from 'types/services/models/scatter/scatterAppModel';
import { IApiRequest } from 'types/services/services';
import { ITagInfo, ITagProps } from 'types/pages/tags/Tags';

import {
  aggregateGroupData,
  AggregationAreaMethods,
} from 'utils/aggregateGroupData';
import exceptionHandler from 'utils/app/exceptionHandler';
import getAggregatedData from 'utils/app/getAggregatedData';
import getChartTitleData from 'utils/app/getChartTitleData';
import { getFilteredGroupingOptions } from 'utils/app/getFilteredGroupingOptions';
import getFilteredRow from 'utils/app/getFilteredRow';
import { getGroupingPersistIndex } from 'utils/app/getGroupingPersistIndex';
import getGroupingSelectOptions from 'utils/app/getGroupingSelectOptions';
import getQueryStringFromSelect from 'utils/app/getQueryStringFromSelect';
import getRunData from 'utils/app/getRunData';
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
import onSelectOptionsChange from 'utils/app/onSelectOptionsChange';
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
  AlignmentOptionsEnum,
  ChartTypeEnum,
  HighlightEnum,
  ScaleEnum,
} from 'utils/d3';
import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { filterMetricsData } from 'utils/app/filterMetricData';
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
import getTooltipContent from 'utils/getTooltipContent';
import setDefaultAppConfigData from 'utils/app/setDefaultAppConfigData';
import getAppConfigData from 'utils/app/getAppConfigData';
import { getValue } from 'utils/helper';
import onRowSelect from 'utils/app/onRowSelect';
import { SortField } from 'utils/getSortedFields';
import onChangeTrendlineOptions from 'utils/app/onChangeTrendlineOptions';
import onToggleColumnsColorScales from 'utils/app/onToggleColumnsColorScales';
import onAxisBrushExtentChange from 'utils/app/onAxisBrushExtentChange';
import onRunsTagsChange from 'utils/app/onRunsTagsChange';
import {
  alignByAbsoluteTime,
  alignByCustomMetric,
  alignByEpoch,
  alignByRelativeTime,
  alignByStep,
} from 'utils/app/alignMetricData';
import setRequestProgress from 'utils/app/setRequestProgress';
import onAxesScaleRangeChange from 'utils/app/onAxesScaleRangeChange';
import { minMaxOfArray } from 'utils/minMaxOfArray';
import getAdvancedSuggestion from 'utils/getAdvancedSuggestions';
import { processDurationTime } from 'utils/processDurationTime';
import getSelectOptions from 'utils/app/getSelectOptions';
import { getMetricsSelectOptions } from 'utils/app/getMetricsSelectOptions';
import onRowsVisibilityChange from 'utils/app/onRowsVisibilityChange';
import { onCopyToClipBoard } from 'utils/onCopyToClipBoard';
import { getMetricsInitialRowData } from 'utils/app/getMetricsInitialRowData';
import { getMetricHash } from 'utils/app/getMetricHash';
import { getMetricLabel } from 'utils/app/getMetricLabel';
import saveRecentSearches from 'utils/saveRecentSearches';
import getLegendsData from 'utils/app/getLegendsData';
import onLegendsChange from 'utils/app/onLegendsChange';

import { AppDataTypeEnum, AppNameEnum } from './index';

/**
 * function createAppModel has 2 major functionalities:
 *    1. getConfig() function which depends on appInitialConfig returns corresponding config state
 *    2. getAppModelMethods() function which depends on appInitialConfig returns corresponding methods
 * @appConfig {IAppInitialConfig} - the config which describe app model
 */

function createAppModel(appConfig: IAppInitialConfig) {
  const { appName, dataType, grouping, components, selectForm } = appConfig;

  const model = createModel<IAppModelState>({
    requestStatus: RequestStatusEnum.NotRequested,
    requestProgress: {
      matched: 0,
      checked: 0,
      trackedRuns: 0,
    },
    selectFormData: { options: undefined, suggestions: [] },
    config: getConfig(),
  });

  let appRequest: {
    call: () => Promise<IAppData>;
    abort: () => void;
  };

  function getConfig(): IAppModelConfig {
    switch (dataType) {
      case AppDataTypeEnum.METRICS: {
        const config: IAppModelConfig = {
          liveUpdate: {
            delay: 10000,
            enabled: false,
          },
        };
        if (grouping) {
          config.grouping = {
            color: [],
            stroke: [],
            chart: ['name'],
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
            resizeMode: TABLE_DEFAULT_CONFIG.metrics.resizeMode,
            rowHeight: TABLE_DEFAULT_CONFIG.metrics.rowHeight,
            sortFields: [...TABLE_DEFAULT_CONFIG.metrics.sortFields],
            hiddenMetrics: [...TABLE_DEFAULT_CONFIG.metrics.hiddenMetrics],
            hiddenColumns: [...TABLE_DEFAULT_CONFIG.metrics.hiddenColumns],
            columnsWidths: { tags: 300 },
            columnsOrder: {
              left: [...TABLE_DEFAULT_CONFIG.metrics.columnsOrder.left],
              middle: [...TABLE_DEFAULT_CONFIG.metrics.columnsOrder.middle],
              right: [...TABLE_DEFAULT_CONFIG.metrics.columnsOrder.right],
            },
            height: TABLE_DEFAULT_CONFIG.metrics.height,
          };
        }
        if (components?.charts?.[0]) {
          if (components.charts.indexOf(ChartTypeEnum.LineChart) !== -1) {
            config.chart = {
              highlightMode: CONTROLS_DEFAULT_CONFIG.metrics.highlightMode,
              ignoreOutliers: CONTROLS_DEFAULT_CONFIG.metrics.ignoreOutliers,
              zoom: {
                active: CONTROLS_DEFAULT_CONFIG.metrics.zoom.active,
                mode: CONTROLS_DEFAULT_CONFIG.metrics.zoom.mode,
                history: [],
              },
              axesScaleType: {
                xAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.xAxis,
                yAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.yAxis,
              },
              axesScaleRange: {
                yAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange.yAxis,
                xAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange.xAxis,
              },
              smoothing: {
                algorithm: CONTROLS_DEFAULT_CONFIG.metrics.smoothing.algorithm,
                factor: CONTROLS_DEFAULT_CONFIG.metrics.smoothing.factor,
                curveInterpolation:
                  CONTROLS_DEFAULT_CONFIG.metrics.smoothing.curveInterpolation,
                isApplied: CONTROLS_DEFAULT_CONFIG.metrics.smoothing.isApplied,
              },
              alignmentConfig: {
                metric: CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.metric,
                type: CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.type,
              },
              densityType: CONTROLS_DEFAULT_CONFIG.metrics.densityType,
              aggregationConfig: {
                methods: {
                  area: CONTROLS_DEFAULT_CONFIG.metrics.aggregationConfig
                    .methods.area,
                  line: CONTROLS_DEFAULT_CONFIG.metrics.aggregationConfig
                    .methods.line,
                },
                isApplied:
                  CONTROLS_DEFAULT_CONFIG.metrics.aggregationConfig.isApplied,
                isEnabled:
                  CONTROLS_DEFAULT_CONFIG.metrics.aggregationConfig.isEnabled,
              },
              tooltip: {
                appearance: CONTROLS_DEFAULT_CONFIG.metrics.tooltip.appearance,
                display: CONTROLS_DEFAULT_CONFIG.metrics.tooltip.display,
                selectedFields:
                  CONTROLS_DEFAULT_CONFIG.metrics.tooltip.selectedFields,
              },
              legends: {
                display: CONTROLS_DEFAULT_CONFIG.metrics.legends.display,
                mode: CONTROLS_DEFAULT_CONFIG.metrics.legends.mode,
              },
              focusedState: {
                key: null,
                xValue: null,
                yValue: null,
                active: false,
                chartIndex: null,
              },
            };
          }
        }

        if (selectForm) {
          config.select = {
            options: [],
            query: '',
            advancedMode: false,
            advancedQuery: '',
          };
        }
        return config;
      }
      case AppDataTypeEnum.RUNS: {
        const config: IAppModelConfig = {
          liveUpdate: {
            delay: 10000,
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
            rowHeight: TABLE_DEFAULT_CONFIG.runs.rowHeight,
            hideSystemMetrics: TABLE_DEFAULT_CONFIG.runs.hideSystemMetrics,
            hiddenMetrics: TABLE_DEFAULT_CONFIG.runs.hiddenMetrics,
            hiddenColumns: TABLE_DEFAULT_CONFIG.runs.hiddenColumns,
            sortFields: [...TABLE_DEFAULT_CONFIG.runs.sortFields],
            columnsWidths: { tags: 300 },
            columnsColorScales: {},
            columnsOrder: {
              left: [...TABLE_DEFAULT_CONFIG.runs.columnsOrder.left],
              middle: [...TABLE_DEFAULT_CONFIG.runs.columnsOrder.middle],
              right: [...TABLE_DEFAULT_CONFIG.runs.columnsOrder.right],
            },
            resizeMode: TABLE_DEFAULT_CONFIG.runs.resizeMode,
            height: TABLE_DEFAULT_CONFIG.runs.height,
          };
          if (appName === AppNameEnum.RUNS) {
            config.pagination = {
              limit: 45,
              offset: null,
              isLatest: false,
            };
          }
        }
        if (components?.charts?.[0]) {
          if (components.charts.indexOf(ChartTypeEnum.HighPlot) !== -1) {
            config.chart = {
              curveInterpolation:
                CONTROLS_DEFAULT_CONFIG.params.curveInterpolation,
              isVisibleColorIndicator:
                CONTROLS_DEFAULT_CONFIG.params.isVisibleColorIndicator,
              focusedState: {
                key: null,
                xValue: null,
                yValue: null,
                active: false,
                chartIndex: null,
              },
              tooltip: {
                appearance: CONTROLS_DEFAULT_CONFIG.params.tooltip.appearance,
                display: CONTROLS_DEFAULT_CONFIG.params.tooltip.display,
                selectedFields:
                  CONTROLS_DEFAULT_CONFIG.params.tooltip.selectedFields,
              },
              brushExtents: {},
            };
          }
          if (components.charts.indexOf(ChartTypeEnum.ScatterPlot) !== -1) {
            config.table = {
              ...config?.table!,
              resizeMode: TABLE_DEFAULT_CONFIG.scatters.resizeMode,
            };
            config.chart = {
              focusedState: {
                key: null,
                xValue: null,
                yValue: null,
                active: false,
                chartIndex: null,
              },
              tooltip: {
                appearance: CONTROLS_DEFAULT_CONFIG.scatters.tooltip.appearance,
                display: CONTROLS_DEFAULT_CONFIG.scatters.tooltip.display,
                selectedFields:
                  CONTROLS_DEFAULT_CONFIG.scatters.tooltip.selectedFields,
              },
              trendlineOptions: {
                type: CONTROLS_DEFAULT_CONFIG.scatters.trendlineOptions.type,
                bandwidth:
                  CONTROLS_DEFAULT_CONFIG.scatters.trendlineOptions.bandwidth,
                isApplied:
                  CONTROLS_DEFAULT_CONFIG.scatters.trendlineOptions.isApplied,
              },
            };
          }
        }
        if (selectForm) {
          config.select = {
            options: [],
            query: '',
            advancedMode: false,
            advancedQuery: '',
          };
        }
        //TODO solve the problem with keeping table config after switching from Scatters explore to Params explore. But the solution is temporal
        return _.cloneDeep(config);
      }
      default:
        return {};
    }
  }

  function setModelDefaultAppConfigData(
    recoverTableState: boolean = true,
  ): void {
    setDefaultAppConfigData({
      config: getConfig(),
      appInitialConfig: appConfig,
      model,
      recoverTableState,
    });
  }

  function getModelAppConfigData(appId: string): IApiRequest<void> {
    return getAppConfigData({ appId, appRequest, config: getConfig(), model });
  }

  // ************ Metrics App Model Methods

  function getMetricsAppModelMethods() {
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
        state.refs = {
          ...state.refs,
          chartPanelRef: { current: null },
        };
      }
      model.setState({ ...state });
      if (!appId) {
        setModelDefaultAppConfigData();
      }

      projectsService
        .getProjectParams(['metric'])
        .call()
        .then((data) => {
          const advancedSuggestions: Record<any, any> = getAdvancedSuggestion(
            data.metric,
          );
          model.setState({
            selectFormData: {
              options: getSelectOptions(data, true),
              suggestions: getSuggestionsByExplorer(appName, data),
              advancedSuggestions: {
                ...getSuggestionsByExplorer(appName, data),
                metric: {
                  name: '',
                  context: _.isEmpty(advancedSuggestions)
                    ? ''
                    : { ...advancedSuggestions },
                },
              },
            },
          });
        });
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
      setRequestProgress(model);
      model.setState({
        requestStatus: RequestStatusEnum.Ok,
      });
      onModelNotificationAdd({
        id: Date.now(),
        severity: 'info',
        messages: ['Request has been cancelled'],
      });
    }

    function getMetricsData(
      shouldUrlUpdate?: boolean,
      shouldResetSelectedRows?: boolean,
      queryString?: string,
    ): IApiRequest<void> {
      if (metricsRequestRef) {
        metricsRequestRef.abort();
      }
      const configData = model.getState()?.config;

      const metric = configData?.chart?.alignmentConfig?.metric;

      if (queryString) {
        if (configData.select.advancedMode) {
          configData.select.advancedQuery = queryString;
        } else {
          configData.select.query = queryString;
        }
      }
      let query = getQueryStringFromSelect(configData?.select);
      metricsRequestRef = metricsService.getMetricsData({
        q: query,
        p: configData?.chart?.densityType,
        ...(metric ? { x_axis: metric } : {}),
      });

      setRequestProgress(model);
      return {
        call: async () => {
          if (query === '()') {
            resetModelState(configData, shouldResetSelectedRows!);
          } else {
            model.setState({
              requestStatus: RequestStatusEnum.Pending,
              queryIsEmpty: false,
              selectedRows: shouldResetSelectedRows
                ? {}
                : model.getState()?.selectedRows,
            });
            liveUpdateInstance?.stop().then();
            try {
              const stream = await metricsRequestRef.call((detail) => {
                exceptionHandler({ detail, model });
                resetModelState(configData, shouldResetSelectedRows!);
              });
              const runData = await getRunData(stream, (progress) =>
                setRequestProgress(model, progress),
              );
              if (shouldUrlUpdate) {
                updateURL({ configData, appName });
              }
              saveRecentSearches(appName, query);
              updateData(runData);
            } catch (ex: Error | any) {
              if (ex.name === 'AbortError') {
                // Abort Error
              } else {
                // eslint-disable-next-line no-console
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

    function resetModelState(
      configData: any,
      shouldResetSelectedRows: boolean,
    ) {
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
        queryIsEmpty: true,
        rawData: [],
        tableColumns: [],
        selectFormData: {
          ...model.getState().selectFormData,
          error: null,
          advancedError: null,
        },
        selectedRows: shouldResetSelectedRows
          ? {}
          : model.getState()?.selectedRows,
        ...state,
      });
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

      const columnsFlattenValues: { [key: string]: Set<any> } = {};
      processedData.forEach(
        (metricsCollection: IMetricsCollection<IMetric>) => {
          const groupKey = metricsCollection.key;
          const columnsValues: { [key: string]: string[] } = {};

          if (metricsCollection.config !== null) {
            const groupConfigData: { [key: string]: unknown } = {};
            for (let key in metricsCollection.config) {
              groupConfigData[getValueByField(groupingSelectOptions, key)] =
                metricsCollection.config[key];
            }
            const groupHeaderRow = {
              meta: {
                chartIndex: config?.grouping?.chart?.length
                  ? metricsCollection.chartIndex + 1
                  : null,
                //ToDo reverse mode
                // config?.grouping?.reverseMode?.chart
                //   ? metricsCollection.chartIndex + 1
                //   : null,
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
              description: '',
              date: '',
              run: '',
              hash: '',
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
                : getClosestValue(
                    metric.data.xValues as number[],
                    xValue as number,
                  ).index;
            const rowValues: IMetricTableRowData = {
              rowMeta: {
                color: metricsCollection.color ?? metric.color,
              },
              key: metric.key,
              selectKey: `${metric.run.hash}/${metric.key}`,
              hash: metric.run.hash,
              isHidden: metric.isHidden,
              index: rowIndex,
              color: metricsCollection.color ?? metric.color,
              dasharray: metricsCollection.dasharray ?? metric.dasharray,
              experiment: metric.run.props?.experiment?.name ?? 'default',
              experimentId: metric.run.props?.experiment?.id ?? '',
              experiment_description:
                metric.run.props?.experiment?.description ?? '-',
              run: metric.run.props?.name ?? '-',
              description: metric.run.props?.description ?? '-',
              date: moment(metric.run.props.creation_time * 1000).format(
                TABLE_DATE_FORMAT,
              ),
              tags: metric.run.props.tags.map((tag: ITagProps) => ({
                archived: false,
                color: tag.color,
                id: tag.id,
                comment: tag.description,
                name: tag.name,
                run_count: 0,
              })),
              duration: processDurationTime(
                metric.run.props.creation_time * 1000,
                metric.run.props.end_time
                  ? metric.run.props.end_time * 1000
                  : Date.now(),
              ),
              active: metric.run.props.active,
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
                  min: formatValue(
                    metricsCollection.aggregation!.area.min?.yValues[
                      closestIndex
                    ],
                  ),
                  max: formatValue(
                    metricsCollection.aggregation!.area.max?.yValues[
                      closestIndex
                    ],
                  ),
                },
                line: formatValue(
                  metricsCollection.aggregation!.line?.yValues[closestIndex],
                ),
              };
              if (
                config.chart?.aggregationConfig?.methods.area ===
                AggregationAreaMethods.STD_DEV
              ) {
                rows[groupKey!].data.aggregation.area.stdDevValue = formatValue(
                  metricsCollection.aggregation!.area.stdDevValue?.yValues[
                    closestIndex
                  ],
                );
              }
              if (
                config.chart?.aggregationConfig?.methods.area ===
                AggregationAreaMethods.STD_ERR
              ) {
                rows[groupKey!].data.aggregation.area.stdErrValue = formatValue(
                  metricsCollection.aggregation!.area.stdErrValue?.yValues[
                    closestIndex
                  ],
                );
              }
            }

            [
              'experiment',
              'description',
              'date',
              'duration',
              'run',
              'hash',
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
                  : metricsTableRowRenderer(rowValues, onModelRunsTagsChange, {
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
                  : metricsTableRowRenderer(rowValues, onModelRunsTagsChange, {
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
            columnsFlattenValues[columnKey] = new Set([
              ...(columnsFlattenValues[columnKey] || []),
              ...(columnsValues[columnKey] || []),
            ]);

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
              onModelRunsTagsChange,
              {},
              true,
              ['value', 'groups'].concat(Object.keys(columnsValues)),
            );
          }
        },
      );
      for (let columnKey in columnsFlattenValues) {
        if (columnsFlattenValues[columnKey].size === 1) {
          sameValueColumns.push(columnKey);
        }
      }
      return { rows, sameValueColumns };
    }

    function processData(data: ISequence<IMetricTrace>[]): {
      data: IMetricsCollection<IMetric>[];
      params: string[];
      runProps: string[];
      highLevelParams: string[];
      contexts: string[];
      selectedRows: any;
    } {
      const configData = model.getState()?.config;
      let selectedRows = model.getState()?.selectedRows;
      let metrics: IMetric[] = [];
      let runParams: string[] = [];
      let runProps: string[] = [];
      let highLevelParams: string[] = [];
      let contexts: string[] = [];
      const paletteIndex: number = configData?.grouping?.paletteIndex || 0;

      data?.forEach((run: ISequence<IMetricTrace>, index) => {
        runParams = runParams.concat(getObjectPaths(run.params, run.params));
        runProps = runProps.concat(getObjectPaths(run.props, run.props));
        highLevelParams = highLevelParams.concat(
          getObjectPaths(run.params, run.params, '', false, true),
        );
        metrics = metrics.concat(
          run.traces.map((trace: IMetricTrace) => {
            contexts = contexts.concat(
              getObjectPaths(trace.context, trace.context),
            );
            const {
              values,
              steps,
              epochs,
              timestamps,
              x_axis_values,
              x_axis_iters,
            } = filterMetricsData(
              trace,
              configData?.chart?.alignmentConfig.type,
              configData?.chart?.axesScaleType,
            );

            let processedValues = [...values];
            if (configData?.chart?.smoothing.isApplied) {
              processedValues = getSmoothenedData({
                smoothingAlgorithm: configData?.chart.smoothing.algorithm,
                smoothingFactor: configData.chart.smoothing.factor,
                data: processedValues,
              });
            }
            const metricKey = encode({
              runHash: run.hash,
              metricName: trace.name,
              traceContext: trace.context,
            });
            const metricValues = new Float64Array(processedValues);
            return createMetricModel({
              ...trace,
              run: createRunModel(_.omit(run, 'traces') as IRun<IMetricTrace>),
              key: metricKey,
              dasharray: 'none',
              color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
              isHidden: configData?.table?.hiddenMetrics!.includes(metricKey),
              x_axis_values,
              x_axis_iters,
              lastValue: metricValues[metricValues.length - 1],
              data: {
                values: metricValues,
                steps,
                epochs,
                timestamps,
                xValues: [...steps],
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
            (f: SortField) => (metric: IMetric) =>
              getValue(metric, f.value, ''),
          ),
          sortFields?.map((f: SortField) => f.order),
        ),
      );
      const uniqParams = _.uniq(runParams).sort();
      const uniqHighLevelParams = _.uniq(highLevelParams).sort();
      const uniqContexts = _.uniq(contexts).sort();
      const uniqProps = _.uniq(runProps).sort();

      const mappedData: Record<string, any> = {};

      for (let metric of metrics) {
        mappedData[metric.run.hash] = {
          runHash: metric.run.hash,
          ...metric.run.props,
          ...metric,
        };
      }

      let selected: Record<string, any> = {};

      if (selectedRows && !_.isEmpty(selectedRows)) {
        for (let rowKey in selectedRows) {
          const slicedKey = rowKey.slice(0, rowKey.indexOf('/'));
          if (mappedData[slicedKey])
            selected[rowKey] = {
              selectKey: rowKey,
              ...mappedData[slicedKey],
            };
        }
      }

      selectedRows = selected;

      return {
        data: processedData,
        params: uniqParams,
        highLevelParams: uniqHighLevelParams,
        contexts: uniqContexts,
        runProps: uniqProps,
        selectedRows,
      };
    }

    function updateModelData(
      configData = model.getState()!.config!,
      shouldURLUpdate?: boolean,
    ): void {
      const {
        data,
        params,
        runProps,
        highLevelParams,
        contexts,
        selectedRows,
      } = processData(model.getState()?.rawData as ISequence<IMetricTrace>[]);
      const sortedParams = [...new Set(params.concat(highLevelParams))].sort();
      const groupingSelectOptions = [
        ...getGroupingSelectOptions({
          params: sortedParams,
          runProps,
          contexts,
          sequenceName: 'metric',
        }),
      ];
      const sortOptions = [
        ...groupingSelectOptions,
        {
          group: 'metric',
          label: 'metric.values.last',
          value: 'lastValue',
        },
      ];

      const legendsData = getLegendsData(
        data,
        groupingSelectOptions,
        configData?.grouping,
        [GroupNameEnum.COLOR, GroupNameEnum.STROKE, GroupNameEnum.CHART],
      );

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

      model.getState()?.refs?.tableRef.current?.updateData({
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
        chartTitleData: getChartTitleData<IMetric, IAppModelState>({
          processedData: data,
          groupingSelectOptions,
          model: model as IModel<IMetricAppModelState>,
        }),
        aggregatedData: getAggregatedData<Partial<IMetricAppModelState>>({
          processedData: data,
          model: model as IModel<IMetricAppModelState>,
        }),
        legendsData,
        tableData: tableData.rows,
        tableColumns,
        sameValueColumns: tableData.sameValueColumns,
        groupingSelectOptions,
        sortOptions,
        selectedRows,
      });
    }

    function setModelData(
      rawData: ISequence<IMetricTrace>[],
      configData: IAppModelConfig,
    ): void {
      const modelState: IAppModelState = model.getState();
      const sortFields = modelState?.config?.table?.sortFields;
      const {
        data,
        runProps,
        params,
        highLevelParams,
        contexts,
        selectedRows,
      } = processData(rawData);
      const sortedParams = [...new Set(params.concat(highLevelParams))].sort();

      if (configData) {
        setAggregationEnabled({ model, appName });
      }
      const groupingSelectOptions = [
        ...getGroupingSelectOptions({
          runProps,
          params: sortedParams,
          contexts,
          sequenceName: 'metric',
        }),
      ];
      const sortOptions = [
        ...groupingSelectOptions,
        {
          group: 'metric',
          label: 'metric.values.last',
          value: 'lastValue',
        },
      ];

      const legendsData = getLegendsData(
        data,
        groupingSelectOptions,
        configData?.grouping,
        [GroupNameEnum.COLOR, GroupNameEnum.STROKE, GroupNameEnum.CHART],
      );

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

      modelState?.refs?.tableRef.current?.updateData({
        newData: tableData.rows,
        newColumns: tableColumns,
      });

      model.setState({
        requestStatus: RequestStatusEnum.Ok,
        rawData,
        config: configData,
        params,
        data,
        selectFormData: {
          ...modelState?.selectFormData,
          [configData.select?.advancedMode ? 'advancedError' : 'error']: null,
        },
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
        legendsData,
        tableData: tableData.rows,
        tableColumns: tableColumns,
        sameValueColumns: tableData.sameValueColumns,
        groupingSelectOptions,
        sortOptions,
        selectedRows,
      });
    }

    function alignData(
      data: IMetricsCollection<IMetric>[],
      type: AlignmentOptionsEnum = model.getState()!.config!.chart
        ?.alignmentConfig.type,
    ): IMetricsCollection<IMetric>[] {
      const alignmentObj: { [key: string]: Function } = {
        [AlignmentOptionsEnum.STEP]: alignByStep,
        [AlignmentOptionsEnum.EPOCH]: alignByEpoch,
        [AlignmentOptionsEnum.RELATIVE_TIME]: alignByRelativeTime,
        [AlignmentOptionsEnum.ABSOLUTE_TIME]: alignByAbsoluteTime,
        [AlignmentOptionsEnum.CUSTOM_METRIC]: alignByCustomMetric,
        default: () => {
          throw new Error('Unknown value for X axis alignment');
        },
      };
      const alignment = alignmentObj[type] || alignmentObj.default;
      return alignment(data, model);
    }

    function groupData(data: IMetric[]): IMetricsCollection<IMetric>[] {
      const configData = model.getState()!.config;
      const grouping = configData!.grouping;
      const { paletteIndex = 0 } = grouping || {};
      const groupByColor = getFilteredGroupingOptions({
        groupName: GroupNameEnum.COLOR,
        model,
      });
      const groupByStroke = getFilteredGroupingOptions({
        groupName: GroupNameEnum.STROKE,
        model,
      });
      const groupByChart = getFilteredGroupingOptions({
        groupName: GroupNameEnum.CHART,
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
      onCopyToClipBoard(query, false, () => onNotificationAdd, {
        notification: {
          id: Date.now(),
          severity: 'success',
          messages: ['Run Expression Copied'],
        },
        model,
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
                dasharray: metricsCollection.dasharray ?? metric.dasharray,
                chartIndex: metricsCollection.chartIndex,
                selectors: [
                  metric.key,
                  metric.key,
                  encode({ runHash: metric.run.hash }),
                ],
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
          : [
              Array.isArray(tableData.rows)
                ? tableData.rows
                : tableData.rows[Object.keys(tableData.rows)[0]].items,
            ];

      const dataToExport: { [key: string]: string }[] = [];

      groupedRows?.forEach(
        (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
          groupedRow?.forEach((row: IMetricTableRowData) => {
            const filteredRow = getFilteredRow<IMetricTableRowData>({
              columnKeys: filteredHeader,
              row,
            });
            dataToExport.push(filteredRow);
          });
          if (groupedRows?.length - 1 !== groupedRowIndex) {
            dataToExport.push(emptyRow);
          }
        },
      );

      const blob = new Blob([JsonToCSV(dataToExport)], {
        type: 'text/csv;charset=utf-8;',
      });
      saveAs(blob, `${appName}-${moment().format(DATE_EXPORTING_FORMAT)}.csv`);
      analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
    }

    const onActivePointChange = _.debounce(
      (
        activePoint: IActivePoint,
        focusedStateActive: boolean = false,
      ): void => {
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
          let configData = config;
          if (configData?.chart) {
            // TODO remove this later
            // remove unnecessary content prop from tooltip config
            if (configData.chart.tooltip?.hasOwnProperty('content')) {
              delete configData.chart.tooltip.content;
            }

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
                  visId: activePoint.visId || `${activePoint.chartIndex}`,
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

          const tooltipData = {
            ...configData?.chart?.tooltip,
            content: getTooltipContent({
              groupingNames: [
                GroupNameEnum.COLOR,
                GroupNameEnum.STROKE,
                GroupNameEnum.CHART,
              ],
              groupingSelectOptions,
              data,
              configData,
              activePointKey: configData.chart?.focusedState?.key,
              selectedFields: configData.chart?.tooltip?.selectedFields,
            }),
          };
          model.setState({ config: configData, tooltip: tooltipData });
        }
      },
      50,
    );

    function onModelRunsTagsChange(runHash: string, tags: ITagInfo[]): void {
      onRunsTagsChange({ runHash, tags, model, updateModelData });
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

    function archiveRuns(ids: string[], archived: boolean): IApiRequest<void> {
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
              ANALYTICS_EVENT_KEYS[appName].table.archiveRunsBatch,
            );
          }
        },
        abort: runsArchiveRef.abort,
      };
    }

    function deleteRuns(ids: string[]): IApiRequest<void> {
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
      onRunsTagsChange: onModelRunsTagsChange,
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
        onGroupingReset(groupName: GroupNameEnum): void {
          onGroupingReset({
            groupName,
            model,
            appName,
            updateModelData,
            setAggregationEnabled,
          });
        },
        onGroupingApplyChange(groupName: GroupNameEnum): void {
          onGroupingApplyChange({
            groupName,
            model,
            appName,
            updateModelData,
            setAggregationEnabled,
          });
        },
        onGroupingPersistenceChange(groupName: GroupNameEnum): void {
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
        onSmoothingChange(args: Partial<ISmoothing>): void {
          onSmoothingChange({ args, model, appName, updateModelData });
        },
        onIgnoreOutliersChange(): void {
          onIgnoreOutliersChange({ model, updateModelData, appName });
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
        onChangeTooltip(tooltip: Partial<ITooltip>): void {
          onChangeTooltip({
            tooltip,
            groupingNames: [
              GroupNameEnum.COLOR,
              GroupNameEnum.STROKE,
              GroupNameEnum.CHART,
            ],
            model,
            appName,
          });
        },
        onAxesScaleRangeChange(range: Partial<IAxesScaleRange>): void {
          onAxesScaleRangeChange({ range, model, appName });
        },
        onDensityTypeChange(type: DensityOptions): Promise<void> {
          return onDensityTypeChange({ type, model, appName, getMetricsData });
        },
        onLegendsChange(legends: Partial<LegendsConfig>): void {
          onLegendsChange({ legends, model, appName, updateModelData });
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
        onRowSelect({
          actionType,
          data,
        }: {
          actionType: 'single' | 'selectAll' | 'removeAll';
          data?: any;
        }): void {
          return onRowSelect({ actionType, data, model });
        },
        onRowsVisibilityChange(metricKeys: string[]): void {
          return onRowsVisibilityChange({
            metricKeys,
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
      case AppNameEnum.SCATTERS:
        return getScattersModelMethods();
      default:
        return {};
    }

    // ************ Runs App Model Methods

    function getRunsModelMethods() {
      let runsRequestRef: {
        call: (
          exceptionHandler: (detail: any) => void,
        ) => Promise<ReadableStream<IRun<IParamTrace>[]>>;
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
      let liveUpdateInstance: LiveUpdateService | null;
      let updateTableTimeoutId: number;

      function initialize(appId: string = '') {
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
          state.refs = {
            ...state.refs,
            chartPanelRef: { current: null },
          };
        }
        model.setState({ ...state });
        if (!appId) {
          setModelDefaultAppConfigData();
        }

        const liveUpdateState = model.getState()?.config.liveUpdate;
        projectsService
          .getProjectParams(['metric'])
          .call()
          .then((data) => {
            model.setState({
              selectFormData: {
                suggestions: getSuggestionsByExplorer(appName, data),
              },
            });
          });
        if (liveUpdateState?.enabled) {
          liveUpdateInstance = new LiveUpdateService(
            appName,
            updateData,
            liveUpdateState.delay,
          );
        }
        try {
          getRunsData().call((detail) => {
            exceptionHandler({ detail, model });
          });
        } catch (err: any) {
          onNotificationAdd({
            model,
            notification: {
              id: Date.now(),
              messages: [err.message],
              severity: 'error',
            },
          });
        }
      }

      function abortRequest(): void {
        if (runsRequestRef) {
          runsRequestRef.abort();
        }
        setRequestProgress(model);
        model.setState({
          requestStatus: RequestStatusEnum.Ok,
        });
        onModelNotificationAdd({
          id: Date.now(),
          severity: 'info',
          messages: ['Request has been cancelled'],
        });
      }

      function onModelRunsTagsChange(runHash: string, tags: ITagInfo[]): void {
        onRunsTagsChange({ runHash, tags, model, updateModelData });
      }

      function getRunsData(
        shouldUrlUpdate?: boolean,
        shouldResetSelectedRows?: boolean,
        isInitial = true,
        queryString?: string,
      ): {
        call: (exceptionHandler: (detail: any) => void) => Promise<any>;
        abort: () => void;
      } {
        if (runsRequestRef) {
          runsRequestRef.abort();
        }
        // isInitial: true --> when search button clicked or data is loading at the first time
        const modelState = prepareModelStateToCall(isInitial);
        const configData = modelState?.config;
        if (queryString) {
          configData.select.query = queryString;
        }
        const query = configData?.select?.query || '';
        const pagination = configData?.pagination;

        liveUpdateInstance?.stop().then();

        runsRequestRef = runsService.getRunsData(query, 45, pagination?.offset);
        let limit = pagination.limit;
        setRequestProgress(model);
        return {
          call: async () => {
            try {
              const stream = await runsRequestRef.call((detail) => {
                exceptionHandler({ detail, model });
              });
              let bufferPairs = decodeBufferPairs(
                stream as ReadableStream<any>,
              );
              let decodedPairs = decodePathsVals(bufferPairs);
              let objects = iterFoldTree(decodedPairs, 1);

              const runsData: IRun<IMetricTrace | IParamTrace>[] = isInitial
                ? []
                : modelState?.rawData;
              let count = 0;
              for await (let [keys, val] of objects) {
                const data = { ...(val as any), hash: keys[0] };
                if (data.hash.startsWith('progress')) {
                  const { 0: checked, 1: trackedRuns } = data;
                  setRequestProgress(model, {
                    matched: runsData.length,
                    checked,
                    trackedRuns,
                  });
                } else {
                  if (isInitial) {
                    const runData: any = val;
                    runsData.push({ ...runData, hash: keys[0] } as any);
                  } else {
                    if (count >= 0) {
                      const runData: any = val;
                      runsData.push({ ...runData, hash: keys[0] } as any);
                    }
                  }
                  count++;
                }
              }

              const { data, params, metricsColumns, selectedRows } =
                processData(runsData);
              const tableData = getDataAsTableRows(
                data,
                metricsColumns,
                params,
              );
              const tableColumns = getRunsTableColumns(
                metricsColumns,
                params,
                model.getState()?.config?.table.columnsOrder!,
                model.getState()?.config?.table.hiddenColumns!,
              );
              updateTableData(tableData, tableColumns, configData);

              model.setState({
                data,
                selectedRows: shouldResetSelectedRows
                  ? {}
                  : selectedRows ?? model.getState()?.selectedRows,
                rawData: runsData,
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
              saveRecentSearches(appName, query);
              if (shouldUrlUpdate) {
                updateURL({ configData, appName });
              }
            } catch (ex: Error | any) {
              if (ex.name === 'AbortError') {
                onNotificationAdd({
                  notification: {
                    id: Date.now(),
                    severity: 'error',
                    messages: [`${ex.name}, ${ex.message}`],
                  },
                  model,
                });
              }
            }
            const rowDataLength = model.getState()?.tableData?.length || 0;
            limit = rowDataLength >= 45 ? rowDataLength : 45;
            liveUpdateInstance?.start({
              q: query,
              limit,
            });
          },
          abort: runsRequestRef.abort,
        };
      }

      function updateModelData(
        configData = model.getState()!.config!,
        shouldURLUpdate?: boolean,
      ): void {
        const { data, params, metricsColumns, selectedRows } = processData(
          model.getState()?.rawData,
        );
        const tableData = getDataAsTableRows(data, metricsColumns, params);
        const tableColumns: ITableColumn[] = getRunsTableColumns(
          metricsColumns,
          params,
          configData?.table?.columnsOrder!,
          configData?.table?.hiddenColumns!,
        );
        model.setState({
          config: configData,
          data,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
          selectedRows,
        });
        updateTableData(tableData, tableColumns, configData);
      }

      function updateTableData(
        tableData: {
          rows: any;
          sameValueColumns: string[];
        },
        tableColumns: ITableColumn[],
        configData: IAppModelConfig | any,
      ): void {
        if (updateTableTimeoutId) {
          clearTimeout(updateTableTimeoutId);
        }

        updateTableTimeoutId = window.setTimeout(() => {
          model.setState({ requestStatus: RequestStatusEnum.Ok });
          model.getState()?.refs?.tableRef.current?.updateData({
            newData: tableData.rows,
            newColumns: tableColumns,
            hiddenColumns: configData.table.hiddenColumns!,
          });
        }, 0);
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
          requestStatus: isInitial
            ? RequestStatusEnum.Pending
            : RequestStatusEnum.Ok,
          infiniteIsPending: !isInitial,
        });

        return model.getState();
      }

      function processData(data: any[]): {
        data: any[];
        params: string[];
        runProps: string[];
        metricsColumns: any;
        selectedRows: any;
        runHashArray: string[];
        unselectedRowsCount: number;
      } {
        const grouping = model.getState()?.config?.grouping;
        const paletteIndex: number = grouping?.paletteIndex || 0;
        const metricsColumns: any = {};
        const runHashArray: string[] = [];
        let selectedRows = model.getState()?.selectedRows;
        let runs: IParam[] = [];
        let params: string[] = [];
        let runProps: string[] = [];
        let unselectedRowsCount = 0;
        data?.forEach((run: IRun<IParamTrace>, index) => {
          params = params.concat(getObjectPaths(run.params, run.params));
          runProps = runProps.concat(getObjectPaths(run.props, run.props));
          const metricsLastValues: any = {};
          run.traces.metric.forEach((trace) => {
            metricsColumns[trace.name] = {
              ...metricsColumns[trace.name],
              [contextToString(trace.context) as string]: '-',
            };
            const metricHash = getMetricHash(trace.name, trace.context as any);
            metricsLastValues[metricHash] = trace.last_value.last;
          });
          runHashArray.push(run.hash);
          runs.push({
            run,
            isHidden: false,
            color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
            key: encode({ runHash: run.hash }),
            dasharray: DASH_ARRAYS[0],
            metricsLastValues,
          });
        });
        const processedData = groupData(runs);
        const uniqParams = _.uniq(params).sort();
        const uniqProps = _.uniq(runProps).sort();

        const mappedData =
          data?.reduce((acc: any, item: any) => {
            acc[item.hash] = { runHash: item.hash, ...item.props };
            return acc;
          }, {}) || {};
        if (selectedRows && !_.isEmpty(selectedRows)) {
          selectedRows = Object.keys(selectedRows).reduce(
            (acc: any, key: string) => {
              const slicedKey = key.slice(0, key.indexOf('/'));
              if (runHashArray.includes(slicedKey)) {
                acc[key] = {
                  selectKey: key,
                  ...mappedData[slicedKey],
                };
              } else {
                unselectedRowsCount++;
              }
              return acc;
            },
            {},
          );
        }
        return {
          data: processedData,
          params: uniqParams,
          runProps: uniqProps,
          metricsColumns,
          selectedRows,
          runHashArray,
          unselectedRowsCount,
        };
      }

      function groupData(data: any): IMetricsCollection<IMetric>[] {
        const configData = model.getState()!.config;
        const grouping = configData!.grouping;

        const groupByColor = getFilteredGroupingOptions({
          groupName: GroupNameEnum.COLOR,
          model,
        });
        const groupByStroke = getFilteredGroupingOptions({
          groupName: GroupNameEnum.STROKE,
          model,
        });
        const groupByChart = getFilteredGroupingOptions({
          groupName: GroupNameEnum.CHART,
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

        const rows: any = processedData[0]?.config !== null ? {} : [];
        let rowIndex = 0;
        const sameValueColumns: string[] = [];
        const columnsFlattenValues: { [key: string]: Set<any> } = {};
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
              hash: '',
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
            const metricsRowValues = getMetricsInitialRowData(metricsColumns);
            metric.run.traces.metric.forEach((trace: any) => {
              const metricHash = getMetricHash(trace.name, trace.context);
              metricsRowValues[metricHash] = formatValue(trace.last_value.last);
            });

            const rowValues: any = {
              key: metric.key,
              selectKey: `${metric.run.hash}/${metric.key}`,
              hash: metric.run.hash,
              index: rowIndex,
              color: metricsCollection.color ?? metric.color,
              dasharray: metricsCollection.dasharray ?? metric.dasharray,
              experiment: metric.run.props.experiment?.name ?? 'default',
              experiment_description:
                metric.run.props.experiment?.description ?? '-',
              experimentId: metric.run.props.experiment?.id ?? '',
              run: metric.run.props.name,
              description: metric.run.props?.description ?? '-',

              date: moment(metric.run.props.creation_time * 1000).format(
                TABLE_DATE_FORMAT,
              ),
              duration: processDurationTime(
                metric.run.props.creation_time * 1000,
                metric.run.props.end_time
                  ? metric.run.props.end_time * 1000
                  : Date.now(),
              ),
              active: metric.run.props.active,
              metric: metric.name,
              tags: metric.run.props.tags.map((tag: any) => ({
                archived: false,
                color: tag.color,
                id: tag.id,
                comment: tag.description,
                name: tag.name,
                run_count: 0,
              })),
              ...metricsRowValues,
            };
            rowIndex++;
            [
              'experiment',
              'run',
              'hash',
              'date',
              'duration',
              'description',
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
            if (metricsCollection.config !== null) {
              rows[groupKey!].items.push(
                isRawData
                  ? rowValues
                  : runsTableRowRenderer(rowValues, onModelRunsTagsChange),
              );
            } else {
              rows.push(
                isRawData
                  ? rowValues
                  : runsTableRowRenderer(rowValues, onModelRunsTagsChange),
              );
            }
          });

          for (let columnKey in columnsValues) {
            columnsFlattenValues[columnKey] = new Set([
              ...(columnsFlattenValues[columnKey] || []),
              ...(columnsValues[columnKey] || []),
            ]);

            if (metricsCollection.config !== null) {
              rows[groupKey!].data[columnKey] =
                columnsValues[columnKey].length === 1
                  ? columnsValues[columnKey][0]
                  : columnsValues[columnKey];
            }

            if (metricsCollection.config !== null && !isRawData) {
              rows[groupKey!].data = runsTableRowRenderer(
                rows[groupKey!].data,
                onModelRunsTagsChange,
                true,
                Object.keys(columnsValues),
              );
            }
          }
        });
        for (let columnKey in columnsFlattenValues) {
          if (columnsFlattenValues[columnKey].size === 1) {
            sameValueColumns.push(columnKey);
          }
        }
        return { rows, sameValueColumns };
      }

      function onModelNotificationAdd<N>(
        notification: N & INotification,
      ): void {
        onNotificationAdd({ notification, model });
      }

      function getLastRunsData(
        lastRow: any,
      ):
        | { call: (exception: any) => Promise<void>; abort: () => void }
        | undefined {
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

          return getRunsData(false, false, false);
        }
      }

      function onExportTableData(): void {
        // @TODO need to get data and params from state not from processData
        const { data, params, metricsColumns } = processData(
          model.getState()?.rawData,
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
            : [
                Array.isArray(tableData.rows)
                  ? tableData.rows
                  : tableData.rows[Object.keys(tableData.rows)[0]].items,
              ];

        const dataToExport: { [key: string]: string }[] = [];

        groupedRows?.forEach(
          (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
            groupedRow?.forEach((row: IMetricTableRowData) => {
              const filteredRow = getFilteredRow({
                columnKeys: filteredHeader,
                row,
              });
              dataToExport.push(filteredRow);
            });
            if (groupedRows?.length - 1 !== groupedRowIndex) {
              dataToExport.push(emptyRow);
            }
          },
        );
        const blob = new Blob([JsonToCSV(dataToExport)], {
          type: 'text/csv;charset=utf-8;',
        });
        saveAs(blob, `runs-${moment().format(DATE_EXPORTING_FORMAT)}.csv`);
        analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
      }

      function onModelNotificationDelete(id: number): void {
        onNotificationDelete({ id, model });
      }

      function updateData(newData: any): void {
        const {
          data,
          params,
          metricsColumns,
          selectedRows,
          unselectedRowsCount,
        } = processData(newData);
        if (unselectedRowsCount) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              severity: 'info',
              closeDelay: 5000,
              messages: [
                'Live update: runs have been updated.',
                `${unselectedRowsCount} of selected runs have been left out of the table.`,
              ],
            },
            model,
          });
        }

        const modelState = model.getState() as IRunsAppModelState;
        const tableData = getDataAsTableRows(data, metricsColumns, params);
        const tableColumns = getRunsTableColumns(
          metricsColumns,
          params,
          model.getState()?.config?.table.columnsOrder!,
          model.getState()?.config?.table.hiddenColumns!,
        );
        const lastRowKey = newData[newData.length - 1].hash;
        model.setState({
          requestStatus: RequestStatusEnum.Ok,
          data,
          rowData: newData,
          infiniteIsPending: false,
          tableColumns,
          tableData: tableData.rows,
          selectedRows,
          sameValueColumns: tableData.sameValueColumns,
          config: {
            ...modelState?.config,
            pagination: {
              ...modelState?.config.pagination,
              offset: lastRowKey,
              isLatest: false,
            },
          },
        });

        model.getState()?.refs?.tableRef.current?.updateData({
          newData: tableData.rows,
          newColumns: tableColumns,
          hiddenColumns: modelState?.config.table.hiddenColumns!,
        });
      }

      function destroy(): void {
        runsRequestRef.abort();
        liveUpdateInstance?.clear();
        liveUpdateInstance = null; //@TODO check is this need or not
        model.setState({
          ...model.getState(),
          selectFormData: {
            ...model.getState().selectFormData,
            error: null,
          },
        });
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
          const rowDataLength = model.getState()?.tableData?.length || 0;
          const limit = rowDataLength >= 45 ? rowDataLength : 45;
          liveUpdateInstance = new LiveUpdateService(
            appName,
            updateData,
            config?.delay || liveUpdateConfig?.delay,
          );
          liveUpdateInstance.start({
            q: query,
            limit,
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
          // @ts-ignore
          `${ANALYTICS_EVENT_KEYS[appName].liveUpdate} ${
            config.enabled ? 'on' : 'off'
          }`,
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
                  getRunsData(false, true).call((detail: any) => {
                    exceptionHandler({ detail, model });
                  });
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
                ANALYTICS_EVENT_KEYS.runs.table.archiveRunsBatch,
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
                  getRunsData(false, true).call((detail: any) => {
                    exceptionHandler({ detail, model });
                  });
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
              analytics.trackEvent(
                ANALYTICS_EVENT_KEYS[appName].table.deleteRunsBatch,
              );
            }
          },
          abort: runsDeleteRef.abort,
        };
      }

      const methods = {
        destroy,
        initialize,
        getRunsData,
        abortRequest,
        updateModelData,
        getLastRunsData,
        onExportTableData,
        onNotificationDelete: onModelNotificationDelete,
        setDefaultAppConfigData: setModelDefaultAppConfigData,
        onRunsTagsChange: onModelRunsTagsChange,
        changeLiveUpdateConfig,
        archiveRuns,
        deleteRuns,
      };

      if (grouping) {
        Object.assign(methods, {});
      }
      if (selectForm) {
        Object.assign(methods, {
          onSelectRunQueryChange(query: string): void {
            onSelectRunQueryChange({ query, model });
          },
        });
      }
      if (components?.charts?.[0]) {
        Object.assign(methods, {});
      }
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
          onRowSelect({
            actionType,
            data,
          }: {
            actionType: 'single' | 'selectAll' | 'removeAll';
            data?: any;
          }): void {
            return onRowSelect({ actionType, data, model });
          },
          onToggleColumnsColorScales(colKey: string): void {
            onToggleColumnsColorScales({
              colKey,
              model,
              appName,
              updateModelData,
            });
          },
        });
      }

      return methods;
    }

    // ************ Params App Model Methods

    function getParamsModelMethods() {
      let runsRequestRef: {
        call: (
          exceptionHandler: (detail: any) => void,
        ) => Promise<ReadableStream<IRun<IParamTrace>[]>>;
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
          state.refs = {
            ...state.refs,
            chartPanelRef: { current: null },
          };
        }
        projectsService
          .getProjectParams(['metric'])
          .call()
          .then((data) => {
            model.setState({
              selectFormData: {
                options: getSelectOptions(data),
                suggestions: getSuggestionsByExplorer(appName, data),
              },
            });
          });
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

      function updateData(newData: IRun<IParamTrace>[]): void {
        const configData = model.getState()?.config;
        if (configData) {
          setModelData(newData, configData);
        }
      }

      function abortRequest(): void {
        if (runsRequestRef) {
          runsRequestRef.abort();
        }
        setRequestProgress(model);
        model.setState({
          requestStatus: RequestStatusEnum.Ok,
        });
        onModelNotificationAdd({
          id: Date.now(),
          severity: 'info',
          messages: ['Request has been cancelled'],
        });
      }

      function getParamsData(
        shouldUrlUpdate?: boolean,
        shouldResetSelectedRows?: boolean,
        queryString?: string,
      ): {
        call: () => Promise<void>;
        abort: () => void;
      } {
        if (runsRequestRef) {
          runsRequestRef.abort();
        }
        const configData = { ...model.getState()?.config };
        if (queryString) {
          configData.select.query = queryString;
        }
        runsRequestRef = runsService.getRunsData(configData?.select?.query);
        setRequestProgress(model);
        return {
          call: async () => {
            if (_.isEmpty(configData?.select?.options)) {
              resetModelState(configData, shouldResetSelectedRows!);
            } else {
              model.setState({
                requestStatus: RequestStatusEnum.Pending,
                queryIsEmpty: false,
                selectedRows: shouldResetSelectedRows
                  ? {}
                  : model.getState()?.selectedRows,
              });
              liveUpdateInstance?.stop().then();
              try {
                const stream = await runsRequestRef.call((detail) => {
                  exceptionHandler({ detail, model });
                  resetModelState(configData, shouldResetSelectedRows!);
                });
                const runData = await getRunData(stream, (progress) =>
                  setRequestProgress(model, progress),
                );
                updateData(runData);
                if (shouldUrlUpdate) {
                  updateURL({ configData, appName });
                }
              } catch (ex: Error | any) {
                if (ex.name === 'AbortError') {
                  // Abort Error
                } else {
                  // eslint-disable-next-line no-console
                  console.log('Unhandled error: ', ex);
                }
              }
              liveUpdateInstance?.start({
                q: configData?.select?.query,
              });
            }
          },
          abort: runsRequestRef.abort,
        };
      }

      function resetModelState(
        configData: any,
        shouldResetSelectedRows: boolean,
      ) {
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
          queryIsEmpty: true,
          rawData: [],
          tableColumns: [],
          selectFormData: { ...model.getState().selectFormData, error: null },
          selectedRows: shouldResetSelectedRows
            ? {}
            : model.getState()?.selectedRows,
          ...state,
        });
      }

      function getDataAsTableRows(
        processedData: IMetricsCollection<IParam>[],
        metricsColumns: any,
        paramKeys: string[],
        isRowData: boolean,
        config: IAppModelConfig,
        groupingSelectOptions: IGroupingSelectOption[],
      ): { rows: IMetricTableRowData[] | any; sameValueColumns: string[] } {
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
        const columnsFlattenValues: { [key: string]: Set<any> } = {};

        processedData.forEach(
          (metricsCollection: IMetricsCollection<IParam>) => {
            const groupKey = metricsCollection.key;
            const columnsValues: { [key: string]: string[] } = {};
            if (metricsCollection.config !== null) {
              const groupConfigData: { [key: string]: unknown } = {};
              for (let key in metricsCollection.config) {
                groupConfigData[getValueByField(groupingSelectOptions, key)] =
                  metricsCollection.config[key];
              }
              const groupHeaderRow = {
                meta: {
                  chartIndex: config?.grouping?.chart?.length
                    ? metricsCollection.chartIndex + 1
                    : null,
                  //ToDo reverse mode
                  // config.grouping?.reverseMode?.chart
                  //   ? metricsCollection.chartIndex + 1
                  //   : null,
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
                hash: '',
                description: '',
                experiment_description: '',
                date: '',
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

            metricsCollection.data.forEach((metric: any) => {
              const metricsRowValues = getMetricsInitialRowData(metricsColumns);
              metric.run.traces.metric.forEach((trace: any) => {
                const metricHash = getMetricHash(trace.name, trace.context);
                metricsRowValues[metricHash] = formatValue(
                  trace.last_value.last,
                );
              });
              const rowValues: any = {
                rowMeta: {
                  color: metricsCollection.color ?? metric.color,
                },
                key: metric.key,
                selectKey: `${metric.run.hash}/${metric.key}`,
                hash: metric.run.hash,
                isHidden: metric.isHidden,
                index: rowIndex,
                color: metricsCollection.color ?? metric.color,
                dasharray: metricsCollection.dasharray ?? metric.dasharray,
                experiment: metric.run.props.experiment.name ?? 'default',
                experimentId: metric.run.props.experiment.id ?? '',
                experiment_description:
                  metric.run.props.experiment?.description ?? '-',
                run: metric.run.props?.name ?? '-',
                description: metric.run.props?.description ?? '-',
                date: moment(metric.run.props.creation_time * 1000).format(
                  TABLE_DATE_FORMAT,
                ),
                tags: metric.run.props.tags.map((tag: ITagProps) => ({
                  archived: false,
                  color: tag.color,
                  id: tag.id,
                  comment: tag.description,
                  name: tag.name,
                  run_count: 0,
                })),
                metric: metric.name,
                duration: processDurationTime(
                  metric.run.props.creation_time * 1000,
                  metric.run.props.end_time
                    ? metric.run.props.end_time * 1000
                    : Date.now(),
                ),
                active: metric.run.props.active,
                ...metricsRowValues,
              };
              rowIndex++;

              for (let key in metricsRowValues) {
                columnsValues[key] = ['-'];
              }

              [
                'experiment',
                'run',
                'hash',
                'date',
                'duration',
                'description',
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

              if (metricsCollection.config !== null) {
                rows[groupKey!].items.push(
                  isRowData
                    ? rowValues
                    : paramsTableRowRenderer(rowValues, onModelRunsTagsChange, {
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
                    : paramsTableRowRenderer(rowValues, onModelRunsTagsChange, {
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
              columnsFlattenValues[columnKey] = new Set([
                ...(columnsFlattenValues[columnKey] || []),
                ...(columnsValues[columnKey] || []),
              ]);

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
                onModelRunsTagsChange,
                {},
                true,
                ['groups'].concat(Object.keys(columnsValues)),
              );
            }
          },
        );
        for (let columnKey in columnsFlattenValues) {
          if (columnsFlattenValues[columnKey].size === 1) {
            sameValueColumns.push(columnKey);
          }
        }
        return { rows, sameValueColumns };
      }

      function getDataAsLines(
        processedData: IMetricsCollection<IParam>[],
        configData = model.getState()?.config,
      ): { dimensions: IDimensionsType; data: any }[] {
        if (!processedData || _.isEmpty(configData.select.options)) {
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
                configData.select.options.forEach(
                  ({ type, label, value }: ISelectOption) => {
                    const dimension = dimensionsObject[chartIndex];
                    if (!dimension[label] && type === 'params') {
                      dimension[label] = {
                        values: new Set(),
                        scaleType: ScaleEnum.Linear,
                        displayName: label,
                        dimensionType: 'param',
                      };
                    }
                    if (type === 'metrics') {
                      run.run.traces.metric.forEach((trace: IParamTrace) => {
                        const metricHash = getMetricHash(
                          trace.name,
                          trace.context as any,
                        );
                        const metricLabel = getMetricLabel(
                          trace.name,
                          trace.context as any,
                        );
                        if (
                          trace.name === value?.option_name &&
                          _.isEqual(trace.context, value?.context)
                        ) {
                          values[metricHash] = trace.last_value.last;
                          if (dimension[metricHash]) {
                            dimension[metricHash].values.add(
                              trace.last_value.last,
                            );
                            if (typeof trace.last_value.last === 'string') {
                              dimension[metricHash].scaleType = ScaleEnum.Point;
                            }
                          } else {
                            dimension[metricHash] = {
                              values: new Set().add(trace.last_value.last),
                              scaleType: ScaleEnum.Linear,
                              displayName: metricLabel,
                              dimensionType: 'metric',
                            };
                          }
                        }
                      });
                    } else {
                      const paramValue = getValue(run.run.params, label, '-');
                      const formattedParam = formatValue(paramValue, '-');
                      values[label] = paramValue;
                      if (formattedParam !== '-' && dimension[label]) {
                        if (typeof paramValue !== 'number') {
                          dimension[label].scaleType = ScaleEnum.Point;
                          values[label] = formattedParam;
                        } else if (isNaN(paramValue) || !isFinite(paramValue)) {
                          values[label] = formattedParam;
                          dimension[label].scaleType = ScaleEnum.Point;
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
                  const [minDomain, maxDomain] = minMaxOfArray([
                    ...dimensionsObject[keyOfDimension][key].values,
                  ]);

                  dimensions[key] = {
                    scaleType: dimensionsObject[keyOfDimension][key].scaleType,
                    domainData: [minDomain, maxDomain],
                    displayName:
                      dimensionsObject[keyOfDimension][key].displayName,
                    dimensionType:
                      dimensionsObject[keyOfDimension][key].dimensionType,
                  };
                } else {
                  const numDomain: number[] = [];
                  const strDomain: string[] = [];

                  [...dimensionsObject[keyOfDimension][key].values].forEach(
                    (data) => {
                      if (typeof data === 'number') {
                        numDomain.push(data);
                      } else {
                        strDomain.push(data);
                      }
                    },
                  );

                  // sort domain data
                  numDomain.sort((a, b) => a - b);
                  strDomain.sort();

                  dimensions[key] = {
                    scaleType: dimensionsObject[keyOfDimension][key].scaleType,
                    domainData: numDomain.concat(strDomain as any[]),
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
        configData: IAppModelConfig,
      ): void {
        const {
          data,
          runProps,
          highLevelParams,
          params,
          metricsColumns,
          selectedRows,
        } = processData(rawData);
        const modelState: IAppModelState = model.getState();
        const sortedParams = [
          ...new Set(params.concat(highLevelParams)),
        ].sort();
        const groupingSelectOptions = [
          ...getGroupingSelectOptions({
            params: sortedParams,
            runProps,
          }),
        ];
        const metricsSelectOptions = getMetricsSelectOptions(metricsColumns);
        const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          false,
          configData,
          groupingSelectOptions,
        );
        const sortFields = modelState?.config?.table.sortFields;

        const tableColumns = getParamsTableColumns(
          sortOptions,
          metricsColumns,
          params,
          data[0]?.config,
          configData.table?.columnsOrder!,
          configData.table?.hiddenColumns!,
          sortFields,
          onSortChange,
          configData.grouping as any,
          onModelGroupingSelectChange,
          AppNameEnum.PARAMS,
        );

        modelState?.refs?.tableRef.current?.updateData({
          newData: tableData.rows,
          newColumns: tableColumns,
        });

        if (!_.isEmpty(configData.chart?.brushExtents)) {
          const chart = { ...configData.chart };
          let brushExtents = { ...chart?.brushExtents };
          const resultBrushExtents: any = {};
          const selectOptionList = configData.select?.options.map(
            (option: ISelectOption) => option.key,
          );

          const brushExtentsKeys = Object.keys(brushExtents);
          brushExtentsKeys.forEach((chartIndex: string) => {
            const chartBrushExtents = { ...brushExtents[chartIndex] };
            const chartBrushExtentsKeys = Object.keys(chartBrushExtents);
            const omitKeys = chartBrushExtentsKeys.filter(
              (key: string) => !selectOptionList?.includes(key),
            );
            resultBrushExtents[chartIndex] = _.omit(
              chartBrushExtents,
              omitKeys,
            );
          });
          configData = {
            ...configData,
            chart: { ...configData.chart, brushExtents: resultBrushExtents },
          };
        }

        model.setState({
          requestStatus: RequestStatusEnum.Ok,
          data,
          highPlotData: getDataAsLines(data),
          chartTitleData: getChartTitleData<IParam, IParamsAppModelState>({
            processedData: data,
            groupingSelectOptions,
            model: model as IModel<IParamsAppModelState>,
          }),
          selectFormData: { ...modelState.selectFormData, error: null },
          params,
          selectedRows,
          metricsColumns,
          rawData,
          config: configData,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
          groupingSelectOptions,
          sortOptions,
        });
      }

      function groupData(data: IParam[]): IMetricsCollection<IParam>[] {
        const grouping = model.getState()!.config!.grouping;
        const { paletteIndex } = grouping;
        const groupByColor = getFilteredGroupingOptions({
          groupName: GroupNameEnum.COLOR,
          model,
        });
        const groupByStroke = getFilteredGroupingOptions({
          groupName: GroupNameEnum.STROKE,
          model,
        });
        const groupByChart = getFilteredGroupingOptions({
          groupName: GroupNameEnum.CHART,
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
        runProps: string[];
        highLevelParams: string[];
        metricsColumns: any;
        selectedRows: any;
      } {
        const configData = model.getState()?.config;
        let selectedRows = model.getState()?.selectedRows;
        const grouping = model.getState()?.config?.grouping;
        let runs: IParam[] = [];
        let params: string[] = [];
        let runProps: string[] = [];
        let highLevelParams: string[] = [];
        const paletteIndex: number = grouping?.paletteIndex || 0;
        const metricsColumns: any = {};

        data?.forEach((run: IRun<IParamTrace>, index) => {
          params = params.concat(getObjectPaths(run.params, run.params));
          runProps = runProps.concat(getObjectPaths(run.props, run.props));
          highLevelParams = highLevelParams.concat(
            getObjectPaths(run.params, run.params, '', false, true),
          );
          let metricsLastValues: any = {};
          run.traces.metric.forEach((trace) => {
            metricsColumns[trace.name] = {
              ...metricsColumns[trace.name],
              [contextToString(trace.context) as string]: '-',
            };
            const metricHash = getMetricHash(trace.name, trace.context as any);
            metricsLastValues[metricHash] = trace.last_value.last;
          });
          const paramKey = encode({ runHash: run.hash });

          runs.push({
            run,
            isHidden: configData!.table.hiddenMetrics!.includes(paramKey),
            color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
            key: paramKey,
            metricsLastValues,
            dasharray: DASH_ARRAYS[0],
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
            runs,
            sortFields?.map(
              (f: SortField) =>
                function (run: IParam) {
                  return getValue(run, f.value, '');
                },
            ),
            sortFields?.map((f: SortField) => f.order),
          ),
        );
        const uniqProps = _.uniq(runProps).sort();
        const uniqParams = _.uniq(params).sort();
        const uniqHighLevelParams = _.uniq(highLevelParams).sort();

        const mappedData: Record<string, any> = {};

        for (let run of runs) {
          mappedData[run.run.hash] = {
            runHash: run.run.hash,
            ...run.run.props,
            ...run,
          };
        }

        let selected: Record<string, any> = {};

        if (selectedRows && !_.isEmpty(selectedRows)) {
          for (let rowKey in selectedRows) {
            const slicedKey = rowKey.slice(0, rowKey.indexOf('/'));
            if (mappedData[slicedKey])
              selected[rowKey] = {
                selectKey: rowKey,
                ...mappedData[slicedKey],
              };
          }
        }

        selectedRows = selected;

        return {
          data: processedData,
          runProps: uniqProps,
          params: uniqParams,
          highLevelParams: uniqHighLevelParams,
          metricsColumns,
          selectedRows,
        };
      }

      function onActivePointChange(
        activePoint: IActivePoint,
        focusedStateActive: boolean = false,
      ): void {
        const { refs, config, groupingSelectOptions, data } = model.getState();
        if (config.table.resizeMode !== ResizeModeEnum.Hide) {
          const tableRef: any = refs?.tableRef;
          if (tableRef) {
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
        let configData = config;
        if (configData?.chart) {
          // TODO remove this later
          // remove unnecessary content prop from tooltip config
          if (configData.chart.tooltip?.hasOwnProperty('content')) {
            delete configData.chart.tooltip.content;
          }

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
                visId: activePoint.visId || `${activePoint.chartIndex}`,
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

        const tooltipData = {
          ...configData?.chart?.tooltip,
          content: getTooltipContent({
            groupingNames: [
              GroupNameEnum.COLOR,
              GroupNameEnum.STROKE,
              GroupNameEnum.CHART,
            ],
            groupingSelectOptions,
            data,
            configData,
            activePointKey: configData.chart?.focusedState?.key,
            selectedFields: configData.chart?.tooltip?.selectedFields,
          }),
        };
        model.setState({ config: configData, tooltip: tooltipData });
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
        const metricsSelectOptions = getMetricsSelectOptions(metricsColumns);
        const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

        const tableColumns: ITableColumn[] = getParamsTableColumns(
          sortOptions,
          metricsColumns,
          params,
          data[0]?.config,
          config.table?.columnsOrder!,
          config.table?.hiddenColumns!,
          config.table?.sortFields,
          onSortChange,
          config.grouping as any,
          onModelGroupingSelectChange,
          AppNameEnum.PARAMS,
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
            : [
                Array.isArray(tableData.rows)
                  ? tableData.rows
                  : tableData.rows[Object.keys(tableData.rows)[0]].items,
              ];
        const dataToExport: { [key: string]: string }[] = [];
        groupedRows?.forEach(
          (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
            groupedRow?.forEach((row: IMetricTableRowData) => {
              const filteredRow = getFilteredRow<IMetricTableRowData>({
                columnKeys: filteredHeader,
                row,
              });
              dataToExport.push(filteredRow);
            });
            if (groupedRows?.length - 1 !== groupedRowIndex) {
              dataToExport.push(emptyRow);
            }
          },
        );

        const blob = new Blob([JsonToCSV(dataToExport)], {
          type: 'text/csv;charset=utf-8;',
        });
        saveAs(blob, `params-${moment().format(DATE_EXPORTING_FORMAT)}.csv`);
        analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
      }

      function updateModelData(
        configData = model.getState()!.config!,
        shouldURLUpdate?: boolean,
      ): void {
        const {
          data,
          params,
          runProps,
          highLevelParams,
          metricsColumns,
          selectedRows,
        } = processData(model.getState()?.rawData as IRun<IParamTrace>[]);
        const sortedParams = [
          ...new Set(params.concat(highLevelParams)),
        ].sort();

        const groupingSelectOptions = [
          ...getGroupingSelectOptions({
            params: sortedParams,
            runProps,
          }),
        ];
        const metricsSelectOptions = getMetricsSelectOptions(metricsColumns);
        const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          false,
          configData,
          groupingSelectOptions,
        );
        const tableColumns = getParamsTableColumns(
          sortOptions,
          metricsColumns,
          params,
          data[0]?.config,
          configData.table?.columnsOrder!,
          configData.table?.hiddenColumns!,
          configData.table?.sortFields,
          onSortChange,
          configData.grouping as any,
          onModelGroupingSelectChange,
          AppNameEnum.PARAMS,
        );

        model.getState()?.refs?.tableRef.current?.updateData({
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
          sortOptions,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
          selectedRows,
        });
      }

      function onModelRunsTagsChange(runHash: string, tags: ITagInfo[]): void {
        onRunsTagsChange({ runHash, tags, model, updateModelData });
      }

      function onModelGroupingSelectChange({
        groupName,
        list,
      }: IOnGroupingSelectChangeParams): void {
        let configData = model.getState().config;

        onGroupingSelectChange({
          groupName,
          list,
          model,
          appName,
          updateModelData,
        });
        if (configData?.chart) {
          configData = {
            ...configData,
            chart: {
              ...configData.chart,
              brushExtents: {},
            },
          };
        }

        model.setState({ config: configData });
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

      function onSortChange({
        sortFields,
        order,
        index,
        actionType,
        field,
      }: any): void {
        onTableSortChange({
          sortFields,
          order,
          index,
          field,
          actionType,
          model,
          appName,
          updateModelData,
        });
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
                  getParamsData(false, true).call();
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
                  getParamsData(false, true).call();
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
        getParamsData,
        setDefaultAppConfigData: setModelDefaultAppConfigData,
        abortRequest,
        updateModelData,
        onActivePointChange,
        onExportTableData,
        onBookmarkCreate: onModelBookmarkCreate,
        onBookmarkUpdate: onModelBookmarkUpdate,
        onNotificationAdd: onModelNotificationAdd,
        onNotificationDelete: onModelNotificationDelete,
        onResetConfigData: onModelResetConfigData,
        onRunsTagsChange: onModelRunsTagsChange,
        onSortChange,
        destroy,
        changeLiveUpdateConfig,
        onShuffleChange,
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
            let configData = model.getState().config;

            onGroupingModeChange({
              groupName,
              value,
              model,
              appName,
              updateModelData,
            });
            if (configData?.chart) {
              configData = {
                ...configData,
                chart: {
                  ...configData.chart,
                  brushExtents: {},
                },
              };
            }

            model.setState({ config: configData });
          },
          onGroupingPaletteChange(index: number): void {
            onGroupingPaletteChange({ index, model, appName, updateModelData });
          },
          onGroupingReset(groupName: GroupNameEnum): void {
            let configData = model.getState().config;

            onGroupingReset({ groupName, model, appName, updateModelData });
            if (configData?.chart) {
              configData = {
                ...configData,
                chart: {
                  ...configData.chart,
                  brushExtents: {},
                },
              };
            }

            model.setState({ config: configData });
          },
          onGroupingApplyChange(groupName: GroupNameEnum): void {
            let configData = model.getState().config;

            onGroupingApplyChange({
              groupName,
              model,
              appName,
              updateModelData,
            });
            if (configData?.chart) {
              configData = {
                ...configData,
                chart: {
                  ...configData.chart,
                  brushExtents: {},
                },
              };
            }

            model.setState({ config: configData });
          },
          onGroupingPersistenceChange(groupName: GroupNameEnum): void {
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
          onParamsSelectChange<D>(data: D & Partial<ISelectOption[]>): void {
            onSelectOptionsChange({ data, model });
          },
          onSelectRunQueryChange(query: string): void {
            onSelectRunQueryChange({ query, model });
          },
        });
      }
      if (components?.charts?.[0]) {
        Object.assign(methods, {
          onChangeTooltip(tooltip: Partial<ITooltip>): void {
            onChangeTooltip({
              tooltip,
              groupingNames: [
                GroupNameEnum.COLOR,
                GroupNameEnum.STROKE,
                GroupNameEnum.CHART,
              ],
              model,
              appName,
            });
          },
          onColorIndicatorChange(): void {
            onColorIndicatorChange({ model, appName, updateModelData });
          },
          onCurveInterpolationChange(): void {
            onCurveInterpolationChange({ model, appName, updateModelData });
          },
          onAxisBrushExtentChange(
            key: string,
            extent: [number, number] | null,
            chartIndex: number,
          ): void {
            onAxisBrushExtentChange({
              key,
              extent,
              chartIndex,
              model,
              updateModelData,
            });
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
          onRowSelect({
            actionType,
            data,
          }: {
            actionType: 'single' | 'selectAll' | 'removeAll';
            data?: any;
          }): void {
            return onRowSelect({ actionType, data, model });
          },
          onRowsVisibilityChange(metricKeys: string[]): void {
            return onRowsVisibilityChange({
              metricKeys,
              model,
              appName,
              updateModelData,
            });
          },
        });
      }

      return methods;
    }

    // ************ Scatters App Model Methods

    function getScattersModelMethods() {
      let runsRequestRef: {
        call: (
          exceptionHandler: (detail: any) => void,
        ) => Promise<ReadableStream<IRun<IParamTrace>[]>>;
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
      let liveUpdateInstance: LiveUpdateService | null;

      function initialize(appId: string): void {
        model.init();
        const state: Partial<IScatterAppModelState> = {};
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

        projectsService
          .getProjectParams(['metric'])
          .call()
          .then((data: IProjectParamsMetrics) => {
            model.setState({
              selectFormData: {
                options: getSelectOptions(data),
                suggestions: getSuggestionsByExplorer(appName, data),
              },
            });
          });

        if (liveUpdateState?.enabled) {
          liveUpdateInstance = new LiveUpdateService(
            appName,
            updateData,
            liveUpdateState.delay,
          );
        }
      }

      function updateData(newData: IRun<IParamTrace>[]): void {
        const configData = model.getState()?.config;
        if (configData) {
          setModelData(newData, configData);
        }
      }

      function setModelData(
        rawData: IRun<IParamTrace>[],
        configData: IAppModelConfig,
      ): void {
        const {
          data,
          runProps,
          highLevelParams,
          params,
          metricsColumns,
          selectedRows,
        } = processData(rawData);
        const modelState: IAppModelState = model.getState();
        const sortedParams = [
          ...new Set(params.concat(highLevelParams)),
        ].sort();
        const groupingSelectOptions = [
          ...getGroupingSelectOptions({
            params: sortedParams,
            runProps,
          }),
        ];
        const metricsSelectOptions = getMetricsSelectOptions(metricsColumns);
        const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          false,
          configData,
          groupingSelectOptions,
        );
        const sortFields = modelState?.config?.table.sortFields;

        const tableColumns = getParamsTableColumns(
          sortOptions,
          metricsColumns,
          params,
          data[0]?.config,
          configData.table?.columnsOrder!,
          configData.table?.hiddenColumns!,
          sortFields,
          onSortChange,
          configData.grouping as any,
          onModelGroupingSelectChange,
          AppNameEnum.SCATTERS,
        );

        modelState?.refs?.tableRef.current?.updateData({
          newData: tableData.rows,
          newColumns: tableColumns,
        });

        model.setState({
          requestStatus: RequestStatusEnum.Ok,
          data,
          chartData: getChartData(data),
          chartTitleData: getChartTitleData<IParam, IParamsAppModelState>({
            processedData: data,
            groupingSelectOptions,
            model: model as IModel<IParamsAppModelState>,
          }),
          selectFormData: { ...modelState.selectFormData, error: null },
          params,
          metricsColumns,
          rawData,
          config: configData,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
          groupingSelectOptions,
          sortOptions,
          selectedRows,
        });
      }

      function getChartData(
        processedData: IMetricsCollection<IParam>[],
        configData = model.getState()?.config,
      ): {
        dimensions: IDimensionType[];
        data: IPoint[];
      }[] {
        if (!processedData || _.isEmpty(configData.select.options)) {
          return [];
        }
        const dimensionsByChartIndex: {
          values: number[] | string[];
          scaleType: ScaleEnum;
          displayName: string;
          dimensionType: string;
        }[][] = [];

        const chartData = processedData.map(
          ({ chartIndex, color, data }: IMetricsCollection<IParam>) => {
            if (!dimensionsByChartIndex[chartIndex]) {
              dimensionsByChartIndex[chartIndex] = [];
            }
            const dimension: any = dimensionsByChartIndex[chartIndex];
            return data
              .filter((run) => !run.isHidden)
              .map((run: IParam) => {
                const values: any = [];
                configData.select.options.forEach(
                  ({ type, label, value }: ISelectOption, i: number) => {
                    if (!dimension[i]) {
                      dimension[i] = {
                        values: [],
                        scaleType: ScaleEnum.Linear,
                        displayName: label,
                        dimensionType: 'param',
                      };
                    }
                    if (type === 'metrics') {
                      run.run.traces.metric.forEach((trace: IParamTrace) => {
                        if (
                          trace.name === value?.option_name &&
                          _.isEqual(trace.context, value?.context)
                        ) {
                          let lastValue = trace.last_value.last;
                          const formattedLastValue = formatValue(
                            lastValue,
                            '-',
                          );
                          values[i] = lastValue;
                          if (formattedLastValue !== '-') {
                            const metricLabel = getMetricLabel(
                              trace.name,
                              trace.context as any,
                            );
                            dimension[i].dimensionType = 'metric';
                            dimension[i].displayName = metricLabel;
                            if (typeof lastValue !== 'number') {
                              dimension[i].scaleType = ScaleEnum.Point;
                              values[i] = formattedLastValue;
                            } else if (
                              isNaN(lastValue) ||
                              !isFinite(lastValue)
                            ) {
                              values[i] = formattedLastValue;
                              dimension[i].scaleType = ScaleEnum.Point;
                            }
                            dimension[i].values.push(values[i]);
                          }
                        }
                      });
                    } else {
                      const paramValue = getValue(run.run.params, label, '-');
                      const formattedParam = formatValue(paramValue, '-');
                      values[i] = paramValue;
                      if (formattedParam !== '-') {
                        if (typeof paramValue !== 'number') {
                          dimension[i].scaleType = ScaleEnum.Point;
                          values[i] = formattedParam;
                        } else if (isNaN(paramValue) || !isFinite(paramValue)) {
                          values[i] = formattedParam;
                          dimension[i].scaleType = ScaleEnum.Point;
                        }
                        dimension[i].values.push(values[i]);
                      }
                    }
                  },
                );

                return {
                  chartIndex,
                  key: run.key,
                  groupKey: run.key,
                  color: color ?? run.color,
                  data: {
                    yValues: [values[0] ?? '-'],
                    xValues: [values[1] ?? '-'],
                  },
                };
              });
          },
        );
        const flattedData = chartData.flat();
        const groupedByChartIndex = Object.values(
          _.groupBy(flattedData, 'chartIndex'),
        );

        return dimensionsByChartIndex
          .filter((dimension) => !_.isEmpty(dimension))
          .map((chartDimensions, i: number) => {
            const dimensions: IDimensionType[] = [];
            chartDimensions.forEach((dimension) => {
              if (dimension.scaleType === ScaleEnum.Linear) {
                const [minDomain = '-', maxDomain = '-'] = minMaxOfArray([
                  ...((dimension.values as number[]) || []),
                ]);

                dimensions.push({
                  scaleType: dimension.scaleType,
                  domainData: [minDomain, maxDomain] as string[] | number[],
                  displayName: dimension.displayName,
                  dimensionType: dimension.dimensionType,
                });
              } else {
                const numDomain: number[] = [];
                const strDomain: string[] = [];

                [...dimension.values].forEach((data) => {
                  if (typeof data === 'number') {
                    numDomain.push(data);
                  } else {
                    strDomain.push(data);
                  }
                });

                // sort domain data
                numDomain.sort((a, b) => a - b);
                strDomain.sort();

                dimensions.push({
                  scaleType: dimension.scaleType,
                  domainData: numDomain.concat(strDomain as any[]),
                  displayName: dimension.displayName,
                  dimensionType: dimension.dimensionType,
                });
              }
            });
            return {
              dimensions,
              data: groupedByChartIndex[i],
            };
          });
      }

      function getDataAsTableRows(
        processedData: IMetricsCollection<IParam>[],
        metricsColumns: any,
        paramKeys: string[],
        isRowData: boolean,
        config: IAppModelConfig,
        groupingSelectOptions: IGroupingSelectOption[],
      ): { rows: IMetricTableRowData[] | any; sameValueColumns: string[] } {
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
        const columnsFlattenValues: { [key: string]: Set<any> } = {};

        processedData.forEach(
          (metricsCollection: IMetricsCollection<IParam>) => {
            const groupKey = metricsCollection.key;
            const columnsValues: { [key: string]: string[] } = {};

            if (metricsCollection.config !== null) {
              const groupConfigData: { [key: string]: unknown } = {};
              for (let key in metricsCollection.config) {
                groupConfigData[getValueByField(groupingSelectOptions, key)] =
                  metricsCollection.config[key];
              }
              const groupHeaderRow = {
                meta: {
                  chartIndex: config?.grouping?.chart?.length
                    ? metricsCollection.chartIndex + 1
                    : null,
                  //ToDo reverse mode
                  // config.grouping?.reverseMode?.chart
                  //   ? metricsCollection.chartIndex + 1
                  //   : null,
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
                hash: '',
                dasharray: metricsCollection.dasharray,
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

            metricsCollection.data.forEach((metric: any) => {
              const metricsRowValues = getMetricsInitialRowData(metricsColumns);
              metric.run.traces.metric.forEach((trace: any) => {
                const metricHash = getMetricHash(
                  trace.name,
                  trace.context as any,
                );
                metricsRowValues[metricHash] = formatValue(
                  trace.last_value.last,
                );
              });
              const rowValues: any = {
                rowMeta: {
                  color: metricsCollection.color ?? metric.color,
                },
                key: metric.key,
                selectKey: `${metric.run.hash}/${metric.key}`,
                hash: metric.run.hash,
                isHidden: metric.isHidden,
                index: rowIndex,
                color: metricsCollection.color ?? metric.color,
                dasharray: metricsCollection.dasharray ?? metric.dasharray,
                experiment: metric.run.props.experiment?.name ?? 'default',
                experimentId: metric.run.props.experiment?.id ?? '',
                experiment_description:
                  metric.run.props.experiment?.description ?? '-',
                run: metric.run.props?.name ?? '-',
                description: metric.run.props?.description ?? '-',
                date: moment(metric.run.props.creation_time * 1000).format(
                  TABLE_DATE_FORMAT,
                ),
                tags: metric.run.props.tags.map((tag: ITagProps) => ({
                  archived: false,
                  color: tag.color,
                  id: tag.id,
                  comment: tag.description,
                  name: tag.name,
                  run_count: 0,
                })),
                metric: metric.name,
                duration: processDurationTime(
                  metric.run.props.creation_time * 1000,
                  metric.run.props.end_time
                    ? metric.run.props.end_time * 1000
                    : Date.now(),
                ),
                active: metric.run.props.active,
                ...metricsRowValues,
              };
              rowIndex++;

              for (let key in metricsRowValues) {
                columnsValues[key] = ['-'];
              }

              [
                'experiment',
                'run',
                'hash',
                'metric',
                'context',
                'date',
                'duration',
                'description',
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

              if (metricsCollection.config !== null) {
                rows[groupKey!].items.push(
                  isRowData
                    ? rowValues
                    : paramsTableRowRenderer(rowValues, onModelRunsTagsChange, {
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
                    : paramsTableRowRenderer(rowValues, onModelRunsTagsChange, {
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
              columnsFlattenValues[columnKey] = new Set([
                ...(columnsFlattenValues[columnKey] || []),
                ...(columnsValues[columnKey] || []),
              ]);

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
                onModelRunsTagsChange,
                {},
                true,
                ['groups'].concat(Object.keys(columnsValues)),
              );
            }
          },
        );
        for (let columnKey in columnsFlattenValues) {
          if (columnsFlattenValues[columnKey].size === 1) {
            sameValueColumns.push(columnKey);
          }
        }
        return { rows, sameValueColumns };
      }

      function processData(data: IRun<IParamTrace>[]): {
        data: IMetricsCollection<IParam>[];
        params: string[];
        highLevelParams: string[];
        runProps: string[];
        metricsColumns: any;
        selectedRows: any;
      } {
        const configData = model.getState()?.config;
        let selectedRows = model.getState()?.selectedRows;
        const grouping = configData?.grouping;
        let runs: IParam[] = [];
        let params: string[] = [];
        let runProps: string[] = [];
        let highLevelParams: string[] = [];
        const paletteIndex: number = grouping?.paletteIndex || 0;
        const metricsColumns: any = {};

        data?.forEach((run: IRun<IParamTrace>, index) => {
          params = params.concat(getObjectPaths(run.params, run.params));
          runProps = runProps.concat(getObjectPaths(run.props, run.props));
          highLevelParams = highLevelParams.concat(
            getObjectPaths(run.params, run.params, '', false, true),
          );
          let metricsLastValues: { [key: string]: number | string } = {};

          run.traces.metric.forEach((trace) => {
            metricsColumns[trace.name] = {
              ...metricsColumns[trace.name],
              [contextToString(trace.context) as string]: '-',
            };
            const metricHash = getMetricHash(trace.name, trace.context as any);
            metricsLastValues[metricHash] = trace.last_value.last;
          });
          const paramKey = encode({ runHash: run.hash });
          runs.push({
            run,
            isHidden: configData!.table.hiddenMetrics!.includes(paramKey),
            color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
            key: paramKey,
            metricsLastValues,
            dasharray: DASH_ARRAYS[0],
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
            runs,
            sortFields?.map(
              (f: SortField) =>
                function (run: IParam) {
                  return getValue(run, f.value, '');
                },
            ),
            sortFields?.map((f: SortField) => f.order),
          ),
        );

        const uniqProps = _.uniq(runProps).sort();
        const uniqParams = _.uniq(params).sort();
        const uniqHighLevelParams = _.uniq(highLevelParams).sort();

        const mappedData: Record<string, any> = {};

        for (let run of runs) {
          mappedData[run.run.hash] = {
            runHash: run.run.hash,
            ...run.run.props,
            ...run,
          };
        }

        let selected: Record<string, any> = {};

        if (selectedRows && !_.isEmpty(selectedRows)) {
          for (let rowKey in selectedRows) {
            const slicedKey = rowKey.slice(0, rowKey.indexOf('/'));
            if (mappedData[slicedKey])
              selected[rowKey] = {
                selectKey: rowKey,
                ...mappedData[slicedKey],
              };
          }
        }

        return {
          data: processedData,
          params: uniqParams,
          highLevelParams: uniqHighLevelParams,
          runProps: uniqProps,
          metricsColumns,
          selectedRows,
        };
      }

      function groupData(data: IParam[]): IMetricsCollection<IParam>[] {
        const grouping = model.getState()!.config!.grouping;
        const { paletteIndex } = grouping;
        const groupByColor = getFilteredGroupingOptions({
          groupName: GroupNameEnum.COLOR,
          model,
        });
        const groupByStroke = getFilteredGroupingOptions({
          groupName: GroupNameEnum.STROKE,
          model,
        });
        const groupByChart = getFilteredGroupingOptions({
          groupName: GroupNameEnum.CHART,
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

      function updateModelData(
        configData = model.getState()!.config!,
        shouldURLUpdate?: boolean,
      ): void {
        const {
          data,
          params,
          runProps,
          highLevelParams,
          metricsColumns,
          selectedRows,
        } = processData(model.getState()?.rawData as IRun<IParamTrace>[]);
        const sortedParams = [
          ...new Set(params.concat(highLevelParams)),
        ].sort();
        const groupingSelectOptions = [
          ...getGroupingSelectOptions({
            params: sortedParams,
            runProps,
          }),
        ];
        const metricsSelectOptions = getMetricsSelectOptions(metricsColumns);
        const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

        const tableData = getDataAsTableRows(
          data,
          metricsColumns,
          params,
          false,
          configData,
          groupingSelectOptions,
        );
        const tableColumns = getParamsTableColumns(
          sortOptions,
          metricsColumns,
          params,
          data[0]?.config,
          configData.table?.columnsOrder!,
          configData.table?.hiddenColumns!,
          configData.table?.sortFields,
          onSortChange,
          configData.grouping as any,
          onModelGroupingSelectChange,
          AppNameEnum.SCATTERS,
        );

        model.getState()?.refs?.tableRef.current?.updateData({
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
          chartData: getChartData(data),
          chartTitleData: getChartTitleData<IParam, IScatterAppModelState>({
            processedData: data,
            groupingSelectOptions,
            model: model as IModel<IScatterAppModelState>,
          }),
          groupingSelectOptions,
          sortOptions,
          tableData: tableData.rows,
          tableColumns,
          sameValueColumns: tableData.sameValueColumns,
          selectedRows,
        });
      }

      function abortRequest(): void {
        if (runsRequestRef) {
          runsRequestRef.abort();
        }
        setRequestProgress(model);
        model.setState({
          requestStatus: RequestStatusEnum.Ok,
        });
        onModelNotificationAdd({
          id: Date.now(),
          severity: 'info',
          messages: ['Request has been cancelled'],
        });
      }

      function getScattersData(
        shouldUrlUpdate?: boolean,
        shouldResetSelectedRows?: boolean,
      ): {
        call: () => Promise<void>;
        abort: () => void;
      } {
        if (runsRequestRef) {
          runsRequestRef.abort();
        }
        const configData = { ...model.getState()?.config };

        runsRequestRef = runsService.getRunsData(configData?.select?.query);
        setRequestProgress(model);
        return {
          call: async () => {
            if (_.isEmpty(configData?.select?.options)) {
              resetModelState(configData, shouldResetSelectedRows!);
            } else {
              model.setState({
                requestStatus: RequestStatusEnum.Pending,
                queryIsEmpty: false,
                selectedRows: shouldResetSelectedRows
                  ? {}
                  : model.getState()?.selectedRows,
              });
              liveUpdateInstance?.stop().then();
              try {
                const stream = await runsRequestRef.call((detail) => {
                  exceptionHandler({ detail, model });
                  resetModelState(configData, shouldResetSelectedRows!);
                });
                const runData = await getRunData(stream, (progress) =>
                  setRequestProgress(model, progress),
                );
                updateData(runData);
                if (shouldUrlUpdate) {
                  updateURL({ configData, appName });
                }
                liveUpdateInstance?.start({
                  q: configData?.select?.query,
                });
                //Changed the layout/styles of the experiments and tags tables to look more like lists|| Extend the contributions section (add activity feed under the contributions)
              } catch (ex: Error | any) {
                if (ex.name === 'AbortError') {
                  onNotificationAdd({
                    notification: {
                      messages: [ex.message],
                      id: Date.now(),
                      severity: 'error',
                    },
                    model,
                  });
                }
              }
            }
          },
          abort: runsRequestRef.abort,
        };
      }

      function resetModelState(
        configData: any,
        shouldResetSelectedRows: boolean,
      ): void {
        let state: Partial<IScatterAppModelState> = {};
        if (components?.charts?.indexOf(ChartTypeEnum.ScatterPlot) !== -1) {
          state.chartData = [];
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
          queryIsEmpty: true,
          rawData: [],
          tableColumns: [],
          selectFormData: {
            ...model.getState().selectFormData,
            error: null,
          },
          selectedRows: shouldResetSelectedRows
            ? {}
            : model.getState()?.selectedRows,
          ...state,
        });
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
        const metricsSelectOptions = getMetricsSelectOptions(metricsColumns);
        const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

        const tableColumns: ITableColumn[] = getParamsTableColumns(
          sortOptions,
          metricsColumns,
          params,
          data[0]?.config,
          config.table?.columnsOrder!,
          config.table?.hiddenColumns!,
          config.table?.sortFields,
          onSortChange,
          config.grouping as any,
          onModelGroupingSelectChange,
          AppNameEnum.SCATTERS,
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
            : [
                Array.isArray(tableData.rows)
                  ? tableData.rows
                  : tableData.rows[Object.keys(tableData.rows)[0]].items,
              ];

        const dataToExport: { [key: string]: string }[] = [];

        groupedRows?.forEach(
          (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
            groupedRow?.forEach((row: IMetricTableRowData) => {
              const filteredRow = getFilteredRow<IMetricTableRowData>({
                columnKeys: filteredHeader,
                row,
              });
              dataToExport.push(filteredRow);
            });
            if (groupedRows?.length - 1 !== groupedRowIndex) {
              dataToExport.push(emptyRow);
            }
          },
        );
        const blob = new Blob([JsonToCSV(dataToExport)], {
          type: 'text/csv;charset=utf-8;',
        });
        saveAs(
          blob,
          `${appName}-${moment().format(DATE_EXPORTING_FORMAT)}.csv`,
        );
        analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
      }

      function onActivePointChange(
        activePoint: IActivePoint,
        focusedStateActive: boolean = false,
      ): void {
        const { data, refs, config, groupingSelectOptions } = model.getState();
        if (config.table.resizeMode !== ResizeModeEnum.Hide) {
          const tableRef: any = refs?.tableRef;
          if (tableRef) {
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
        let configData = config;
        if (configData?.chart) {
          // TODO remove this later
          // remove unnecessary content prop from tooltip config
          if (configData.chart.tooltip?.hasOwnProperty('content')) {
            delete configData.chart.tooltip.content;
          }

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

        const tooltipData = {
          ...configData?.chart?.tooltip,
          content: getTooltipContent({
            groupingNames: [GroupNameEnum.COLOR, GroupNameEnum.CHART],
            groupingSelectOptions,
            data,
            configData,
            activePointKey: configData.chart?.focusedState?.key,
            selectedFields: configData.chart?.tooltip?.selectedFields,
          }),
        };
        model.setState({ config: configData, tooltip: tooltipData });
      }

      function onModelRunsTagsChange(runHash: string, tags: ITagInfo[]): void {
        onRunsTagsChange({ runHash, tags, model, updateModelData });
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

      function onSortChange({
        sortFields,
        order,
        index,
        actionType,
        field,
      }: any): void {
        onTableSortChange({
          sortFields,
          order,
          index,
          field,
          actionType,
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

        setItem('scattersLUConfig', encode(newLiveUpdateConfig));
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
                  getScattersData(false, true).call();
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
                  getScattersData(false, true).call();
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
        getScattersData,
        abortRequest,
        setDefaultAppConfigData: setModelDefaultAppConfigData,
        updateModelData,
        onActivePointChange,
        onExportTableData,
        onBookmarkCreate: onModelBookmarkCreate,
        onBookmarkUpdate: onModelBookmarkUpdate,
        onNotificationAdd: onModelNotificationAdd,
        onNotificationDelete: onModelNotificationDelete,
        onResetConfigData: onModelResetConfigData,
        onRunsTagsChange: onModelRunsTagsChange,
        onSortChange,
        destroy,
        changeLiveUpdateConfig,
        archiveRuns,
        deleteRuns,
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
          onGroupingReset(groupName: GroupNameEnum): void {
            onGroupingReset({ groupName, model, appName, updateModelData });
          },
          onGroupingApplyChange(groupName: GroupNameEnum): void {
            onGroupingApplyChange({
              groupName,
              model,
              appName,
              updateModelData,
            });
          },
          onGroupingPersistenceChange(groupName: GroupNameEnum): void {
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
          onSelectOptionsChange<D>(data: D & Partial<ISelectOption[]>): void {
            onSelectOptionsChange({ data, model });
          },
          onSelectRunQueryChange(query: string): void {
            onSelectRunQueryChange({ query, model });
          },
        });
      }
      if (components?.charts?.[0]) {
        Object.assign(methods, {
          onChangeTooltip(tooltip: Partial<ITooltip>): void {
            onChangeTooltip({
              tooltip,
              groupingNames: [GroupNameEnum.COLOR, GroupNameEnum.CHART],
              model,
              appName,
            });
          },
          onChangeTrendlineOptions(
            trendlineOptions: Partial<ITrendlineOptions>,
          ): void {
            onChangeTrendlineOptions({ trendlineOptions, model, appName });
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
          onParamVisibilityChange(metricsKeys: string[]): void {
            onParamVisibilityChange({
              metricsKeys,
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
          onRowsVisibilityChange(metricKeys: string[]): void {
            return onRowsVisibilityChange({
              metricKeys,
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
