import React from 'react';
import {
  Link,
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { Tab, Tabs } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner } from 'components/kit';

import { ILogsTabWrapperProps } from './LogsTabWrapper.d';

import './LogsTabWrapper.scss';

const RunLogsTab = React.lazy(
  () => import(/* webpackChunkName: "RunLogsTab" */ '../RunLogsTab'),
);

function LogsTabWrapper({
  isRunLogsLoading,
  runHash,
  runLogs,
  inProgress,
  updatedLogsCount,
}: ILogsTabWrapperProps) {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = React.useState(pathname);

  const tabs: Record<string, string> = {
    run_logs: 'Run Logs',
    run_output_logs: 'Run Output Logs',
  };

  function handleTabChange(event: React.ChangeEvent<{}>, newValue: string) {
    setActiveTab(newValue);
  }

  function getCurrentTabValue(pathname: string, url: string) {
    const values = Object.keys(tabs).map((tabKey) => `${url}/${tabKey}`);
    return values.indexOf(pathname) === -1 ? false : pathname;
  }

  const tabContent: Record<string, JSX.Element> = {
    run_logs: (
      <RunLogsTab
        isRunLogsLoading={isRunLogsLoading}
        runHash={runHash}
        runLogs={runLogs}
        inProgress={inProgress}
        updatedLogsCount={updatedLogsCount}
      />
    ),
    run_output_logs: <div></div>,
  };

  return (
    <ErrorBoundary>
      <div className='LogsTabWrapper'>
        <div className='LogsTabWrapper__tabsContainer'>
          <Tabs
            className='LogsTabWrapper__tabsContainer__tabs'
            value={getCurrentTabValue(pathname, url)}
            onChange={handleTabChange}
            indicatorColor='primary'
            textColor='primary'
            variant='fullWidth'
          >
            {Object.keys(tabs).map((tabKey: string) => (
              <Tab
                key={`${url}/${tabKey}`}
                label={tabs[tabKey]}
                value={`${url}/${tabKey}`}
                component={Link}
                to={`${url}/${tabKey}`}
              />
            ))}
          </Tabs>
        </div>

        <Switch>
          {Object.keys(tabs).map((tabKey: string) => (
            <Route path={`${url}/${tabKey}`} key={tabKey}>
              <ErrorBoundary>
                <div className='LogsTabWrapper__tabPanelWrapper'>
                  <React.Suspense
                    fallback={
                      <div className='LogsTabWrapper__tabPanelWrapper__suspenseLoaderContainer'>
                        <Spinner />
                      </div>
                    }
                  >
                    {tabContent[tabKey]}
                  </React.Suspense>
                </div>
              </ErrorBoundary>
            </Route>
          ))}
        </Switch>
      </div>
    </ErrorBoundary>
  );
}

LogsTabWrapper.displayName = 'LogsTabWrapper';

export default React.memo(LogsTabWrapper);
