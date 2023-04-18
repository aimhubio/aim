import * as React from 'react';

import { Text } from 'components/kit';
import StatisticsCard from 'components/StatisticsCard';
import StatisticsBar from 'components/StatisticsBar';

import routes from 'routes/routes';

import { SequenceTypesEnum } from 'types/core/enums';

import { encode } from 'utils/encoder/encoder';

import { IProjectStatistic, useProjectStatistics } from '.';

import './ProjectStatistics.scss';

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

function ProjectStatistics() {
  const [hoveredState, setHoveredState] = React.useState({
    source: '',
    id: '',
  });
  const { projectParamsStore, projectContributionsStore } =
    useProjectStatistics();

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
  return (
    <div className='ProjectStatistics'>
      <Text
        className='ProjectStatistics__totalRuns'
        component='p'
        tint={100}
        weight={700}
        size={14}
      >
        Total runs: {totalRunsCount}
      </Text>
      <div className='ProjectStatistics__cards'>
        {Object.values(runsCountingMap).map(
          ({ label, icon, count, iconBgColor, navLink }) => (
            <StatisticsCard
              key={label}
              label={label}
              icon={icon}
              count={count}
              navLink={navLink}
              iconBgColor={iconBgColor}
              onMouseOver={onMouseOver}
              onMouseLeave={onMouseLeave}
              highlighted={!!navLink && hoveredState.id === label}
              isLoading={projectContributionsStore.loading}
            />
          ),
        )}
      </div>
      <Text
        className='ProjectStatistics__trackedSequences'
        component='p'
        tint={100}
        weight={700}
        size={14}
      >
        Tracked sequences
      </Text>
      <div className='ProjectStatistics__cards'>
        {Object.values(statisticsMap).map(
          ({ label, icon, count, iconBgColor, navLink, badge }) => (
            <StatisticsCard
              key={label}
              badge={badge}
              label={label}
              icon={icon}
              count={count}
              navLink={navLink}
              iconBgColor={iconBgColor}
              onMouseOver={onMouseOver}
              onMouseLeave={onMouseLeave}
              highlighted={
                !!navLink &&
                hoveredState.source === 'card' &&
                hoveredState.id === label
              }
              outlined={hoveredState.id === label}
              isLoading={projectParamsStore.loading}
            />
          ),
        )}
      </div>
      <div className='ProjectStatistics__bar'>
        <StatisticsBar
          data={statisticsBarData}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
        />
      </div>
    </div>
  );
}

ProjectStatistics.displayName = 'ProjectStatistics';

export default React.memo(ProjectStatistics);
