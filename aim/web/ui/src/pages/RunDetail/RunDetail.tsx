import React from 'react';
import {
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import classNames from 'classnames';
import _ from 'lodash-es';

import { Paper, Tab, Tabs, Tooltip } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import StatusLabel from 'components/StatusLabel';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Spinner from 'components/kit/Spinner';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useModel from 'hooks/model/useModel';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';
import notesModel from 'services/models/notes/notesModel';

import RunSelectPopoverContent from './RunSelectPopoverContent';

import './RunDetail.scss';

const RunDetailNotesTab = React.lazy(
  () =>
    import(/* webpackChunkName: "RunDetailNotesTab" */ './RunDetailNotesTab'),
);

const RunDetailParamsTab = React.lazy(
  () =>
    import(/* webpackChunkName: "RunDetailParamsTab" */ './RunDetailParamsTab'),
);
const RunDetailSettingsTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "RunDetailSettingsTab" */ './RunDetailSettingsTab'
    ),
);
const RunDetailMetricsAndSystemTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "RunDetailMetricsAndSystemTab" */ './RunDetailMetricsAndSystemTab'
    ),
);
const TraceVisualizationContainer = React.lazy(
  () =>
    import(
      /* webpackChunkName: "TraceVisualizationContainer" */ './TraceVisualizationContainer'
    ),
);
const RunOverviewTab = React.lazy(
  () => import(/* webpackChunkName: "RunOverviewTab" */ './RunOverviewTab'),
);
const RunLogsTab = React.lazy(
  () => import(/* webpackChunkName: "RunLogsTab" */ './RunLogsTab'),
);

const tabs: string[] = [
  'overview',
  'parameters',
  'notes',
  'logs',
  'metrics',
  'system',
  'distributions',
  'images',
  'audios',
  'texts',
  'figures',
  'settings',
];

