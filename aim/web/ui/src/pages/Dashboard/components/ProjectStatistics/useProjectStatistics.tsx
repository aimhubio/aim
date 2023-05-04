import * as React from 'react';

import routes from 'routes/routes';

import { SequenceTypesEnum } from 'types/core/enums';

import { encode } from 'utils/encoder/encoder';

import projectContributionsEngine from '../ProjectContributions/ProjectContributionsStore';

import { IProjectStatistic } from './ProjectStatistics.d';
import projectStatisticsEngine from './ProjectStatisticsStore';

const statisticsInitialMap: Record<string, IProjectStatistic> = {
  [SequenceTypesEnum.Metric]: {
    label: 'Metrics',
    count: 0,
    icon: 'metrics',
    iconBgColor: '#7A4CE0',
    navLink: routes.METRICS.path,
  },
  systemMetrics: {
    label: 'Sys. metrics',
    count: 0,
    icon: 'metrics',
    iconBgColor: '#AF4EAB',
    navLink: `${routes.METRICS.path}?select=${encode({
      advancedQuery: "metric.name.startswith('__system__') == True",
      advancedMode: true,
    })}`,
  },
  [SequenceTypesEnum.Figures]: {
    label: 'Figures',
    icon: 'figures',
    count: 0,
    iconBgColor: '#18AB6D',
    navLink: routes.FIGURES_EXPLORER.path,
  },
  [SequenceTypesEnum.Images]: {
    label: 'Images',
    icon: 'images',
    count: 0,
    iconBgColor: '#F17922',
    navLink: routes.IMAGE_EXPLORE.path,
  },
  [SequenceTypesEnum.Audios]: {
    label: 'Audios',
    icon: 'audios',
    count: 0,
    iconBgColor: '#FCB500',
    navLink: routes.AUDIOS_EXPLORER.path,
    badge: {
      value: 'New',
      style: { backgroundColor: '#1473e6', color: '#fff' },
    },
  },
  [SequenceTypesEnum.Texts]: {
    label: 'Texts',
    icon: 'text',
    count: 0,
    iconBgColor: '#E149A0',
    navLink: routes.TEXT_EXPLORER.path,
    badge: {
      value: 'New',
      style: { backgroundColor: '#1473e6', color: '#fff' },
    },
  },
  [SequenceTypesEnum.Distributions]: {
    label: 'Distributions',
    icon: 'distributions',
    count: 0,
    iconBgColor: '#0394B4',
    navLink: '',
    badge: {
      value: 'Explorer coming soon',
    },
  },
};

const runsCountingInitialMap: Record<'archived' | 'runs', IProjectStatistic> = {
  runs: {
    label: 'runs',
    icon: 'runs',
    count: 0,
    iconBgColor: '#1473E6',
    navLink: routes.RUNS.path,
  },
  archived: {
    label: 'archived',
    icon: 'archive',
    count: 0,
    iconBgColor: '#606986',
    navLink: `/runs?select=${encode({ query: 'run.archived == True' })}`,
  },
};

function useProjectStatistics() {
  const [hoveredState, setHoveredState] = React.useState({
    source: '',
    id: '',
  });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectStatsEngine]);

  const { statisticsMap, totalTrackedSequencesCount } = React.useMemo(() => {
    const statistics = { ...statisticsInitialMap };
    let totalTrackedSequencesCount = 0;

    for (let [seqName, seqData] of Object.entries(
      projectParamsStore.data || {},
    )) {
      let systemMetricsCount = 0;
      let sequenceItemsCount = 0;
      for (let [itemKey, itemData] of Object.entries(seqData)) {
        if (itemKey.startsWith('__system__')) {
          systemMetricsCount += itemData.length;
        } else {
          sequenceItemsCount += itemData.length;
        }
      }
      totalTrackedSequencesCount += sequenceItemsCount;
      statistics[seqName].count = sequenceItemsCount;
      if (systemMetricsCount) {
        totalTrackedSequencesCount += systemMetricsCount;
        statistics.systemMetrics.count = systemMetricsCount;
      }
    }
    return { statisticsMap: statistics, totalTrackedSequencesCount };
  }, [projectParamsStore]);

  const { totalRunsCount, archivedRuns } = React.useMemo(
    () => ({
      totalRunsCount: projectContributionsStore.data?.num_runs || 0,
      archivedRuns: projectContributionsStore.data?.num_archived_runs || 0,
    }),
    [projectContributionsStore],
  );
  const statisticsBarData = React.useMemo(
    () =>
      Object.values(statisticsMap).map(
        ({ label, iconBgColor = '#000', count }) => ({
          highlighted: hoveredState.id === label,
          label,
          color: iconBgColor,
          percent:
            totalTrackedSequencesCount === 0
              ? 0
              : (count / totalTrackedSequencesCount) * 100,
        }),
      ),
    [statisticsMap, totalTrackedSequencesCount, hoveredState],
  );

  const runsCountingMap = React.useMemo(
    () => ({
      runs: {
        ...runsCountingInitialMap.runs,
        count: totalRunsCount - archivedRuns,
      },
      archived: {
        ...runsCountingInitialMap.archived,
        count: archivedRuns,
      },
    }),
    [archivedRuns, totalRunsCount],
  );
  const onMouseOver = React.useCallback((id = '', source = '') => {
    setHoveredState({ source, id });
  }, []);
  const onMouseLeave = React.useCallback(() => {
    setHoveredState({ source: '', id: '' });
  }, []);

  return {
    projectParamsStore,
    projectContributionsStore,
    statisticsBarData,
    runsCountingMap,
    totalRunsCount,
    hoveredState,
    statisticsMap,
    onMouseOver,
    onMouseLeave,
  };
}

export default useProjectStatistics;
