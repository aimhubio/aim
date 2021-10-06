import React from 'react';

import ExploreAim from './components/ExploreAim/ExploreAim';
import SetupGuide from './components/SetupGuide/SetupGuide';
import Activity from './components/Activity/Activity';
import { IHomeProps } from 'types/pages/home/Home';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import './Home.scss';

function Home({
  activityData,
  onSendEmail,
  notifyData,
  onNotificationDelete,
}: IHomeProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Home__container'>
      <div className='Home__Activity__container'>
        <Activity activityData={activityData} />
      </div>
      <div className='Home__Explore__container'>
        <SetupGuide onSendEmail={onSendEmail} />
        <ExploreAim />
      </div>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </section>
  );
}
export default Home;
