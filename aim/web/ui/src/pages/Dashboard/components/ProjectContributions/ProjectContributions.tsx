import React from 'react';

import { CircularProgress, Grid } from '@material-ui/core';

import HeatMap from 'components/HeatMap/HeatMap';
import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import { trackEvent } from 'services/analytics';

import useProjectContributions from './useProjectContributions';

import './ProjectContributions.scss';

function ProjectContributions(): React.FunctionComponentElement<React.ReactNode> {
  const { projectContributionsStore } = useProjectContributions();
  function shiftDate(date: any, numDays: any) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }
  let today = new Date();
  return (
    <ErrorBoundary>
      <div className='ProjectContributions'>
        <Text component='h2' size={18} weight={600} tint={100}>
          Contributions
        </Text>
        <div className='ProjectContributions__HeatMap'>
          <HeatMap
            startDate={shiftDate(today, -10 * 30)}
            endDate={today}
            onCellClick={() => {
              trackEvent(ANALYTICS_EVENT_KEYS.dashboard.activityCellClick);
            }}
            data={Object.keys(
              projectContributionsStore.data?.activity_map ?? {},
            ).map((k) => [
              new Date(k),
              projectContributionsStore.data?.activity_map[k],
            ])}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default React.memo(ProjectContributions);
