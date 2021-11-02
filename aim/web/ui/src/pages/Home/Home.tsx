import React from 'react';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import { IHomeProps } from 'types/pages/home/Home';

import ExploreAim from './components/ExploreAim/ExploreAim';
import SetupGuide from './components/SetupGuide/SetupGuide';
import Activity from './components/Activity/Activity';

import './Home.scss';

function Home({
  activityData,
  onSendEmail,
  notifyData,
  onNotificationDelete,
  askEmailSent,
}: IHomeProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Home__container'>
      <div className='Home__Activity__container'>
        <Activity activityData={activityData} />
      </div>
      <div className='Home__Explore__container'>
        <SetupGuide askEmailSent={askEmailSent} onSendEmail={onSendEmail} />
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
