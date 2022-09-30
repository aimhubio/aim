import React from 'react';
import classnames from 'classnames';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner, Text } from 'components/kit';

import { IHomeProps } from 'types/pages/home/Home';

import ProjectContributions from './components/ProjectContributions/ProjectContributions';
import ExploreSection from './components/ExploreSection/ExploreSection';
import HomeRight from './components/HomeRight/HomeRight';
import ProjectStatistics from './components/ProjectStatistics';
import useProjectContributions from './components/ProjectContributions/useProjectContributions';
import ActiveRunsTable from './components/ActiveRunsTable/ActiveRunsTable';
import QuickStart from './components/QuickStart';
import AimIntegrations from './components/AimIntegrations';

import './Home.scss';

function Home({
  activityData,
  onSendEmail,
  notifyData,
  onNotificationDelete,
  askEmailSent,
}: IHomeProps): React.FunctionComponentElement<React.ReactNode> {
  const { projectContributionsStore } = useProjectContributions();

  const totalRunsCount = projectContributionsStore.data?.num_runs ?? 0;
  const isLoading = projectContributionsStore.loading;

  return (
    <ErrorBoundary>
      <section className='Home'>
        <ExploreSection />
        <div
          className={classnames('Home__middle', {
            'Home__middle--centered': isLoading,
          })}
        >
          {isLoading ? (
            <Spinner />
          ) : totalRunsCount === 0 ? (
            <QuickStart />
          ) : (
            <>
              <Text
                tint={100}
                weight={600}
                size={18}
                className='Home__middle__title'
              >
                Overview
              </Text>
              <ProjectStatistics />
              <ActiveRunsTable />
              <ProjectContributions />
            </>
          )}
          {!isLoading && <AimIntegrations />}
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
