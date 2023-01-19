import React from 'react';
import _ from 'lodash-es';
import { ListOnScrollProps, VariableSizeList as List } from 'react-window';
import { useResizeObserver } from 'hooks';
import classNames from 'classnames';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import { Spinner } from 'components/kit';

import { LogsLastRequestEnum } from '../RunLogsTab';

import LogRecordItem from './LogRecordItem';
import useRunLogRecords from './useRunLogRecords';

import { IRunLogRecordsProps } from '.';

import './RunLogRecords.scss';

function RunLogRecords({
  runHash,
}: IRunLogRecordsProps): React.FunctionComponentElement<React.ReactNode> | null {
  const {
    data,
    loadMore,
    isLoading,
    fetchedCount,
    totalRunLogRecordCount,
    lastRequestType,
    elementsHeightsSum,
  } = useRunLogRecords(runHash);
  const listRef = React.useRef<any>({});
  const logsContainerRef = React.useRef<any>(null);

  const [parentHeight, setParentHeight] = React.useState<number>(0);
  const [parentWidth, setParentWidth] = React.useState<number>(0);
  const [scrollOffset, setScrollOffset] = React.useState<number | null>(null);

  useResizeObserver(() => {
    if (logsContainerRef.current) {
      setParentHeight(logsContainerRef.current.offsetHeight);
      setParentWidth(logsContainerRef.current.offsetWidth);
    }
  }, logsContainerRef);

  function onScroll({ scrollOffset, scrollDirection }: ListOnScrollProps) {
    setScrollOffset(scrollOffset);
    if (
      scrollDirection === 'forward' &&
      scrollOffset + parentHeight > elementsHeightsSum &&
      fetchedCount < totalRunLogRecordCount &&
      isLoading === false
    ) {
      loadMore();
    }
    // if (
    //   scrollOffset <= SINGLE_LINE_HEIGHT &&
    //   keysList &&
    //   keysList[0] !== 0 &&
    //   scrollDirection === 'backward' &&
    //   (requestStatus === RequestStatusEnum.Ok ||
    //     (requestStatus === RequestStatusEnum.Pending &&
    //       lastRequestType === LogsLastRequestEnum.LIVE_UPDATE))
    // ) {
    //   stopLiveUpdate();
    //   setLastRequestType(LogsLastRequestEnum.LOAD_MORE);
    //   getRunLogs({
    //     runHash,
    //     record_range: `${
    //       logsRange.current?.[0] > LOAD_MORE_LOGS_COUNT
    //         ? logsRange.current?.[0] - LOAD_MORE_LOGS_COUNT
    //         : 0
    //     }:${logsRange.current?.[0]}`,
    //     isLoadMore: true,
    //   });
    // }
  }

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isLoading && lastRequestType === LogsLastRequestEnum.DEFAULT}
        className='RunDetailTabLoader'
        height='100%'
      >
        <div className='RunLogRecords'>
          <div className='RunLogRecords__contentWrapper'>
            {totalRunLogRecordCount ? (
              <div
                className='RunLogRecords__contentWrapper__listWrapper'
                ref={logsContainerRef}
              >
                <List
                  ref={listRef}
                  key={`${parentHeight}${parentWidth}`}
                  height={parentHeight || 100}
                  itemCount={data?.length}
                  itemSize={(index) => data[index]?.height}
                  width={'100%'}
                  overscanCount={100}
                  initialScrollOffset={scrollOffset ?? 0}
                  itemData={data}
                  onScroll={onScroll}
                >
                  {LogRecordItem}
                </List>
                <div
                  className={classNames('overlay', {
                    loading:
                      isLoading &&
                      lastRequestType === LogsLastRequestEnum.LOAD_MORE,
                  })}
                >
                  <Spinner size={24} />
                </div>
              </div>
            ) : (
              <IllustrationBlock
                size='xLarge'
                className='RunDetailTabLoader'
                title='No Messages'
              />
            )}
          </div>
        </div>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default React.memo(RunLogRecords);
