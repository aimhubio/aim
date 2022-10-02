import React from 'react';
import classnames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner, Text } from 'components/kit';

import ProjectContributions from './components/ProjectContributions/ProjectContributions';
import ExploreSection from './components/ExploreSection/ExploreSection';
import HomeRight from './components/HomeRight/HomeRight';
import ContributionsFeed from './components/ContributionsFeed/ContributionsFeed';
import ProjectStatistics from './components/ProjectStatistics';
import useProjectContributions from './components/ProjectContributions/useProjectContributions';
import ActiveRunsTable from './components/ActiveRunsTable/ActiveRunsTable';
import QuickStart from './components/QuickStart';
import AimIntegrations from './components/AimIntegrations';

import './Dashboard.scss';

function Dashboard(): React.FunctionComponentElement<React.ReactNode> {
  const { projectContributionsStore } = useProjectContributions();

  const totalRunsCount = projectContributionsStore.data?.num_runs ?? 0;
  const isLoading = projectContributionsStore.loading;

  return (
    <ErrorBoundary>
      <section className='Dashboard'>
        <ExploreSection />
        <div
          className={classnames('Dashboard__middle', {
            'Dashboard__middle--centered': isLoading,
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
                className='Dashboard__middle__title'
              >
                Overview
              </Text>
              <ProjectStatistics />
              <ActiveRunsTable />
              <ProjectContributions />
              <ContributionsFeed />
            </>
          )}
          {!isLoading && <AimIntegrations />}
        </div>
        <HomeRight />
      </section>
    </ErrorBoundary>
  );
}
export default Dashboard;
