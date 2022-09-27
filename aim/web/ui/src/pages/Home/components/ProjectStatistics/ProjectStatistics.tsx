import * as React from 'react';

import { getParams } from 'modules/core/api/projectApi';

import { Text } from 'components/kit';
import StatisticsCard from 'components/StatisticsCard';

import { SequenceTypesEnum, SequenceTypesUnion } from 'types/core/enums';

import { IProjectStatistic } from '.';

import './ProjectStatistics.scss';

function ProjectStatistics() {
  const statisticsInitialMapRef = React.useRef<
    Partial<Record<SequenceTypesUnion, IProjectStatistic>>
  >({
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
  });
  const [statisticsMap, setStatisticsMap] = React.useState<
    Partial<Record<SequenceTypesUnion, IProjectStatistic>>
  >(statisticsInitialMapRef.current);

  const total_runs_count = 24_300;

  function getProjectParams() {
    const sequences = Object.keys(
      statisticsInitialMapRef.current,
    ) as SequenceTypesUnion[];

    getParams({ sequence: sequences, exclude_params: true }).then((data) => {
      for (let [seqName, seqData] of Object.entries(data)) {
        const runsCount = Object.values(seqData).reduce((acc, itemData) => {
          acc += itemData.length;
          return acc;
        }, 0);

        setStatisticsMap((prevState) => {
          const seqState = prevState[seqName as keyof typeof prevState] || {};
          return {
            ...prevState,
            [seqName]: {
              ...seqState,
              runsCount,
            },
          };
        });
      }
    });
  }

  React.useEffect(() => {
    getProjectParams();
  }, []);

  console.log(statisticsMap);
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
