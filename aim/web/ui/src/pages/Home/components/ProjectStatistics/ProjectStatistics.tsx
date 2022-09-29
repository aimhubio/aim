import * as React from 'react';

import { Text } from 'components/kit';
import StatisticsCard from 'components/StatisticsCard';
import StatisticsBar from 'components/StatisticsBar';

import { SequenceTypesEnum, SequenceTypesUnion } from 'types/core/enums';

import { IProjectStatistic, useProjectStatistics } from '.';

import './ProjectStatistics.scss';

const statisticsInitialMap: Partial<
  Record<SequenceTypesUnion, IProjectStatistic>
> = {
  [SequenceTypesEnum.Metric]: {
    label: 'metrics',
    count: 0,
    icon: 'metrics',
    iconBgColor: '#7A4CE0',
  },
  [SequenceTypesEnum.Images]: {
    label: 'images',
    icon: 'images',
    count: 0,
    iconBgColor: '#F17922',
  },
  [SequenceTypesEnum.Figures]: {
    label: 'figures',
    icon: 'figures-explorer',
    count: 0,
    iconBgColor: '#18AB6D',
  },
  [SequenceTypesEnum.Texts]: {
    label: 'text',
    icon: 'text',
    count: 0,
    iconBgColor: '#E149A0',
  },
  [SequenceTypesEnum.Audios]: {
    label: 'audio',
    icon: 'figures-explorer',
    count: 0,
    iconBgColor: '#FCB500',
  },
  [SequenceTypesEnum.Distributions]: {
    label: 'distributions',
    icon: 'figures-explorer',
    count: 0,
    iconBgColor: '#FCB500',
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
  const { projectParamsStore, projectContributionsStore } =
    useProjectStatistics();

  const { statisticsMap, totalTrackedSequencesCount } = React.useMemo(() => {
    const statisticsMap = { ...statisticsInitialMap };
    const trackedItemsCountMap: Partial<Record<SequenceTypesUnion, number>> =
      {};
    let totalTrackedSequencesCount = 0;

    for (let [seqName, seqData] of Object.entries(
      projectParamsStore.data || {},
    )) {
      const sequenceItemsCount = Object.entries(seqData).reduce(
        (acc, [itemKey, itemData]) => {
          if (!itemKey.startsWith('__system__')) {
            acc += itemData.length;
          }
          return acc;
        },
        0,
      );
      totalTrackedSequencesCount += sequenceItemsCount;
      trackedItemsCountMap[seqName as SequenceTypesUnion] = sequenceItemsCount;
    }

    const entries = Object.entries(trackedItemsCountMap) as Array<
      [SequenceTypesUnion, number]
    >;
    entries.forEach(([seqName, trackedItemsCount]) => {
      const sequenceState = statisticsMap[seqName];
      if (sequenceState) {
        sequenceState.count = trackedItemsCount;
      }
    });
    return { statisticsMap, totalTrackedSequencesCount };
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
        label: item.label,
        color: item.iconBgColor,
        percent:
          totalTrackedSequencesCount === 0
            ? 0
            : (item.count / totalTrackedSequencesCount) * 100,
      })),
    [statisticsMap, totalTrackedSequencesCount],
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
            />
          ),
        )}
      </div>
      <div className='ProjectStatistics__bar'>
        <StatisticsBar data={statisticsBarData} />
      </div>
    </div>
  );
}

ProjectStatistics.displayName = 'ProjectStatistics';

export default React.memo(ProjectStatistics);
