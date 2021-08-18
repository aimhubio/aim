import React from 'react';

import ExploreAim from './components/ExploreAim/ExploreAim';
import SetupGuide from './components/SetupGuide/SetupGuide';
import Activity from './components/Activity/Activity';
import { IFrontProps } from 'types/pages/front/Front';

import './frontStyle.scss';

function Front({
  activityData,
}: IFrontProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Front__container'>
      <div className='Front__Activity__container'>
        <Activity activityData={activityData} />
      </div>
      <div className='Front__Explore__container'>
        <SetupGuide />
        <ExploreAim />
      </div>
    </section>
  );
}
export default Front;
