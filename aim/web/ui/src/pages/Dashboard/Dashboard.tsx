import React from 'react';
import classnames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner, Text } from 'components/kit';
import Button from 'components/newKit/Button';

import ProjectContributions from './components/ProjectContributions/ProjectContributions';
import ExploreSection from './components/ExploreSection/ExploreSection';
import DashboardRight from './components/DashboardRight/DashboardRight';
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
          <div className='flex fjb'>
            <Button size='medium'>medium</Button>
            <Button size='medium' color='secondary'>
              medium
            </Button>
            <Button size='medium' color='success'>
              medium
            </Button>
            <Button size='medium' color='error'>
              medium
            </Button>
            <Button size='medium' color='warning'>
              medium
            </Button>
          </div>
          <div style={{ margin: '30px 0' }} className='flex fjb'>
            <Button size='medium' variant='outlined'>
              medium
            </Button>
            <Button size='medium' color='secondary' variant='outlined'>
              medium
            </Button>
            <Button size='medium' color='success' variant='outlined'>
              medium
            </Button>
            <Button size='medium' color='error' variant='outlined'>
              medium
            </Button>
            <Button size='medium' color='warning' variant='outlined'>
              medium
            </Button>
          </div>
          <div className='flex fjb'>
            <Button size='medium' variant='text'>
              medium
            </Button>
            <Button size='medium' color='secondary' variant='text'>
              medium
            </Button>
            <Button size='medium' color='success' variant='text'>
              medium
            </Button>
            <Button size='medium' color='error' variant='text'>
              medium
            </Button>
            <Button size='medium' color='warning' variant='text'>
              medium
            </Button>
          </div>
          {/* {isLoading ? (
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
              <ContributionsFeed />
            </>
          )}
          {!isLoading && !totalRunsCount && <AimIntegrations />} */}
        </div>
        <DashboardRight />
      </section>
    </ErrorBoundary>
  );
}
export default Dashboard;
