/**
 * function createAppModel has 2 major functionalities:
 *    1. getConfig() function which depends on appInitialConfig returns corresponding config state
 *    2. getAppModelMethods() function which depends on appInitialConfig returns corresponding methods
 * @appConfig {IAppInitialConfig} - the config which describe app model
 */

import { IAppInitialConfig } from 'types/services/models/explorer/createAppModel';

import initializeAppModel from './config';
import getRunsModelMethods from './runsModelMethods';
import getParamsModelMethods from './paramsModelMethods';
import getScattersModelMethods from './scattersModelMethods';
import getMetricsAppModelMethods from './metricsModelMethods';

import { AppDataTypeEnum, AppNameEnum } from './index';

function createAppModel(appConfig: IAppInitialConfig) {
  const { appName, dataType } = appConfig;

  const initialApp = initializeAppModel(appConfig);
  const { model } = initialApp;

  function getRunsAppModelMethods() {
    switch (appName) {
      case AppNameEnum.PARAMS:
        return getParamsModelMethods(initialApp, appConfig);
      case AppNameEnum.RUNS:
        return getRunsModelMethods(initialApp, appConfig);
      case AppNameEnum.SCATTERS:
        return getScattersModelMethods(initialApp, appConfig);
      default:
        return {};
    }
  }

  function getAppModelMethods() {
    switch (dataType) {
      case AppDataTypeEnum.METRICS:
        return getMetricsAppModelMethods(initialApp, appConfig);
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
