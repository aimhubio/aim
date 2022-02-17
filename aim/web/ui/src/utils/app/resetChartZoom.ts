import {
  IAppModelConfig,
  ILineChartConfig,
} from 'types/services/models/explorer/createAppModel';

export default function resetChartZoom({
  configData,
  appName,
}: {
  configData: IAppModelConfig;
  appName: string;
}): IAppModelConfig {
  if (configData.chart) {
    configData.chart = {
      ...configData.chart,
      zoom: {
        ...(configData.chart as ILineChartConfig).zoom,
        active: false,
        history: [],
      },
    };
  }
  return configData;
}
