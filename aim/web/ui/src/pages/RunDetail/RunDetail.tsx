import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';
import moment from 'moment';
import {
  Link,
  NavLink,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { useModel } from 'hooks';

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
import { DATE_WITH_SECONDS } from 'config/dates/dates';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';
import notesModel from 'services/models/notes/notesModel';

import { setDocumentTitle } from 'utils/document/documentTitle';
import { processDurationTime } from 'utils/processDurationTime';

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
      /* webpackChunkName: "RunDetailSettingsTab" */ './RunDetailSettingsTab/RunDetailSettingsTab'
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
const RunLogRecords = React.lazy(
  () => import(/* webpackChunkName: "RunLogRecords" */ './RunLogRecords'),
);

const tabs: Record<string, string> = {
  overview: 'Overview',
  run_parameters: 'Run Params',
  notes: 'Notes',
  logs: 'Logs',
  messages: 'Messages',
  metrics: 'Metrics',
  system: 'System',
  distributions: 'Distributions',
  images: 'Images',
  audios: 'Audios',
  texts: 'Texts',
  figures: 'Figures',
  settings: 'Settings',
};

function RunDetail(): React.FunctionComponentElement<React.ReactNode> {
  const { runHash } = useParams<{ runHash: string }>();
  const history = useHistory();
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const runData = useModel(runDetailAppModel);

  let runsOfExperimentRequestRef: any = null;
  const containerRef = React.useRef<HTMLDivElement | any>(null);
  const [dateNow, setDateNow] = React.useState(Date.now());
  const [isRunSelectDropdownOpen, setIsRunSelectDropdownOpen] =
    React.useState(false);
  const [activeTab, setActiveTab] = React.useState(pathname);

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

  const tabContent: Record<string, JSX.Element> = {
    overview: <RunOverviewTab runHash={runHash} runData={runData} />,
    run_parameters: (
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
    messages: (
      <RunLogRecords
        runHash={runHash}
        inProgress={_.isNil(runData?.runInfo?.end_time)}
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
        defaultName={runData?.runInfo?.name}
        defaultDescription={runData?.runInfo?.description}
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

  function handleTabChange(event: React.ChangeEvent<{}>, newValue: string) {
    setActiveTab(newValue);
  }

  function onRunsSelectToggle() {
    setIsRunSelectDropdownOpen(!isRunSelectDropdownOpen);
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
    setDateNow(Date.now());
    runDetailAppModel.initialize();
    const runsRequestRef = runDetailAppModel.getRunInfo(runHash);
    const experimentRequestRef: any = runDetailAppModel.getExperimentsData();
    experimentRequestRef?.call();

    runsRequestRef.call().then((runInfo) => {
      setDocumentTitle(runInfo?.props.name || runHash, true);
    });
    return () => {
      runsRequestRef.abort();
      runsOfExperimentRequestRef?.abort();
      experimentRequestRef?.abort();
      notesModel.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runHash]);

  React.useEffect(() => {
    redirect();
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.pageView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <section className='RunDetail' ref={containerRef}>
        <div className='RunDetail__runDetailContainer'>
          <div className='RunDetail__runDetailContainer__appBarContainer'>
            <div className='container RunDetail__runDetailContainer__appBarContainer__appBarBox'>
              <div className='RunDetail__runDetailContainer__appBarContainer__appBarBox__runInfoBox'>
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
                          <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__appBarTitleBoxWrapper'>
                            <Tooltip
                              title={`${
                                runData?.runInfo?.experiment?.name || 'default'
                              } / ${runData?.runInfo?.name || ''}`}
                            >
                              <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__container'>
                                <Text
                                  tint={100}
                                  size={16}
                                  weight={600}
                                  className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__title'
                                >
                                  {`${
                                    runData?.runInfo?.experiment?.name ||
                                    'default'
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
                              size='xSmall'
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
                          </div>
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
                <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__date'>
                  {!runData?.isRunInfoLoading ? (
                    <>
                      <Icon name='calendar' fontSize={12} />
                      <Text size={11} tint={70} weight={400}>
                        {`${moment(
                          runData?.runInfo?.creation_time * 1000,
                        ).format(DATE_WITH_SECONDS)} • ${processDurationTime(
                          runData?.runInfo?.creation_time * 1000,
                          runData?.runInfo?.end_time
                            ? runData?.runInfo?.end_time * 1000
                            : dateNow,
                        )}`}
                      </Text>
                    </>
                  ) : (
                    <Skeleton
                      className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__Skeleton'
                      variant='rect'
                      height={24}
                      width={340}
                    />
                  )}
                </div>
              </div>
              <div className='RunDetail__runDetailContainer__appBarContainer__appBarBox__actionContainer'>
                <NavLink to={`${url}/settings`}>
                  <Button withOnlyIcon size='small' color='secondary'>
                    <Icon name='edit' />
                  </Button>
                </NavLink>
              </div>
            </div>
          </div>
          <Paper className='RunDetail__runDetailContainer__tabsContainer'>
            <Tabs
              className='RunDetail__runDetailContainer__Tabs container'
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
            isLoading={runData?.isRunInfoLoading}
            height='calc(100vh - 98px)'
          >
            <Switch>
              {Object.keys(tabs).map((tabKey: string) => (
                <Route path={`${url}/${tabKey}`} key={tabKey}>
                  <ErrorBoundary>
                    {tabKey === 'overview' ? (
                      <div className='RunDetail__runDetailContainer__tabPanelBox overviewPanel'>
                        <React.Suspense
                          fallback={
                            <div className='RunDetail__runDetailContainer__tabPanelBox__suspenseLoaderContainer'>
                              <Spinner />
                            </div>
                          }
                        >
                          {tabContent[tabKey]}
                        </React.Suspense>
                      </div>
                    ) : (
                      <div className='RunDetail__runDetailContainer__tabPanelBox'>
                        <div className='RunDetail__runDetailContainer__tabPanel container'>
                          <React.Suspense
                            fallback={
                              <div className='RunDetail__runDetailContainer__tabPanelBox__suspenseLoaderContainer'>
                                <Spinner />
                              </div>
                            }
                          >
                            {tabContent[tabKey]}
                          </React.Suspense>
                        </div>
                      </div>
                    )}
                  </ErrorBoundary>
                </Route>
              ))}
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
