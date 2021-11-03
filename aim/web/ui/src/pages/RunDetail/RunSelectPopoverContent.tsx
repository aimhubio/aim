import React, { memo, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { Paper, Popover, Tab, Tabs } from '@material-ui/core';
import { Link, NavLink, useParams } from 'react-router-dom';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import { processDurationTime } from 'utils/processDurationTime';
import useModel from 'hooks/model/useModel';
import TabPanel from 'components/TabPanel/TabPanel';
import RunDetailParamsTab from './RunDetailParamsTab';
import RunDetailMetricsAndSystemTab from './RunDetailMetricsAndSystemTab';
import RunDetailSettingsTab from './RunDetailSettingsTab';
import { Badge, Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import * as analytics from 'services/analytics';

import './RunDetail.scss';
import classNames from 'classnames';

function RunSelectPopoverContent({
  getRunsOfExperiment,
  experimentsData,
  experimentId,
  runsOfExperiment,
  runInfo,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const popoverContentWrapperRef = useRef<any>();

  useEffect(() => {
    console.log(popoverContentWrapperRef);
  }, [popoverContentWrapperRef]);
  return (
    <div
      ref={popoverContentWrapperRef}
      className='RunSelectPopoverWrapper__selectPopoverContent'
    >
      <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer'>
        <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer__titleContainer'>
          <Text size={14} tint={100} weight={600}>
            Experiments
          </Text>
        </div>

        <Icon name='sort-inside' />
        <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer__titleContainer'>
          <Text size={14} tint={100} weight={600}>
            Runs
          </Text>
        </div>
      </div>
      <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer'>
        <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer'>
          <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList'>
            {experimentsData?.map((experiment: any) => (
              <div
                className={classNames(
                  'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList__experimentBox',
                  { selected: experimentId === experiment.id },
                )}
                onClick={() => getRunsOfExperiment(experiment.id)}
                key={experiment.id}
              >
                <Text
                  size={14}
                  tint={experimentId === experiment.id ? 100 : 80}
                  weight={experimentId === experiment.id ? 600 : 500}
                  className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList__experimentBox__experimentName'
                >
                  {experiment.name}
                </Text>
              </div>
            ))}
          </div>
        </div>
        <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer'>
          <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList'>
            {runsOfExperiment?.map((run: any) => (
              <Link
                className={classNames(
                  'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__runBox',
                  { selected: runInfo?.name === run.name },
                )}
                key={run.id}
                to={`${run.run_id}`}
              >
                <Text
                  size={14}
                  tint={runInfo?.name === run.name ? 100 : 80}
                  weight={runInfo?.name === run.name ? 600 : 500}
                >
                  {`${moment(run.creation_time * 1000).format(
                    'DD MMM YYYY, HH:mm A',
                  )} | ${
                    !runInfo?.end_time
                      ? 'in progress'
                      : processDurationTime(
                          run.creation_time * 1000,
                          run.end_time * 1000,
                        )
                  }`}
                </Text>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(RunSelectPopoverContent);
