import * as React from 'react';

import {
  GetParamsResult,
  GetProjectContributionsResult,
} from 'modules/core/api/projectApi';

import { Text } from 'components/kit';
import StatisticsCard from 'components/StatisticsCard';

import { SequenceTypesEnum, SequenceTypesUnion } from 'types/core/enums';

import projectContributionsEngine from '../ProjectContributions/ProjectContributionsStore';
import { IResourceState } from '../../../../modules/core/utils/createResource';

import projectStatisticsEngine from './ProjectStatisticsStore';

import { IProjectStatistic } from '.';

import './ProjectStatistics.scss';

const statisticsInitialMap: Partial<
  Record<SequenceTypesUnion, IProjectStatistic>
> = {
  [SequenceTypesEnum.Metric]: {
    label: 'metrics',
    runsCount: 0,
    icon: 'metrics',
    iconBgColor: '#7A4CE0',
  },
  [SequenceTypesEnum.Images]: {
    label: 'images',
    icon: 'images',
    runsCount: 0,
    iconBgColor: '#F17922',
  },
  [SequenceTypesEnum.Figures]: {
    label: 'figures',
    icon: 'figures-explorer',
    runsCount: 0,
    iconBgColor: '#18AB6D',
  },
  // @TODO add this items when the corresponding explorers would be created
  // [SequenceTypesEnum.Texts]: {
  //   label: 'text',
  //   icon: 'text',
  //   runsCount: 0,
  //   iconBgColor: '#E149A0',
  // },
  // [SequenceTypesEnum.Audios]: {
  //   label: 'audio',
  //   icon: 'figures-explorer',
  //   runsCount: 0,
  //   iconBgColor: '#FCB500',
  // },
};

function ProjectStatistics() {
  const { current: projectStatsEngine } = React.useRef(projectStatisticsEngine);
  const projectParams: IResourceState<GetParamsResult> =
    projectStatsEngine.projectParamsState((state) => state);

  // const { current: contributionsEngine } = React.useRef(
  //   projectContributionsEngine,
  // );
  // const projectContributionsStore: IResourceState<GetProjectContributionsResult> =
  //   contributionsEngine.projectContributionsState((state) => state);

  const total_runs_count = 24_300;

  React.useEffect(() => {
    projectStatsEngine.fetchProjectParams();
    return () => {
      projectStatsEngine.projectParamsState.destroy();
    };
  }, [projectStatsEngine]);

  console.log(projectParams);

  const statisticsMap = React.useMemo(() => {
    let state = { ...statisticsInitialMap };
    let runsCountBySequence: Partial<Record<SequenceTypesUnion, number>> = {};

    for (let [seqName, seqData] of Object.entries(projectParams.data || {})) {
      runsCountBySequence[seqName as SequenceTypesUnion] = Object.entries(
        seqData,
      ).reduce((acc, [itemKey, itemData]) => {
        if (!itemKey.startsWith('__system__')) {
          acc += itemData.length;
        }
        return acc;
      }, 0);
    }

    const entries = Object.entries(runsCountBySequence) as Array<
      [SequenceTypesUnion, number]
    >;
    entries.forEach(([seqName, runsCount]) => {
      const sequenceState = state[seqName];
      if (sequenceState) {
        sequenceState.runsCount = runsCount;
      }
    });
    return state;
  }, [projectParams]);

  return (
    <div className='ProjectStatistics'>
      <Text
        className='ProjectStatistics__totalRuns'
        component='p'
        tint={100}
        weight={700}
        size={14}
      >
        {total_runs_count} runs containing
      </Text>
      <div className='ProjectStatistics__cards'>
        {Object.values(statisticsMap).map(
          ({ label, icon, runsCount, iconBgColor }) => (
            <StatisticsCard
              key={label}
              label={label}
              icon={icon}
              count={runsCount}
              iconBgColor={iconBgColor}
            />
          ),
        )}
      </div>
    </div>
  );
}

ProjectStatistics.displayName = 'ProjectStatistics';

export default React.memo(ProjectStatistics);
