import * as React from 'react';

import { Text } from 'components/kit';
import StatisticsCard from 'components/StatisticsCard';
import StatisticsBar from 'components/StatisticsBar';

import { SequenceTypesEnum } from 'types/core/enums';

import { IProjectStatistic, useProjectStatistics } from '.';

import './ProjectStatistics.scss';

const statisticsInitialMap: Record<string, IProjectStatistic> = {
  [SequenceTypesEnum.Metric]: {
    label: 'Metrics',
    count: 0,
    icon: 'metrics',
    iconBgColor: '#7A4CE0',
  },
  systemMetrics: {
    label: 'Sys. metrics',
    count: 0,
    icon: 'metrics',
    iconBgColor: '#FCB500',
  },
  [SequenceTypesEnum.Distributions]: {
    label: 'Distributions',
    icon: 'distributions',
    count: 0,
    iconBgColor: '#0394B4',
  },
  [SequenceTypesEnum.Images]: {
    label: 'Images',
    icon: 'images',
    count: 0,
    iconBgColor: '#F17922',
  },
  [SequenceTypesEnum.Audios]: {
    label: 'Audios',
    icon: 'audio',
    count: 0,
    iconBgColor: '#729B1B',
  },
  [SequenceTypesEnum.Texts]: {
    label: 'Texts',
    icon: 'text',
    count: 0,
    iconBgColor: '#E149A0',
  },
  [SequenceTypesEnum.Figures]: {
    label: 'Figures',
    icon: 'figures-explorer',
    count: 0,
    iconBgColor: '#18AB6D',
  },
};

const runsCountingInitialMap: Record<
  'archived' | 'unarchived',
  IProjectStatistic
> = {
  unarchived: {
    label: 'unarchived',
    icon: 'unarchive',
    count: 0,
    iconBgColor: '#1473E6',
  },
  archived: {
    label: 'archived',
    icon: 'archive',
    count: 0,
    iconBgColor: '#606986',
  },
};

function ProjectStatistics() {
  const [hoveredState, setHoveredState] = React.useState('');
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
      Object.values(statisticsMap).map((item) => ({
        highlighted: hoveredState === item.label,
        label: item.label,
        color: item.iconBgColor,
        percent:
          totalTrackedSequencesCount === 0
            ? 0
            : (item.count / totalTrackedSequencesCount) * 100,
      })),
    [statisticsMap, totalTrackedSequencesCount, hoveredState],
  );
  const runsCountingMap = React.useMemo(
    () => ({
      unarchived: {
        ...runsCountingInitialMap.unarchived,
        count: totalRunsCount - archivedRuns,
      },
      archived: {
        ...runsCountingInitialMap.archived,
        count: archivedRuns,
      },
    }),
    [archivedRuns, totalRunsCount],
  );
  const onMouseOver = React.useCallback((id: string = '') => {
    setHoveredState(id);
  }, []);
  const onMouseLeave = React.useCallback(() => {
    setHoveredState('');
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
          ({ label, icon, count, iconBgColor }) => (
            <StatisticsCard
              key={label}
              label={label}
              icon={icon}
              count={count}
              iconBgColor={iconBgColor}
              onMouseOver={onMouseOver}
              onMouseLeave={onMouseLeave}
              highlighted={hoveredState === label}
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
          ({ label, icon, count, iconBgColor }) => (
            <StatisticsCard
              key={label}
              label={label}
              icon={icon}
              count={count}
              iconBgColor={iconBgColor}
              onMouseOver={onMouseOver}
              onMouseLeave={onMouseLeave}
              highlighted={hoveredState === label}
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
