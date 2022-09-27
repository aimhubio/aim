import React from 'react';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Text } from 'components/kit';

import { IHomeProps } from 'types/pages/home/Home';

import ExploreAim from './components/ExploreAim/ExploreAim';
import SetupGuide from './components/SetupGuide/SetupGuide';
import ProjectContributions from './components/ProjectContributions/ProjectContributions';
import HomeLeft from './components/HomeLeft/HomeLeft';
import HomeRight from './components/HomeRight/HomeRight';
import ProjectStatistics from './components/ProjectStatistics';

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
          <Text
            tint={100}
            weight={600}
            size={18}
            className='Home__middle__title'
          >
            Overview
          </Text>
          <ProjectStatistics />
          <div className='Home__Activity__container'>
            <ProjectContributions />
          </div>
          {/* <div className='Home__Explore__container'>
            <SetupGuide askEmailSent={askEmailSent} onSendEmail={onSendEmail} />
            <ExploreAim />
          </div> */}
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
