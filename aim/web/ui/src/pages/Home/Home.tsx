import React from 'react';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Text } from 'components/kit';

import { IHomeProps } from 'types/pages/home/Home';

import ProjectContributions from './components/ProjectContributions/ProjectContributions';
import ExploreSection from './components/ExploreSection/ExploreSection';
import HomeRight from './components/HomeRight/HomeRight';
import ProjectStatistics, {
  useProjectStatistics,
} from './components/ProjectStatistics';
import ActiveRunsTable from './components/ActiveRunsTable/ActiveRunsTable';
import QuickStart from './components/QuickStart';

import './Home.scss';

function Home({
  activityData,
  onSendEmail,
  notifyData,
  onNotificationDelete,
  askEmailSent,
}: IHomeProps): React.FunctionComponentElement<React.ReactNode> {
  const { projectContributionsStore } = useProjectStatistics();

  const totalRunsCount = projectContributionsStore.data?.num_runs ?? 0;

  return (
    <ErrorBoundary>
      <section className='Home'>
        <ExploreSection />
        <div className='Home__middle'>
          {totalRunsCount === 0 ? (
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
