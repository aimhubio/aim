import React, { memo, useRef, useState } from 'react';
import moment from 'moment';
import {
  useParams,
  useRouteMatch,
  Link,
  Switch,
  Route,
  Redirect,
  useLocation,
} from 'react-router-dom';
import classNames from 'classnames';

import { Paper, Tab, Tabs } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { Badge, Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import StatusLabel from 'components/StatusLabel';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';

import { DateWithOutSeconds } from 'config/dates/dates';

import useModel from 'hooks/model/useModel';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import { processDurationTime } from 'utils/processDurationTime';

import RunDetailSettingsTab from './RunDetailSettingsTab';
import RunDetailMetricsAndSystemTab from './RunDetailMetricsAndSystemTab';
import RunDetailParamsTab from './RunDetailParamsTab';
import RunSelectPopoverContent from './RunSelectPopoverContent';
import TraceVisualizationContainer from './TraceVisualizationContainer';

import './RunDetail.scss';

function RunDetail(): React.FunctionComponentElement<React.ReactNode> {
  let runsOfExperimentRequestRef: any = null;
  const runData = useModel(runDetailAppModel);
  const containerRef = useRef<HTMLDivElement | any>(null);
  const [dateNow, setDateNow] = useState(Date.now());
  const [isRunSelectDropdownOpen, setIsRunSelectDropdownOpen] = useState(false);
  const { runHash } = useParams<{ runHash: string }>();
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState(pathname);

  const tabs = [
    'parameters',
    'metrics',
    'system',
    'distributions',
    'images',
    'audios',
    'texts',
    'figures',
    'settings',
  ];

  // TODO: add code splitting(lazy loading)
  const tabContent: { [key: string]: JSX.Element } = {
    parameters: (
      <RunDetailParamsTab
        runParams={runData?.runParams}
        isRunInfoLoading={runData?.isRunInfoLoading}
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
    };
  }, [runHash]);

  React.useEffect(() => {
    if (runData?.experimentId) {
      getRunsOfExperiment(runData?.experimentId);
    }
  }, [runData?.experimentId]);

  React.useEffect(() => {
    if (pathname !== activeTab) {
      setActiveTab(pathname);
    }
  }, [pathname]);

  React.useEffect(() => {
    analytics.pageView('[RunDetail]');
  }, []);

  return (
    <section className='RunDetail container' ref={containerRef}>
      <div className='RunDetail__runDetailContainer'>
        <div className='RunDetail__runDetailContainer__appBarContainer'>
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
                    <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__container'>
                      <Text tint={100} size={16} weight={600}>
                        {`${
                          runData?.runInfo?.experiment?.name || 'default'
                        } / ${runHash || ''}`}
                      </Text>
                    </div>
                  </>
                ) : (
                  <Skeleton variant='rect' height={24} width={340} />
                )}
                <Button
                  disabled={
                    runData?.isExperimentsLoading || runData?.isRunInfoLoading
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
              </div>
            )}
            component={
              <RunSelectPopoverContent
                getRunsOfExperiment={getRunsOfExperiment}
                experimentsData={runData?.experimentsData}
                experimentId={runData?.experimentId}
                runsOfExperiment={runData?.runsOfExperiment}
                runInfo={runData?.runInfo}
                isRunsOfExperimentLoading={runData?.isRunsOfExperimentLoading}
                isRunInfoLoading={runData?.isRunInfoLoading}
                isLoadMoreButtonShown={runData?.isLoadMoreButtonShown}
                onRunsSelectToggle={onRunsSelectToggle}
                dateNow={dateNow}
              />
            }
          />
        </div>

        <div className='RunDetail__runDetailContainer__headerContainer'>
          <div className='RunDetail__runDetailContainer__headerContainer__infoBox'>
            {!runData?.isRunInfoLoading ? (
              <>
                <Text
                  component='p'
                  tint={100}
                  size={14}
                  weight={600}
                  className='RunDetail__runDetailContainer__headerContainer__infoBox__dateTitle'
                >
                  {`${moment(runData?.runInfo?.creation_time * 1000).format(
                    DateWithOutSeconds,
                  )} | ${processDurationTime(
                    runData?.runInfo?.creation_time * 1000,
                    runData?.runInfo?.end_time
                      ? runData?.runInfo?.end_time * 1000
                      : dateNow,
                  )}`}
                </Text>
                <StatusLabel
                  status={runData?.runInfo?.end_time ? 'alert' : 'success'}
                  title={
                    runData?.runInfo?.end_time ? 'Finished' : 'In Progress'
                  }
                />
              </>
            ) : (
              <Skeleton variant='rect' height={24} width={300} />
            )}
          </div>
          <div className='RunDetail__runDetailContainer__headerContainer__tagsBox ScrollBar__hidden'>
            {runData?.runInfo?.tags.map((tag: any, i: number) => (
              <Badge color={tag.color} label={tag.name} key={i} />
            ))}
          </div>
        </div>
        <Paper className='RunDetail__runDetailContainer__tabsContainer'>
          <Tabs
            className='RunDetail__runDetailContainer__Tabs'
            value={activeTab}
            onChange={handleTabChange}
            aria-label='simple tabs example'
            indicatorColor='primary'
            textColor='primary'
          >
            {tabs.map((tab) => (
              <Tab
                key={tab}
                label={tab}
                value={`${url}/${tab}`}
                component={Link}
                to={`${url}/${tab}`}
              />
            ))}
          </Tabs>
        </Paper>
        <BusyLoaderWrapper isLoading={runData?.isRunInfoLoading} height='100%'>
          <Switch>
            {tabs.map((tab: string) => (
              <Route path={`${url}/${tab}`} key={tab}>
                <div className='RunDetail__runDetailContainer__tabPanel'>
                  {tabContent[tab]}
                </div>
              </Route>
            ))}
            <Redirect to={`${url}/parameters`} />
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
  );
}

export default memo(RunDetail);