function RunDetail(): React.FunctionComponentElement<React.ReactNode> {
  let runsOfExperimentRequestRef: any = null;
  const runData = useModel(runDetailAppModel);

  const containerRef = React.useRef<HTMLDivElement | any>(null);
  const [dateNow, setDateNow] = React.useState(Date.now());
  const [isRunSelectDropdownOpen, setIsRunSelectDropdownOpen] =
    React.useState(false);
  const { runHash } = useParams<{ runHash: string }>();
  const { url } = useRouteMatch();
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState(location.pathname);

  const tabContent: { [key: string]: JSX.Element } = {
    overview: <RunOverviewTab runHash={runHash} runData={runData} />,
    parameters: (
      <RunDetailParamsTab
        runParams={runData?.runParams}
        isRunInfoLoading={runData?.isRunInfoLoading}
      />
    ),
    logs: (
      <RunLogsTab
        runHash={runHash}
        runLogs={runData?.runLogs}
        inProgress={_.isNil(runData?.runInfo?.end_time)}
        updatedLogsCount={runData?.updatedLogsCount}
        isRunLogsLoading={runData?.isRunLogsLoading}
      />
    ),
    metrics: (
      <RunDetailMetricsAndSystemTab
        runHash={runHash}
        runTraces={runData?.runTraces}
        runBatch={runData?.runMetricsBatch}
        isRunBatchLoading={runData?.isRunBatchLoading}
      />
    ),
    system: (
      <RunDetailMetricsAndSystemTab
        runHash={runHash}
        runTraces={runData?.runTraces}
        runBatch={runData?.runSystemBatch}
        isSystem
        isRunBatchLoading={runData?.isRunBatchLoading}
      />
    ),
    distributions: (
      <TraceVisualizationContainer
        runHash={runHash}
        traceType='distributions'
        traceInfo={runData?.runTraces}
      />
    ),
    images: (
      <TraceVisualizationContainer
        runHash={runHash}
        traceType='images'
        traceInfo={runData?.runTraces}
        runParams={runData?.runParams}
      />
    ),
    audios: (
      <TraceVisualizationContainer
        runHash={runHash}
        traceType='audios'
        traceInfo={runData?.runTraces}
        runParams={runData?.runParams}
      />
    ),
    texts: (
      <TraceVisualizationContainer
        runHash={runHash}
        traceType='texts'
        traceInfo={runData?.runTraces}
      />
    ),
    figures: (
      <TraceVisualizationContainer
        runHash={runHash}
        traceType='figures'
        traceInfo={runData?.runTraces}
      />
    ),
    settings: (
      <RunDetailSettingsTab
        isArchived={runData?.runInfo?.archived}
        runHash={runHash}
      />
    ),
    notes: <RunDetailNotesTab runHash={runHash} />,
  };

  function getRunsOfExperiment(
    id: string,
    params?: { limit: number; offset?: string },
    isLoadMore?: boolean,
  ) {
    runsOfExperimentRequestRef = runDetailAppModel.getRunsOfExperiment(
      id,
      params,
      isLoadMore,
    );
    runsOfExperimentRequestRef.call();
  }

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue);
  };

  function onRunsSelectToggle() {
    setIsRunSelectDropdownOpen(!isRunSelectDropdownOpen);
  }

  React.useEffect(() => {
    setDateNow(Date.now());
    runDetailAppModel.initialize();
    const runsRequestRef = runDetailAppModel.getRunInfo(runHash);
    const experimentRequestRef: any = runDetailAppModel.getExperimentsData();
    experimentRequestRef?.call();
    runsRequestRef.call();
    return () => {
      runsRequestRef.abort();
      runsOfExperimentRequestRef?.abort();
      experimentRequestRef?.abort();
      notesModel.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runHash]);

  React.useEffect(() => {
    if (runData?.experimentId) {
      getRunsOfExperiment(runData?.experimentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runData?.experimentId]);

  React.useEffect(() => {
    if (location.pathname !== activeTab) {
      setActiveTab(location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  React.useEffect(() => {
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.pageView);
  }, []);

  return (
    <ErrorBoundary>
      <section className='RunDetail' ref={containerRef}>
        <div className='RunDetail__runDetailContainer'>
          <div className='RunDetail__runDetailContainer__appBarContainer'>
            <div className='container RunDetail__runDetailContainer__appBarContainer__appBarBox'>
              <ControlPopover
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                anchor={({ onAnchorClick, opened }) => (
                  <div
                    className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox'
                    onClick={onAnchorClick}
                  >
                    {!runData?.isRunInfoLoading ? (
                      <>
                        <Tooltip
                          title={`${
                            runData?.runInfo?.experiment?.name || 'default'
                          } / ${runData?.runInfo?.name || ''}`}
                        >
                          <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__container'>
                            <Text tint={100} size={16} weight={600}>
                              {`${
                                runData?.runInfo?.experiment?.name || 'default'
                              } / ${runData?.runInfo?.name || ''}`}
                            </Text>
                          </div>
                        </Tooltip>
                        <Button
                          disabled={
                            runData?.isExperimentsLoading ||
                            runData?.isRunInfoLoading
                          }
                          color={opened ? 'primary' : 'default'}
                          size='small'
                          className={classNames(
                            'RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__buttonSelectToggler',
                            { opened: opened },
                          )}
                          withOnlyIcon
                        >
                          <Icon name={opened ? 'arrow-up' : 'arrow-down'} />
                        </Button>
                        <StatusLabel
                          status={
                            runData?.runInfo?.end_time ? 'alert' : 'success'
                          }
                          title={
                            runData?.runInfo?.end_time
                              ? 'Finished'
                              : 'In Progress'
                          }
                        />
                      </>
                    ) : (
                      <div className='flex'>
                        <Skeleton
                          className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__Skeleton'
                          variant='rect'
                          height={24}
                          width={340}
                        />
                        <Skeleton variant='rect' height={24} width={70} />
                      </div>
                    )}
                  </div>
                )}
                component={
                  <RunSelectPopoverContent
                    getRunsOfExperiment={getRunsOfExperiment}
                    experimentsData={runData?.experimentsData}
                    experimentId={runData?.experimentId}
                    runsOfExperiment={runData?.runsOfExperiment}
                    runInfo={runData?.runInfo}
                    isRunsOfExperimentLoading={
                      runData?.isRunsOfExperimentLoading
                    }
                    isRunInfoLoading={runData?.isRunInfoLoading}
                    isLoadMoreButtonShown={runData?.isLoadMoreButtonShown}
                    onRunsSelectToggle={onRunsSelectToggle}
                    dateNow={dateNow}
                  />
                }
              />
            </div>
          </div>
          <Paper className='RunDetail__runDetailContainer__tabsContainer'>
            <Tabs
              className='RunDetail__runDetailContainer__Tabs container'
              value={location.pathname}
              onChange={handleTabChange}
              indicatorColor='primary'
              textColor='primary'
            >
              {tabs.map((tab) => (
                <Tab
                  key={`${url}/${tab}`}
                  label={tab}
                  value={`${url}/${tab}`}
                  component={Link}
                  to={`${url}/${tab}`}
                />
              ))}
            </Tabs>
          </Paper>
          <BusyLoaderWrapper
            isLoading={runData?.isRunInfoLoading}
            height='calc(100vh - 98px)'
          >
            <Switch>
              {tabs.map((tab: string) => (
                <Route path={`${url}/${tab}`} key={tab}>
                  <ErrorBoundary>
                    {tab === 'overview' ? (
                      <div className='RunDetail__runDetailContainer__tabPanel overviewPanel'>
                        <React.Suspense fallback={<Spinner />}>
                          {tabContent[tab]}
                        </React.Suspense>
                      </div>
                    ) : (
                      <div className='RunDetail__runDetailContainer__tabPanelBox'>
                        <div className='RunDetail__runDetailContainer__tabPanel container'>
                          <React.Suspense fallback={<Spinner />}>
                            {tabContent[tab]}
                          </React.Suspense>
                        </div>
                      </div>
                    )}
                  </ErrorBoundary>
                </Route>
              ))}
              <Redirect to={`${url}/overview`} />
            </Switch>
          </BusyLoaderWrapper>
        </div>
        {runData?.notifyData?.length > 0 && (
          <NotificationContainer
            handleClose={runDetailAppModel?.onNotificationDelete}
            data={runData?.notifyData}
          />
        )}
      </section>
    </ErrorBoundary>
  );
}

export default React.memo(RunDetail);
