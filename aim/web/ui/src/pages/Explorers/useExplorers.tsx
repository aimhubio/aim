import React from 'react';

import { ExplorersCatsEnum } from 'config/enums/explorersCatsEnum';

import { useProjectStatistics } from 'pages/Dashboard/components/ProjectStatistics';

import { explorersRoutes } from 'routes/routes';

import { IExplorerCardProps } from './components/ExplorerCard';

export default function useExplorers() {
  const { statisticsMap, projectParamsStore } = useProjectStatistics();

  const explorers = React.useMemo(() => {
    const trainingsExplorersRoutes: { [key: string]: IExplorerCardProps } = {};
    const promptsExplorersRoutes: { [key: string]: IExplorerCardProps } = {};
    Object.keys(explorersRoutes).forEach((key) => {
      const route = explorersRoutes[key];
      const count =
        Object.values(statisticsMap).find((item) => item.navLink === route.path)
          ?.count || 0;
      if (route.category === ExplorersCatsEnum.Trainings) {
        trainingsExplorersRoutes[key] = {
          ...route,
          count,
        };
      }
      if (route.category === ExplorersCatsEnum.Prompts) {
        promptsExplorersRoutes[key] = {
          ...route,
          count,
        };
      }
      // trainingsExplorersRoutes.METRICS_EXPLORER.count =
      //   trainingsExplorersRoutes.METRICS.count;
    });
    return {
      trainingsExplorers: trainingsExplorersRoutes,
      promptExplorers: promptsExplorersRoutes,
    };
  }, [statisticsMap]);
  return {
    explorers,
    isLoading: projectParamsStore.loading,
  };
}
