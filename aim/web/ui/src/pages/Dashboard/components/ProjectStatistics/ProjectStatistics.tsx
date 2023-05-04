import * as React from 'react';

import { Text } from 'components/kit';
import StatisticsCard from 'components/StatisticsCard';
import StatisticsBar from 'components/StatisticsBar';

import { useProjectStatistics } from '.';

import './ProjectStatistics.scss';

function ProjectStatistics() {
  const {
    projectParamsStore,
    projectContributionsStore,
    statisticsBarData,
    runsCountingMap,
    hoveredState,
    totalRunsCount,
    statisticsMap,
    onMouseOver,
    onMouseLeave,
  } = useProjectStatistics();

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
