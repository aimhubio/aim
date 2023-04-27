import React from 'react';

import { useProjectStatistics } from 'pages/Dashboard/components/ProjectStatistics';

import { explorersRoutes } from 'routes/routes';

import { IExplorerCardProps } from './components/ExplorerCard';

export default function useExplorers() {
  const { statisticsMap, projectParamsStore } = useProjectStatistics();

  const explorers = React.useMemo(() => {
    const routes: { [key: string]: IExplorerCardProps } = {};
    Object.keys(explorersRoutes).forEach((key) => {
      const route = explorersRoutes[key];
      const count =
        Object.values(statisticsMap).find((item) => item.navLink === route.path)
          ?.count || 0;
      routes[key] = {
        ...route,
        count,
      };
    });
    routes.METRICS_EXPLORER.count = routes.METRICS.count;
    return {
      aimExplorers: routes,
      promptExplorers: {
        texts: routes.TEXT_EXPLORER,
        images: routes.IMAGE_EXPLORE,
        audio: routes.AUDIOS_EXPLORER,
      },
    };
  }, [statisticsMap]);
  return {
    explorers,
    isLoading: projectParamsStore.loading,
  };
}
