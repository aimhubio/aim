import { IAppInitialConfig } from 'types/services/models/explorer/createAppModel';

import { ChartTypeEnum } from 'utils/d3';

import createAppModel from './createAppModel';

/**
 *  Constants and Enums we can create and export from this file
 */

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
  SCATTERS = 'scatters',
}

/**
 * appInitialConfig is config object which describes our app models
 * @appInitialConfig { [key: string]: IAppInitialConfig }
 */

const appInitialConfig: {
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
    selectForm: AppNameEnum.RUNS,
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
  SCATTERS: {
    dataType: AppDataTypeEnum.RUNS,
    selectForm: AppNameEnum.RUNS,
    grouping: true,
    appName: AppNameEnum.SCATTERS,
    components: { table: true, charts: [ChartTypeEnum.ScatterPlot] },
  },
};

export { createAppModel, appInitialConfig, AppDataTypeEnum, AppNameEnum };
