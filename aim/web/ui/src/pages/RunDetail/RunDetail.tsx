import React, { memo, useRef, useState } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';

import { Paper, Tab, Tabs } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import TabPanel from 'components/TabPanel/TabPanel';
import { Badge, Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import StatusLabel from 'components/StatusLabel';
import ControlPopover from 'components/ControlPopover/ControlPopover';

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
  const [value, setValue] = useState(0);
  const [dateNow, setDateNow] = useState(Date.now());
  const [isRunSelectDropdownOpen, setIsRunSelectDropdownOpen] = useState(false);
  const { runHash } = useParams<{ runHash: string }>();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
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
                        {`${runData?.runInfo?.experiment?.name || ''} / ${
                          runHash || ''
                        }`}
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
                    'DD MMM YYYY, HH:mm A',
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
            value={value}
            onChange={handleChange}
            aria-label='simple tabs example'
            indicatorColor='primary'
            textColor='primary'
          >
            <Tab label='Parameters' />
            <Tab label='Metrics' />
            <Tab label='System' />
            <Tab label='Distributions' />
            <Tab label='Images' />
            <Tab label='Texts' />
            <Tab label='Figures' />
            <Tab label='Settings' />
          </Tabs>
        </Paper>
        <TabPanel
          value={value}
          index={0}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailParamsTab
            runParams={runData?.runParams}
            isRunInfoLoading={runData?.isRunInfoLoading}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={1}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailMetricsAndSystemTab
            runHash={runHash}
            runTraces={runData?.runTraces}
            runBatch={runData?.runMetricsBatch}
            isRunBatchLoading={runData?.isRunBatchLoading}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={2}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailMetricsAndSystemTab
            runHash={runHash}
            runTraces={runData?.runTraces}
            runBatch={runData?.runSystemBatch}
            isSystem
            isRunBatchLoading={runData?.isRunBatchLoading}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={3}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <TraceVisualizationContainer
            runHash={runHash}
            traceType='distributions'
            traceInfo={runData?.runTraces}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={4}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <TraceVisualizationContainer
            runHash={runHash}
            traceType='images'
            traceInfo={runData?.runTraces}
            runParams={runData?.runParams}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={5}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <TraceVisualizationContainer
            runHash={runHash}
            traceType='texts'
            traceInfo={runData?.runTraces}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={6}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <TraceVisualizationContainer
            runHash={runHash}
            traceType='figures'
            traceInfo={runData?.runTraces}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={7}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailSettingsTab
            isArchived={runData?.runInfo?.archived}
            runHash={runHash}
          />
        </TabPanel>
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
