import React from 'react';
import classnames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner, Text } from 'components/kit';

import ProjectContributions from './components/ProjectContributions/ProjectContributions';
import ExploreSection from './components/ExploreSection/ExploreSection';
import DashboardRight from './components/DashboardRight/DashboardRight';
import DashboardContributionsFeed from './components/DashboardContributionsFeed';
import ProjectStatistics from './components/ProjectStatistics';
import useProjectContributions from './components/ProjectContributions/useProjectContributions';
import ActiveRunsTable from './components/ActiveRunsTable/ActiveRunsTable';
import QuickStart from './components/QuickStart';
import AimIntegrations from './components/AimIntegrations';

import './Dashboard.scss';

function Dashboard(): React.FunctionComponentElement<React.ReactNode> {
  const { projectContributionsStore } = useProjectContributions();

  const totalRunsCount = projectContributionsStore.data?.num_runs ?? 0;
  const activeRunsCount = projectContributionsStore.data?.num_active_runs ?? 0;
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
              {activeRunsCount ? <ActiveRunsTable /> : null}
              <ProjectContributions />
              <DashboardContributionsFeed />
            </>
          )}
          {!isLoading && !totalRunsCount && <AimIntegrations />}
        </div>
        <DashboardRight />
      </section>
    </ErrorBoundary>
  );
}
export default Dashboard;
