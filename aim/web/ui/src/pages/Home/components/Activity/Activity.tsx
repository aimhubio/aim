import React from 'react';

import { CircularProgress, Grid } from '@material-ui/core';

import HeatMap from 'components/HeatMap/HeatMap';
import { Text } from 'components/kit';

import { IActivityProps } from 'types/pages/home/components/Activity/Activity';

import './Activity.scss';

function Activity({
  activityData,
}: IActivityProps): React.FunctionComponentElement<React.ReactNode> {
  function shiftDate(date: any, numDays: any) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }
  let today = new Date();
  return (
    <Grid className='Activity' container spacing={1}>
      <Grid item>
        <Text component='h2' size={24} weight={600} tint={100}>
          Statistics
        </Text>
        <div className='Activity__Statistics__card'>
          <Text size={16} component='span' color='secondary'>
            Experiments
          </Text>
          <Text component='strong' size={36} weight={600} color='secondary'>
            {activityData?.num_experiments ?? (
              <CircularProgress className='Activity__loader' />
            )}
          </Text>
        </div>
        <div className='Activity__Statistics__card'>
          <Text size={16} component='span' color='secondary'>
            Runs
          </Text>
          <Text component='strong' size={36} weight={600} color='secondary'>
            {activityData?.num_runs ?? (
              <CircularProgress className='Activity__loader' />
            )}
          </Text>
        </div>
      </Grid>
      <Grid xs item>
        <Text component='h2' size={24} weight={600} tint={100}>
          Activity
        </Text>
        <div className='Activity__HeatMap'>
          <HeatMap
            startDate={shiftDate(today, -10 * 30)}
            endDate={today}
            // onCellClick={searchRuns}
            data={Object.keys(activityData?.activity_map ?? {}).map((k) => [
              new Date(k),
              activityData.activity_map[k],
            ])}
          />
        </div>
      </Grid>
    </Grid>
  );
}
export default React.memo(Activity);
