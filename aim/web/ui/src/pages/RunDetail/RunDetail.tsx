import React, { memo, useRef, useState } from 'react';
import moment from 'moment';
import { NavLink, useParams } from 'react-router-dom';
import classNames from 'classnames';

import { Paper, Popover, Tab, Tabs } from '@material-ui/core';

import TabPanel from 'components/TabPanel/TabPanel';
import { Badge, Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import useModel from 'hooks/model/useModel';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import { processDurationTime } from 'utils/processDurationTime';

import RunDetailSettingsTab from './RunDetailSettingsTab';
import RunDetailMetricsAndSystemTab from './RunDetailMetricsAndSystemTab';
import RunDetailParamsTab from './RunDetailParamsTab';

import './RunDetail.scss';

function RunDetail(): React.FunctionComponentElement<React.ReactNode> {
  const runData = useModel(runDetailAppModel);
  const containerRef = useRef<any>(null);
  const [value, setValue] = useState(0);
  const [isRunSelectDropdownOpen, setIsRunSelectDropdownOpen] = useState(false);
  const { runHash } = useParams<{ runHash: string }>();
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  function onRunsSelectToggle() {
    setIsRunSelectDropdownOpen(!isRunSelectDropdownOpen);
  }

  React.useEffect(() => {
    runDetailAppModel.initialize();
    const runsRequestRef = runDetailAppModel.getRunInfo(runHash);
    const experimentRequestRef = runDetailAppModel.getExperimentsData();
    let runsOfExperimentRequestRef: any = null;
    Promise.all([runsRequestRef.call(), experimentRequestRef.call()]).then(
      ([runInfo, experiments]: any) => {
        const selectedExperiment = experiments.find(
          (experiment: any) => experiment.name === runInfo.props.experiment,
        );
        runsOfExperimentRequestRef = runDetailAppModel.getRunsOfExperiment(
          selectedExperiment.id,
        );
        runsOfExperimentRequestRef.call();
      },
    );
    return () => {
      runsRequestRef.abort();
      experimentRequestRef.abort();
      runsOfExperimentRequestRef?.abort();
    };
  }, [runHash]);

  React.useEffect(() => {
    analytics.pageView('[RunDetail]');
  }, []);

  return (
    <section className='RunDetail container' ref={containerRef}>
      <div className='RunDetail__runDetailContainer'>
        <div className='RunDetail__runDetailContainer__appBarContainer'>
          <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox'>
            <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__container'>
              <NavLink
                className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__container__pageName'
                to='/runs'
              >
                <Text tint={70} size={16} weight={600}>
                  Runs
                </Text>
              </NavLink>
              /
              <Text
                className='RunDetail__runDetailContainer__appBarTitleBox__container__runHash'
                size={16}
                tint={100}
                weight={600}
              >
                {runHash}
              </Text>
            </div>
            <Button
              onClick={onRunsSelectToggle}
              color={isRunSelectDropdownOpen ? 'primary' : 'default'}
              size='small'
              className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__buttonSelectToggler'
              style={
                isRunSelectDropdownOpen
                  ? { background: '#E8F1FC' }
                  : { background: 'transparent' }
              }
              withOnlyIcon
            >
              <Icon name={'arrow-down'} />
            </Button>
          </div>
          <Popover
            // id={id}
            open={isRunSelectDropdownOpen}
            onClose={onRunsSelectToggle}
            // disableEnforceFocus={true}
            anchorReference='anchorPosition'
            anchorPosition={{
              left: containerRef.current?.offsetLeft + 40,
              top: 35,
            }}
            className='RunSelectPopoverWrapper'
          >
            <div className='RunSelectPopoverWrapper__headerContainer'>
              <div className='RunSelectPopoverWrapper__headerContainer__titleContainer'>
                <Text size={14} tint={100} weight={600}>
                  Experiments
                </Text>
              </div>

              <Icon name='sort-inside' />
              <div className='RunSelectPopoverWrapper__headerContainer__titleContainer'>
                <Text size={14} tint={100} weight={600}>
                  Runs
                </Text>
              </div>
            </div>
            <div className='RunSelectPopoverWrapper__contentContainer'>
              <div className='RunSelectPopoverWrapper__contentContainer__experimentsListContainer'>
                <div className='RunSelectPopoverWrapper__contentContainer__experimentsListContainer__experimentList'>
                  {runData?.experimentsData?.map((experiment: any) => (
                    <div
                      className={classNames(
                        'RunSelectPopoverWrapper__contentContainer__experimentsListContainer__experimentList__experimentBox',
                        { selected: runData?.experimentId === experiment.id },
                      )}
                      key={experiment.id}
                    >
                      <Text
                        size={14}
                        tint={
                          runData?.experimentId === experiment.id ? 100 : 80
                        }
                        weight={
                          runData?.experimentId === experiment.id ? 600 : 500
                        }
                        className='RunSelectPopoverWrapper__contentContainer__experimentsListContainer__experimentList__experimentBox__experimentName'
                      >
                        {experiment.name}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <div className='RunSelectPopoverWrapper__contentContainer__runsListContainer'>
                <div className='RunSelectPopoverWrapper__contentContainer__runsListContainer__runsList'>
                  {runData?.runsOfExperiment?.map((run: any) => (
                    <div
                      className={classNames(
                        'RunSelectPopoverWrapper__contentContainer__runsListContainer__runsList__runBox',
                        { selected: runData?.runInfo?.name === run.name },
                      )}
                      key={run.id}
                    >
                      <Text
                        size={14}
                        tint={runData?.runInfo?.name === run.name ? 100 : 80}
                        weight={runData?.runInfo?.name === run.name ? 600 : 500}
                        // className='RunSelectPopoverWrapper__contentContainer___runsListContainer__runsList__runBox__experimentName'
                      >
                        {run.name}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Popover>
        </div>
        <div className='RunDetail__runDetailContainer__headerContainer'>
          <div className='RunDetail__runDetailContainer__headerContainer__infoBox'>
            <Text component='p' weight={600} size={14} tint={100}>
              Experiment: {runData?.runInfo?.experiment}
            </Text>
            <Text component='p' tint={100}>
              {`${moment(runData?.runInfo?.creation_time * 1000).format(
                'DD MMM YYYY ~ HH:mm A',
              )} ~ ${
                !runData?.runInfo?.end_time
                  ? 'in progress'
                  : processDurationTime(
                      runData?.runInfo?.creation_time * 1000,
                      runData?.runInfo?.end_time * 1000,
                    )
              }`}
            </Text>
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
