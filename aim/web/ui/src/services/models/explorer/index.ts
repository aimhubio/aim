import createAppModel from './createAppModel';

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

export { createAppModel, AppDataTypeEnum, AppNameEnum };
