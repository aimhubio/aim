import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';
import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import createModel from 'services/models/model';

import { IAppData } from 'types/services/models/metrics/metricsAppModel';
import { IModel } from 'types/services/models/model';
import {
  IAppInitialConfig,
  IAppModelConfig,
  IAppModelState,
} from 'types/services/models/explorer/createAppModel';

import { ChartTypeEnum } from 'utils/d3';
import setDefaultAppConfigData from 'utils/app/setDefaultAppConfigData';
import getAppConfigData from 'utils/app/getAppConfigData';

import getMetricsModelMethods from './getMetricsModelMethods';
import getParamsModelMethods from './getParamsModelMethods';
import getRunsModelMethods from './getRunsModelMethods';
import getScattersModelMethods from './getScattersModelMethods';

import { AppDataTypeEnum, AppNameEnum } from './index';

/**
 * function createAppModel has 2 major functionalities:
 *    1. getConfig() function which depends on appInitialConfig returns corresponding config state
 *    2. getAppModelMethods() function which depends on appInitialConfig returns corresponding methods
 * @appConfig {IAppInitialConfig} - the config which describe app model
 */

function createAppModel(appConfig: IAppInitialConfig) {
  const { appName, dataType, grouping, components, selectForm } = appConfig;

  const model: IModel<IAppModelState> = createModel<IAppModelState>({
    requestIsPending: false,
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
            resizeMode: TABLE_DEFAULT_CONFIG.metrics.resizeMode,
            rowHeight: TABLE_DEFAULT_CONFIG.metrics.rowHeight,
            sortFields: [...TABLE_DEFAULT_CONFIG.metrics.sortFields],
            hiddenMetrics: [...TABLE_DEFAULT_CONFIG.metrics.hiddenMetrics],
            hiddenColumns: [...TABLE_DEFAULT_CONFIG.metrics.hiddenColumns],
            columnsWidths: {},
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
              curveInterpolation:
                CONTROLS_DEFAULT_CONFIG.metrics.curveInterpolation,
              smoothingAlgorithm:
                CONTROLS_DEFAULT_CONFIG.metrics.smoothingAlgorithm,
              smoothingFactor: CONTROLS_DEFAULT_CONFIG.metrics.smoothingFactor,
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
                content: {},
                display: CONTROLS_DEFAULT_CONFIG.metrics.tooltip.display,
                selectedParams:
                  CONTROLS_DEFAULT_CONFIG.metrics.tooltip.selectedParams,
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
            rowHeight: TABLE_DEFAULT_CONFIG.runs.rowHeight,
            hideSystemMetrics: TABLE_DEFAULT_CONFIG.runs.hideSystemMetrics,
            hiddenMetrics: TABLE_DEFAULT_CONFIG.runs.hiddenMetrics,
            hiddenColumns: TABLE_DEFAULT_CONFIG.runs.hiddenColumns,
            columnsWidths: {},
            columnsOrder: {
              left: [...TABLE_DEFAULT_CONFIG.runs.columnsOrder.left],
              middle: [...TABLE_DEFAULT_CONFIG.runs.columnsOrder.middle],
              right: [...TABLE_DEFAULT_CONFIG.runs.columnsOrder.right],
            },
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
                content: {},
                display: CONTROLS_DEFAULT_CONFIG.params.tooltip.display,
                selectedParams:
                  CONTROLS_DEFAULT_CONFIG.params.tooltip.selectedParams,
              },
            };
          }
          if (components.charts.indexOf(ChartTypeEnum.ScatterPlot) !== -1) {
            config.chart = {
              focusedState: {
                key: null,
                xValue: null,
                yValue: null,
                active: false,
                chartIndex: null,
              },
              tooltip: {
                content: {},
                display: CONTROLS_DEFAULT_CONFIG.scatters.tooltip.display,
                selectedParams:
                  CONTROLS_DEFAULT_CONFIG.scatters.tooltip.selectedParams,
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
        return config;
      }
      default:
        return {};
    }
  }

  function setModelDefaultAppConfigData(): void {
    setDefaultAppConfigData({
      config: getConfig(),
      appInitialConfig: appConfig,
      model,
    });
  }

  function getModelAppConfigData(appId: string): {
    call: () => Promise<void>;
    abort: () => void;
  } {
    return getAppConfigData({ appId, appRequest, config: getConfig(), model });
  }

  function getRunsAppModelMethods() {
    switch (appName) {
      case AppNameEnum.PARAMS:
        return getParamsModelMethods({
          appName,
          model,
          grouping,
          components,
          selectForm,
          setModelDefaultAppConfigData,
          getModelAppConfigData,
          getConfig,
        });
      case AppNameEnum.RUNS:
        return getRunsModelMethods({
          appName,
          model,
          grouping,
          components,
          selectForm,
          setModelDefaultAppConfigData,
        });
      case AppNameEnum.SCATTERS:
        return getScattersModelMethods({
          appName,
          model,
          grouping,
          components,
          selectForm,
          setModelDefaultAppConfigData,
        });
      default:
        return {};
    }
  }

  function getAppModelMethods() {
    switch (dataType) {
      case AppDataTypeEnum.METRICS:
        return getMetricsModelMethods({
          appName,
          model,
          grouping,
          components,
          selectForm,
          setModelDefaultAppConfigData,
          getModelAppConfigData,
          getConfig,
        });
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
