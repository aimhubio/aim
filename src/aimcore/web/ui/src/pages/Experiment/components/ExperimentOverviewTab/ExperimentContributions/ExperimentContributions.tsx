import React from 'react';

import HeatMap from 'components/HeatMap/HeatMap';
import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import { trackEvent } from 'services/analytics';

import useExperimentContributions from './useExperimentContributions';

import { IExperimentContributionsProps } from '.';

import './ExperimentContributions.scss';

function ExperimentContributions({
  experimentId,
  experimentName,
}: IExperimentContributionsProps): React.FunctionComponentElement<React.ReactNode> {
  const { experimentContributionsState } =
    useExperimentContributions(experimentId);

  function shiftDate(date: any, numDays: any) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }

  let today = new Date();

  return (
    <ErrorBoundary>
      <div className='ExperimentContributions'>
        <Text component='h2' size={18} weight={600} tint={100}>
          Contributions
        </Text>
        <div className='ExperimentContributions__HeatMap'>
          <HeatMap
            startDate={shiftDate(today, -10 * 30)}
            endDate={today}
            onCellClick={() => {
              trackEvent(ANALYTICS_EVENT_KEYS.dashboard.activityCellClick);
            }}
            additionalQuery={` and run.experiment == "${experimentName}"`}
            data={Object.keys(
              experimentContributionsState.data?.activity_map ?? {},
            ).map((k) => [
              new Date(k),
              experimentContributionsState.data?.activity_map[k],
            ])}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default React.memo(ExperimentContributions);
