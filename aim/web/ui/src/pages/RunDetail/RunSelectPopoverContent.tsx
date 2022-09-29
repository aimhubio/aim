import React, { memo, useRef } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import _ from 'lodash-es';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import { Button, Icon, Spinner, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { DATE_WITH_SECONDS } from 'config/dates/dates';
import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

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
  isRunsOfExperimentLoading,
  isRunInfoLoading,
  isLoadMoreButtonShown,
  onRunsSelectToggle,
  dateNow,
}: IRunSelectPopoverContentProps): React.FunctionComponentElement<React.ReactNode> {
  const popoverContentWrapperRef = useRef<HTMLDivElement | any>();
  const { runHash } = useParams<{ runHash: string }>();
  const { pathname } = useLocation();
  const [runs, setRuns] = React.useState<IRunSelectRun[]>([]);

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

  React.useEffect(() => {
    setRuns(
      _.orderBy(runsOfExperiment, ['creation_time', 'name'], ['desc', 'asc']),
    );
  }, [runsOfExperiment]);

  function onExperimentClick(id: string) {
    getRunsOfExperiment(id);
    popoverContentWrapperRef.current.scrollTop = 0;
  }

  React.useEffect(() => {
    if (experimentId) {
      getRunsOfExperiment(experimentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  return (
    <ErrorBoundary>
      <div className='RunSelectPopoverWrapper__selectPopoverContent'>
        <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer'>
          <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer__titleContainer'>
            <Text size={14} tint={100} weight={700}>
              Experiments
            </Text>
          </div>
          <div className='RunSelectPopoverWrapper__selectPopoverContent__headerContainer__titleContainer'>
            <Text size={14} tint={100} weight={700}>
              Runs
            </Text>
          </div>
        </div>
        <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer'>
          <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer'>
            <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList ScrollBar__hidden'>
              {!isRunInfoLoading ? (
                experimentsData?.map((experiment: IRunSelectExperiment) => (
                  <div
                    key={experiment.id}
                    className={classNames(
                      'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__experimentsListContainer__experimentList__experimentContainer',
                      { selected: experimentId === experiment.id },
                    )}
                    onClick={() => onExperimentClick(experiment.id)}
                  >
                    <div className='experimentBox'>
                      <Text
                        size={16}
                        tint={experimentId === experiment.id ? 100 : 80}
                        weight={500}
                        className='experimentBox__experimentName'
                      >
                        {experiment?.name ?? 'default'}
                      </Text>
                    </div>
                  </div>
                ))
              ) : (
                <div className='RunSelectPopoverWrapper__loaderContainer'>
                  <Spinner size={34} />
                </div>
              )}
            </div>
          </div>

          <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer'>
            {isRunInfoLoading ||
            (_.isEmpty(runsOfExperiment) && isRunsOfExperimentLoading) ? (
              <div className='RunSelectPopoverWrapper__loaderContainer'>
                <Spinner size={34} />
              </div>
            ) : (
              <div
                className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList ScrollBar__hidden'
                ref={popoverContentWrapperRef}
              >
                {!_.isEmpty(runsOfExperiment) ? (
                  runs?.map((run: IRunSelectRun) => (
                    <NavLink
                      className={classNames(
                        'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__runBox',
                        {
                          selected: runHash === run?.run_id,
                        },
                      )}
                      key={run.run_id}
                      to={pathname.replace(runHash, run.run_id)}
                      onClick={onRunsSelectToggle}
                    >
                      <div
                        className={classNames(
                          'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__runBox__runName',
                          { 'in-progress': !run?.end_time },
                        )}
                      >
                        <Text
                          size={16}
                          tint={runHash === run?.run_id ? 100 : 80}
                          weight={500}
                        >
                          {run.name}
                        </Text>
                      </div>
                      <div
                        className={
                          'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__runBox__runDate'
                        }
                      >
                        <Icon
                          name='calendar'
                          color={
                            runHash === run?.run_id ? '#414B6D' : '#606986'
                          }
                          fontSize={12}
                        />
                        <Text
                          size={14}
                          tint={runHash === run?.run_id ? 80 : 70}
                          weight={500}
                        >
                          {`${moment(run.creation_time * 1000).format(
                            DATE_WITH_SECONDS,
                          )} • ${processDurationTime(
                            run?.creation_time * 1000,
                            run?.end_time ? run?.end_time * 1000 : dateNow,
                          )}`}
                        </Text>
                      </div>
                    </NavLink>
                  ))
                ) : (
                  <IllustrationBlock
                    type={IllustrationsEnum.EmptyData}
                    size='large'
                    title={'No Runs'}
                  />
                )}
                {!_.isEmpty(runsOfExperiment) && isLoadMoreButtonShown && (
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
                        <Spinner size={14} thickness={2} color='#414b6d' />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default memo(RunSelectPopoverContent);
