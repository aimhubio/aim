import React, { memo, useRef } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { isEmpty } from 'lodash-es';

import { CircularProgress } from '@material-ui/core';

import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import { Button, Icon, Text } from 'components/kit';

import { DateWithOutSeconds } from 'config/dates/dates';

import { processDurationTime } from 'utils/processDurationTime';

import {
  IRunSelectExperiment,
  IRunSelectPopoverContentProps,
  IRunSelectRun,
} from './types';

import './RunDetail.scss';

function RunSelectPopoverContent({
  getRunsOfExperiment,
  experimentsData,
  experimentId,
  runsOfExperiment,
  runInfo,
  isRunsOfExperimentLoading,
  isRunInfoLoading,
  isLoadMoreButtonShown,
  onRunsSelectToggle,
  dateNow,
}: IRunSelectPopoverContentProps): React.FunctionComponentElement<React.ReactNode> {
  const popoverContentWrapperRef = useRef<HTMLDivElement | any>();
  const { runHash } = useParams<{ runHash: string }>();
  const { pathname } = useLocation();

  function onLoadMore() {
    if (!isRunsOfExperimentLoading) {
      getRunsOfExperiment(
        experimentId,
        {
          limit: 10,
          offset: runsOfExperiment[runsOfExperiment.length - 1].run_id,
        },
        true,
      );
    }
  }

  function onExperimentClick(id: string) {
    getRunsOfExperiment(id);
    popoverContentWrapperRef.current.scrollTop = 0;
  }

  return (
    <div className='RunSelectPopoverWrapper__selectPopoverContent'>
      <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer'>
        <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer__titleContainer'>
          <Text size={14} tint={100} weight={700}>
            Experiments
          </Text>
        </div>

        <Icon name='sort-inside' />
        <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer__titleContainer'>
          <Text size={14} tint={100} weight={700}>
            Runs
          </Text>
        </div>
      </div>
      <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer'>
        <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer'>
          <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList'>
            {!isRunInfoLoading ? (
              experimentsData?.map((experiment: IRunSelectExperiment) => (
                <div
                  className={classNames(
                    'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList__experimentBox',
                    { selected: experimentId === experiment.id },
                  )}
                  onClick={() => onExperimentClick(experiment.id)}
                  key={experiment.id}
                >
                  <Text
                    size={14}
                    tint={experimentId === experiment.id ? 100 : 80}
                    weight={experimentId === experiment.id ? 600 : 500}
                    className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList__experimentBox__experimentName'
                  >
                    {experiment?.name ?? 'default'}
                  </Text>
                </div>
              ))
            ) : (
              <div className='RunSelectPopoverWrapper__loaderContainer'>
                <CircularProgress size={34} />
              </div>
            )}
          </div>
        </div>

        <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer'>
          {isRunInfoLoading ||
          (isEmpty(runsOfExperiment) && isRunsOfExperimentLoading) ? (
            <div className='RunSelectPopoverWrapper__loaderContainer'>
              <CircularProgress size={34} />
            </div>
          ) : (
            <div
              className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList'
              ref={popoverContentWrapperRef}
            >
              {!isEmpty(runsOfExperiment) ? (
                runsOfExperiment?.map((run: IRunSelectRun) => (
                  <NavLink
                    className={classNames(
                      'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__runBox',
                      {
                        selected: runInfo?.name === run.name,
                        'in-progress': !run?.end_time,
                      },
                    )}
                    key={run.run_id}
                    to={pathname.replace(runHash, run.run_id)}
                    onClick={onRunsSelectToggle}
                  >
                    <Text
                      size={14}
                      tint={runInfo?.name === run.name ? 100 : 80}
                      weight={runInfo?.name === run.name ? 600 : 500}
                    >
                      {`${moment(run.creation_time * 1000).format(
                        DateWithOutSeconds,
                      )} | ${processDurationTime(
                        run?.creation_time * 1000,
                        run?.end_time ? run?.end_time * 1000 : dateNow,
                      )}`}
                    </Text>
                  </NavLink>
                ))
              ) : (
                <EmptyComponent size='big' content={'No Runs'} />
              )}
              {!isEmpty(runsOfExperiment) && isLoadMoreButtonShown && (
                <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__loadMoreButtonWrapper'>
                  <Button
                    size='small'
                    variant='contained'
                    className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__loadMoreButtonWrapper__button'
                    onClick={onLoadMore}
                  >
                    {!isRunsOfExperimentLoading ? (
                      <Text weight={500} size={12} color='primary' tint={100}>
                        Load More
                      </Text>
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(RunSelectPopoverContent);
