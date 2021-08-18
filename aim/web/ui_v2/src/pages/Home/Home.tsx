import React from 'react';

import ExploreAim from './components/ExploreAim/ExploreAim';
import SetupGuide from './components/SetupGuide/SetupGuide';
import Activity from './components/Activity/Activity';
import { IFrontProps } from 'types/pages/home/Home';

import './Home.scss';
import { Grid } from '@material-ui/core';

function Home({
  activityData,
}: IFrontProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Home__container'>
      <div className='Home__Activity__container'>
        <Activity activityData={activityData} />
      </div>
      <div className='Home__Explore__container'>
        <Grid container>
          <Grid xs={7} item>
            <SetupGuide />
          </Grid>
          <Grid xs={5} item>
            <ExploreAim />
          </Grid>
        </Grid>
      </div>
    </section>
  );
}
export default Home;
