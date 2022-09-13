import React from 'react';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IHomeProps } from 'types/pages/home/Home';

import Activity from './components/Activity/Activity';
import HomeLeft from './components/HomeLeft/HomeLeft';
import HomeRight from './components/HomeRight/HomeRight';
import HomeMiddle from './components/HomeMiddle/HomeMiddle';

import './Home.scss';

function Home({
  activityData,
  onSendEmail,
  notifyData,
  onNotificationDelete,
  askEmailSent,
}: IHomeProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <section className='Home'>
        <HomeLeft />
        <div className='Home__middle'>
          <div className='Home__Activity__container'>
            <Activity activityData={activityData} />
            <HomeMiddle />
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
