import React from 'react';
import { Grid } from '@material-ui/core';

import HeatMap from 'components/HeatMap/HeatMap';
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
    <Grid className='Activity__container' container spacing={1}>
      <Grid item>
        <h2>Statistics</h2>
        <div className='Activity__Statistics__card'>
          <span>Experiments</span>
          <strong>{activityData?.num_experiments}</strong>
        </div>
        <div className='Activity__Statistics__card'>
          <span>Runs</span>
          <strong>{activityData?.num_runs}</strong>
        </div>
      </Grid>
      <Grid xs item>
        <h2>Activity</h2>
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
