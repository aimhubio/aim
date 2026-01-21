import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import { Paper, Tab, Tabs } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner, Text } from 'components/kit';
import TabPanel from 'components/TabPanel/TabPanel';

import ProjectContributions from './components/ProjectContributions/ProjectContributions';
import DashboardRight from './components/DashboardRight/DashboardRight';
import DashboardContributionsFeed from './components/DashboardContributionsFeed';
import ProjectStatistics from './components/ProjectStatistics';
import useProjectContributions from './components/ProjectContributions/useProjectContributions';
import ActiveRunsTable from './components/ActiveRunsTable/ActiveRunsTable';
import ActiveRunMetrics from './components/ActiveRunMetrics/ActiveRunMetrics';
import QuickStart from './components/QuickStart';
import AimIntegrations from './components/AimIntegrations';

import './Dashboard.scss';

function Dashboard(): React.FunctionComponentElement<React.ReactNode> {
  const { projectContributionsStore } = useProjectContributions();
  const [activeTab, setActiveTab] = useState(1);
  const [selectedRunHash, setSelectedRunHash] = useState<string | null>(null);

  const totalRunsCount = projectContributionsStore.data?.num_runs ?? 0;
  const activeRunsCount = projectContributionsStore.data?.num_active_runs ?? 0;
  const isLoading = projectContributionsStore.loading;
  useEffect(() => {
    if (!isLoading && activeRunsCount === 0) {
      // Switch to overview tab if there are no active runs
      setActiveTab(0);
    }
  }, [isLoading]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
    // Reset selected run when switching tabs
    if (newValue !== 1) {
      setSelectedRunHash(null);
    }
  };

  const handleRunSelect = (runHash: string) => {
    setSelectedRunHash(runHash);
  };

  return (
    <ErrorBoundary>
      <section className='Dashboard'>
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
              <Paper className='Dashboard__tabsContainer'>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor='primary'
                  className='Dashboard__tabsContainer__tabs'
                >
                  <Tab label='Overview' />
                  <Tab label='Active Runs' disabled={activeRunsCount === 0} />
                </Tabs>
              </Paper>
              <TabPanel
                value={activeTab}
                index={0}
                className='Dashboard__tabPanel'
              >
                <Text
                  tint={100}
                  weight={600}
                  size={18}
                  className='Dashboard__middle__title'
                >
                  Overview
                </Text>
                <ProjectStatistics />
                <ProjectContributions />
                <DashboardContributionsFeed />
              </TabPanel>
              <TabPanel
                value={activeTab}
                index={1}
                className='Dashboard__tabPanel'
              >
                <Text
                  tint={100}
                  weight={600}
                  size={18}
                  className='Dashboard__middle__title'
                >
                  Active Runs
                </Text>
                <div className='Dashboard__activeRuns'>
                  <div className='Dashboard__activeRuns__tableContainer'>
                    <ActiveRunsTable
                      onRunSelect={handleRunSelect}
                      selectedRunHash={selectedRunHash}
                    />
                  </div>
                  {selectedRunHash && (
                    <div className='Dashboard__activeRuns__metricsContainer'>
                      <ActiveRunMetrics runHash={selectedRunHash} />
                    </div>
                  )}
                </div>
              </TabPanel>
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
