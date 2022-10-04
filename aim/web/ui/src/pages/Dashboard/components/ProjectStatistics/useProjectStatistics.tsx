import * as React from 'react';

import projectContributionsEngine from '../ProjectContributions/ProjectContributionsStore';

import projectStatisticsEngine from './ProjectStatisticsStore';

function useProjectStatistics() {
  const { current: projectStatsEngine } = React.useRef(projectStatisticsEngine);
  const projectParamsStore = projectStatsEngine.projectParamsState(
    (state) => state,
  );
  const { current: contributionsEngine } = React.useRef(
    projectContributionsEngine,
  );
  const projectContributionsStore =
    contributionsEngine.projectContributionsState((state) => state);

  React.useEffect(() => {
    if (!projectParamsStore.data) {
      projectStatsEngine.fetchProjectParams();
    }
    return () => {
      projectStatsEngine.destroy();
    };
  }, [projectStatsEngine]);

  return { projectParamsStore, projectContributionsStore };
}

export default useProjectStatistics;
