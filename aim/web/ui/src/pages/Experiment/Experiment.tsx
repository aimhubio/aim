import React, { LazyExoticComponent } from 'react';
import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Paper, Tab, Tabs } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import NotificationContainer, {
  useNotificationContainer,
} from 'components/NotificationContainer';
import { Spinner } from 'components/kit';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { setDocumentTitle } from 'utils/document/documentTitle';

import ExperimentHeader from './components/ExperimentHeader';
import useExperimentState from './useExperimentState';

import './Experiment.scss';

const ExperimentOverviewTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ExperimentOverviewTab" */ './components/ExperimentOverviewTab'
    ),
);

const ExperimentRunsTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ExperimentOverviewTab" */ './components/ExperimentRunsTab'
    ),
);

const ExperimentNotesTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ExperimentOverviewTab" */ './components/ExperimentNotesTab'
    ),
);

const ExperimentSettingsTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ExperimentOverviewTab" */ './components/ExperimentSettingsTab'
    ),
);

const tabs: Record<string, string> = {
  overview: 'Overview',
  runs: 'Runs',
  notes: 'Notes',
  settings: 'Settings',
};

function Experiment(): React.FunctionComponentElement<React.ReactNode> {
  const { experimentId } = useParams<{ experimentId: string }>();
  const history = useHistory();
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = React.useState(pathname);
  const {
    experimentState,
    experimentsState,
    getExperimentsData,
    updateExperiment,
    deleteExperiment,
  } = useExperimentState(experimentId);
  const { notificationState, onNotificationDelete } =
    useNotificationContainer();

  const { data: experimentData, loading: isExperimentLoading } =
    experimentState;

  const { data: experimentsData, loading: isExperimentsLoading } =
    experimentsState;

  const tabContent: Record<
    string,
    { props: Record<string, unknown>; Component: LazyExoticComponent<any> }
  > = {
    overview: {
      props: {
        experimentName: experimentData?.name ?? '',
        experimentId,
        description: experimentData?.description ?? '',
      },
      Component: ExperimentOverviewTab,
    },
    runs: {
      props: {
        experimentName: experimentData?.name ?? '',
        experimentId,
      },
      Component: ExperimentRunsTab,
    },
    notes: {
      props: {
        experimentId,
      },
      Component: ExperimentNotesTab,
    },
    settings: {
      props: {
        experimentName: experimentData?.name ?? '',
        updateExperiment,
        deleteExperiment,
        description: experimentData?.description ?? '',
      },
      Component: ExperimentSettingsTab,
    },
  };

  function handleTabChange(event: React.ChangeEvent<{}>, newValue: string) {
    setActiveTab(newValue);
  }

  function redirect(): void {
    const splitPathname: string[] = pathname.split('/');
    const path: string = `${url}/overview`;
    if (splitPathname.length > 4) {
      history.replace(path);
      setActiveTab(path);
      return;
    }
    if (splitPathname[3]) {
      if (!Object.keys(tabs).includes(splitPathname[3])) {
        history.replace(path);
      }
    } else {
      history.replace(path);
    }
    setActiveTab(path);
  }

  function getCurrentTabValue(pathname: string, url: string) {
    const values = Object.keys(tabs).map((tabKey) => `${url}/${tabKey}`);
    return values.indexOf(pathname) === -1 ? false : pathname;
  }

  React.useEffect(() => {
    if (pathname !== activeTab) {
      setActiveTab(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  React.useEffect(() => {
    setDocumentTitle(experimentData?.name || experimentId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentData]);

  React.useEffect(() => {
    redirect();
    analytics.pageView(ANALYTICS_EVENT_KEYS.experiment.pageView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <section className='Experiment'>
        <ExperimentHeader
          experimentData={experimentData}
          experimentsData={experimentsData}
          isExperimentLoading={isExperimentLoading}
          isExperimentsLoading={isExperimentsLoading}
          experimentId={experimentId}
          getExperimentsData={getExperimentsData}
        />
        <Paper className='Experiment__tabsContainer'>
          <Tabs
            className='Experiment__tabsContainer__tabs container'
            value={getCurrentTabValue(pathname, url)}
            onChange={handleTabChange}
            indicatorColor='primary'
            textColor='primary'
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
        </Paper>
        <BusyLoaderWrapper
          isLoading={isExperimentLoading}
          height='calc(100vh - 112px)'
        >
          <Switch>
            {Object.keys(tabs).map((tabKey: string) => {
              const { Component, props } = tabContent[tabKey];
              return (
                <Route path={`${url}/${tabKey}`} key={tabKey}>
                  <ErrorBoundary>
                    {tabKey === 'overview' ? (
                      <div className='Experiment__tabPanelBox overviewPanel'>
                        <React.Suspense
                          fallback={
                            <div className='Experiment__tabPanelBox__suspenseLoaderContainer'>
                              <Spinner />
                            </div>
                          }
                        >
                          <Component {...props} />
                        </React.Suspense>
                      </div>
                    ) : (
                      <div className='Experiment__tabPanelBox'>
                        <div className='Experiment__tabPanel container'>
                          <React.Suspense
                            fallback={
                              <div className='Experiment__tabPanelBox__suspenseLoaderContainer'>
                                <Spinner />
                              </div>
                            }
                          >
                            <Component {...props} />
                          </React.Suspense>
                        </div>
                      </div>
                    )}
                  </ErrorBoundary>
                </Route>
              );
            })}
          </Switch>
        </BusyLoaderWrapper>
      </section>
      <NotificationContainer
        handleClose={onNotificationDelete}
        data={notificationState!}
      />
    </ErrorBoundary>
  );
}
export default React.memo(Experiment);
