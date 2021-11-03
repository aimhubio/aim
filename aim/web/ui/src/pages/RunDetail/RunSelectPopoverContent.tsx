import React, { memo, useEffect, useRef } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { Button, Icon, Text } from 'components/kit';

import { processDurationTime } from 'utils/processDurationTime';

import './RunDetail.scss';

function RunSelectPopoverContent({
  getRunsOfExperiment,
  experimentsData,
  experimentId,
  runsOfExperiment,
  runInfo,
}: any): React.FunctionComponentElement<React.ReactNode> {
  console.log(runsOfExperiment);
  //   const popoverContentWrapperRef = useRef<any>();
  //   function onScroll(e: any) {
  //     if (
  //       popoverContentWrapperRef.current.scrollTop + 268 ===
  //       popoverContentWrapperRef.current.scrollHeight
  //     ) {
  //       console.log('safas');
  //     }
  //   }
  //   useEffect(() => {
  //     popoverContentWrapperRef.current.addEventListener('scroll', onScroll);
  //     return () =>
  //       popoverContentWrapperRef.current.removeEventListener('scroll', onScroll);
  //   }, [popoverContentWrapperRef]);

  function onLoadMore() {
    getRunsOfExperiment(experimentId, {
      limit: 10,
      offset: runsOfExperiment[runsOfExperiment.length - 1].run_id,
    });
  }

  return (
    <div className='RunSelectPopoverWrapper__selectPopoverContent'>
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
          <div
            className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList'
            // ref={popoverContentWrapperRef}
          >
            {runsOfExperiment?.map((run: any) => (
              <Link
                className={classNames(
                  'RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__runBox',
                  {
                    selected: runInfo?.name === run.name,
                    'in-progress': !run?.end_time,
                  },
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
                  )} | ${processDurationTime(
                    run?.creation_time * 1000,
                    run?.end_time ? run?.end_time * 1000 : Date.now(),
                  )}`}
                </Text>
              </Link>
            ))}
            <div className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__loadMoreButtonWrapper'>
              <Button
                size='small'
                variant='contained'
                className='RunSelectPopoverWrapper__selectPopoverContent__contentContainer__runsListContainer__runsList__loadMoreButtonWrapper__button'
                onClick={onLoadMore}
              >
                <Text weight={500} size={12} color='primary' tint={100}>
                  Load More
                </Text>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(RunSelectPopoverContent);
