import React from 'react';
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
  inProgress,
}: IRunLogRecordsProps): React.FunctionComponentElement<React.ReactNode> | null {
  const {
    data,
    loadMore,
    isLoading,
    fetchedCount,
    totalRunLogRecordCount,
    lastRequestType,
    elementsHeightsSum,
    updateScrollOffset,
    scrollOffset,
    startLiveUpdate,
    stopLiveUpdate,
    liveUpdateToken,
  } = useRunLogRecords(runHash, inProgress);
  const listRef = React.useRef<any>(null);
  const logsContainerRef = React.useRef<any>(null);

  const [parentHeight, setParentHeight] = React.useState<number>(0);
  const [parentWidth, setParentWidth] = React.useState<number>(0);

  useResizeObserver(() => {
    if (logsContainerRef.current) {
      setParentHeight(logsContainerRef.current.offsetHeight);
      setParentWidth(logsContainerRef.current.offsetWidth);
    }
  }, logsContainerRef);

  function onScroll({ scrollOffset, scrollDirection }: ListOnScrollProps) {
    updateScrollOffset(scrollOffset);
    if (
      scrollDirection === 'forward' &&
      scrollOffset + parentHeight > elementsHeightsSum &&
      fetchedCount < totalRunLogRecordCount &&
      isLoading === false
    ) {
      loadMore();
    }
    if (scrollDirection === 'backward' && scrollOffset <= 0) {
      startLiveUpdate();
    }
    if (scrollOffset > 5 && liveUpdateToken) {
      stopLiveUpdate();
    }
  }

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [data]);

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
                  itemSize={(index: number) => data[index]?.height}
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
