import * as React from 'react';

import { Text } from 'components/kit';
import StatisticsCard from 'components/StatisticsCard';
import StatisticsBar from 'components/StatisticsBar';

import { IProjectStatistic } from 'pages/Dashboard/components/ProjectStatistics';

import { encode } from 'utils/encoder/encoder';

import experimentContributionsEngine from '../ExperimentContributions/ExperimentContributionsStore';

import { IExperimentStatisticsProps } from '.';

import './ExperimentStatistics.scss';

function ExperimentStatistics({ experimentName }: IExperimentStatisticsProps) {
  const [hoveredState, setHoveredState] = React.useState({
    source: '',
    id: '',
  });
  const { current: expContributionsEngine } = React.useRef(
    experimentContributionsEngine,
  );

  const contributionsState =
    expContributionsEngine.experimentContributionsState((state) => state);

  const { totalRunsCount, archivedRuns } = React.useMemo(
    () => ({
      totalRunsCount: contributionsState.data?.num_runs || 0,
      archivedRuns: contributionsState.data?.num_archived_runs || 0,
    }),
    [contributionsState],
  );

  const runsCountingMap: Record<'archived' | 'runs', IProjectStatistic> =
    React.useMemo(
      () => ({
        runs: {
          label: 'runs',
          icon: 'runs',
          count: totalRunsCount - archivedRuns,
          iconBgColor: '#1473E6',
          navLink: `/runs?select=${encode({
            query: `run.experiment == '${experimentName}'`,
          })}`,
        },
        archived: {
          label: 'archived',
          icon: 'archive',
          count: archivedRuns,
          iconBgColor: '#606986',
          navLink: `/runs?select=${encode({
            query: `run.archived == True and run.experiment == '${experimentName}'`,
          })}`,
        },
      }),
      [totalRunsCount, archivedRuns, experimentName],
    );

  const statisticsMap: Record<string, IProjectStatistic> = React.useMemo(
    () => ({
      active: {
        label: 'Active',
        count: contributionsState.data?.num_active_runs || 0,
        icon: 'runs',
        iconBgColor: '#18AB6D',
        navLink: `/runs?select=${encode({
          query: `run.active == True and run.experiment == '${experimentName}'`,
        })}`,
      },
      // @TODO implement failed runs
      // failed: {
      //   label: 'Failed',
      //   count: 0,
      //   icon: 'runs',
      //   iconBgColor: '#e64e48',
      //   navLink: `/runs?select=${encode({
      //     query: `run.failed == True and run.experiment == '${experimentName}'`,
      //   })}`,
      // },
      finished: {
        label: 'Finished',
        icon: 'runs',
        count: totalRunsCount - (contributionsState.data?.num_active_runs || 0),
        iconBgColor: '#83899e',
        navLink: `/runs?select=${encode({
          query: `run.active == False and run.experiment == '${experimentName}'`,
        })}`,
      },
    }),
    [contributionsState, experimentName, totalRunsCount],
  );

  const statisticsBarData = React.useMemo(
    () =>
      Object.values(statisticsMap).map(
        ({ label, iconBgColor = '#000', count }) => ({
          highlighted: hoveredState.id === label,
          label,
          color: iconBgColor,
          percent: totalRunsCount === 0 ? 0 : (count / totalRunsCount) * 100,
        }),
      ),
    [statisticsMap, totalRunsCount, hoveredState],
  );

  const onMouseOver = React.useCallback((id = '', source = '') => {
    setHoveredState({ source, id });
  }, []);

  const onMouseLeave = React.useCallback(() => {
    setHoveredState({ source: '', id: '' });
  }, []);

  return (
    <div className='ExperimentStatistics'>
      <Text
        className='ExperimentStatistics__totalRuns'
        component='p'
        tint={100}
        weight={700}
        size={14}
      >
        Total runs: {totalRunsCount}
      </Text>
      <div className='ExperimentStatistics__cards'>
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
              isLoading={contributionsState.loading}
            />
          ),
        )}
      </div>
      <Text
        className='ExperimentStatistics__trackedSequences'
        component='p'
        tint={100}
        weight={700}
        size={14}
      >
        Runs status
      </Text>
      <div className='ExperimentStatistics__cards'>
        {Object.values(statisticsMap).map(
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
              highlighted={
                !!navLink &&
                hoveredState.source === 'card' &&
                hoveredState.id === label
              }
              outlined={hoveredState.id === label}
              isLoading={contributionsState.loading}
            />
          ),
        )}
      </div>
      <div className='ExperimentStatistics__bar'>
        <StatisticsBar
          data={statisticsBarData}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
        />
      </div>
    </div>
  );
}

ExperimentStatistics.displayName = 'ExperimentStatistics';

export default React.memo(ExperimentStatistics);
