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
    trackedItemsCount: 0,
    icon: 'metrics',
    iconBgColor: '#7A4CE0',
  },
  [SequenceTypesEnum.Images]: {
    label: 'images',
    icon: 'images',
    trackedItemsCount: 0,
    iconBgColor: '#F17922',
  },
  [SequenceTypesEnum.Figures]: {
    label: 'figures',
    icon: 'figures-explorer',
    trackedItemsCount: 0,
    iconBgColor: '#18AB6D',
  },
  // @TODO add this items when the corresponding explorers would be created
  // [SequenceTypesEnum.Texts]: {
  //   label: 'text',
  //   icon: 'text',
  //   trackedItemsCount: 0,
  //   iconBgColor: '#E149A0',
  // },
  // [SequenceTypesEnum.Audios]: {
  //   label: 'audio',
  //   icon: 'figures-explorer',
  //   trackedItemsCount: 0,
  //   iconBgColor: '#FCB500',
  // },
};

function ProjectStatistics() {
  const { projectParamsStore, projectContributionsStore } =
    useProjectStatistics();

  const { statisticsMap, totalTrackedSequencesCount } = React.useMemo(() => {
    const statisticsMap = { ...statisticsInitialMap };
    const trackedItemsCountBySequence: Partial<
      Record<SequenceTypesUnion, number>
    > = {};
    let totalTrackedSequencesCount = 0;

    for (let [seqName, seqData] of Object.entries(
      projectParamsStore.data || {},
    )) {
      trackedItemsCountBySequence[seqName as SequenceTypesUnion] =
        Object.entries(seqData).reduce((acc, [itemKey, itemData]) => {
          if (!itemKey.startsWith('__system__')) {
            acc += itemData.length;
            totalTrackedSequencesCount += itemData.length;
          }
          return acc;
        }, 0);
    }

    const entries = Object.entries(trackedItemsCountBySequence) as Array<
      [SequenceTypesUnion, number]
    >;
    entries.forEach(([seqName, trackedItemsCount]) => {
      const sequenceState = statisticsMap[seqName];
      if (sequenceState) {
        sequenceState.trackedItemsCount = trackedItemsCount;
      }
    });
    return { statisticsMap, totalTrackedSequencesCount };
  }, [projectParamsStore]);

  const totalRunsCount = React.useMemo(
    () => projectContributionsStore.data?.num_runs || 0,
    [projectContributionsStore],
  );
  const statisticsBarData = React.useMemo(() => {
    return Object.values(statisticsMap).map((item) => ({
      label: item.label,
      color: item.iconBgColor,
      percent:
        totalTrackedSequencesCount === 0
          ? 0
          : (item.trackedItemsCount / totalTrackedSequencesCount) * 100,
    }));
  }, [statisticsMap, totalTrackedSequencesCount]);
  return (
    <div className='ProjectStatistics'>
      <Text
        className='ProjectStatistics__totalRuns'
        component='p'
        tint={100}
        weight={700}
        size={14}
      >
        {totalRunsCount} runs containing
      </Text>
      <div className='ProjectStatistics__cards'>
        {Object.values(statisticsMap).map(
          ({ label, icon, trackedItemsCount, iconBgColor }) => (
            <StatisticsCard
              key={label}
              label={label}
              icon={icon}
              count={trackedItemsCount}
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
