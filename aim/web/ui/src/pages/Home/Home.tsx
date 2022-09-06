import React from 'react';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IHomeProps } from 'types/pages/home/Home';

import ExploreAim from './components/ExploreAim/ExploreAim';
import SetupGuide from './components/SetupGuide/SetupGuide';
import Activity from './components/Activity/Activity';
import HomeLeft from './components/HomeLeft/HomeLeft';
import HomeRight from './components/HomeRight/HomeRight';
import ExperimentsCard from './components/ExperimentsCard';

import './Home.scss';

function Home({
  activityData,
  onSendEmail,
  notifyData,
  onNotificationDelete,
  askEmailSent,
  experimentsData,
}: IHomeProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <section className='Home'>
        <HomeLeft />
        <div className='Home__middle'>
          <div className='Home__Activity__container'>
            <Activity activityData={activityData} />
          </div>
          <ExperimentsCard />
          <div className='Home__Explore__container'>
            <SetupGuide askEmailSent={askEmailSent} onSendEmail={onSendEmail} />
            <ExploreAim />
          </div>
        </div>
        <HomeRight />
        {notifyData?.length > 0 && (
          <NotificationContainer
            handleClose={onNotificationDelete}
            data={notifyData}
          />
        )}
      </section>
    </ErrorBoundary>
  );
}
export default Home;
