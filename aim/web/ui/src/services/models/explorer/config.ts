import _ from 'lodash-es';

import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';
import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { IModel } from 'types/services/models/model';
import {
  IAppInitialConfig,
  IAppModelConfig,
  IAppModelState,
} from 'types/services/models/explorer/createAppModel';
import { IApiRequest } from 'types/services/services';
import { IAppData } from 'types/services/models/metrics/metricsAppModel';

import { ChartTypeEnum } from 'utils/d3';
import setDefaultAppConfigData from 'utils/app/setDefaultAppConfigData';
import getAppConfigData from 'utils/app/getAppConfigData';

import createModel from '../model';

import { AppDataTypeEnum, AppNameEnum } from './index';

function initializeAppModel(appConfig: IAppInitialConfig): InitialAppModelType {
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
            metricsValueKey: TABLE_DEFAULT_CONFIG.runs.metricsValueKey,
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

  return {
    model,
    getConfig,
    setModelDefaultAppConfigData,
    getModelAppConfigData,
  };
}

export type InitialAppModelType = {
  model: IModel<IAppModelState>;
  getConfig: () => IAppModelConfig;
  setModelDefaultAppConfigData: (recoverTableState?: boolean) => void;
  getModelAppConfigData: (appId: string) => IApiRequest<void>;
};

export default initializeAppModel;
