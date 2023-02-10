import React from 'react';
import _ from 'lodash-es';
import {
  ListOnItemsRenderedProps,
  ListOnScrollProps,
  VariableSizeList as List,
} from 'react-window';
import classNames from 'classnames';
import { useResizeObserver } from 'hooks';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import { Spinner } from 'components/kit';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import LogRow from './LogRow';
import { IRunLogsTabProps, LogsLastRequestEnum } from './RunLogsTab.d';

import './RunLogsTab.scss';

const SINGLE_LINE_HEIGHT = 15;
const LOAD_MORE_LOGS_COUNT = 200;

function RunLogsTab({
  isRunLogsLoading,
  runHash,
  runLogs,
  inProgress,
  updatedLogsCount,
}: IRunLogsTabProps) {
  const liveUpdate = React.useRef<{ intervalId: number } | null>(null);
  const logsContainerRef = React.useRef<any>(null);
  const listRef = React.useRef<any>({});
  const runsBatchRequestRef = React.useRef<any>({});
  const logsRowsData = React.useRef<string[] | null>(null);
  const [lastRequestType, setLastRequestType] =
    React.useState<LogsLastRequestEnum>(LogsLastRequestEnum.DEFAULT);
  const [requestStatus, setRequestStatus] = React.useState<RequestStatusEnum>(
    RequestStatusEnum.Ok,
  );
  const logsRange = React.useRef<[number, number]>([0, 0]);
  const [scrollOffset, setScrollOffset] = React.useState<number | null>(null);
  const [visibleRowsRange, setVisibleRowsRange] = React.useState<{
    visibleStartIndex: number;
    visibleStopIndex: number;
  } | null>(null);
  const [parentHeight, setParentHeight] = React.useState<number>(0);
  const [parentWidth, setParentWidth] = React.useState<number>(0);
  const [keysList, setKeyList] = React.useState<number[] | null>(null);

  React.useEffect(() => {
    getRunLogs({ runHash });
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.logs.tabView);
    return () => {
      stopLiveUpdate(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function liveUpdateCallBack() {
    setLastRequestType(LogsLastRequestEnum.LIVE_UPDATE);
    getRunLogs({
      runHash,
      record_range: logsRowsData.current
        ? `${logsRange.current?.[1] > 5 ? logsRange.current?.[1] - 5 : 0}:`
        : '',
    });
  }

  function startLiveUpdate() {
    if (inProgress) {
      const intervalId: number = window.setTimeout(liveUpdateCallBack, 3000);
      liveUpdate.current = {
        intervalId,
      };
    }
  }

  function getRunLogs(params: { runHash: string; record_range?: string }) {
    setRequestStatus(RequestStatusEnum.Pending);
    runsBatchRequestRef.current = runDetailAppModel.getRunLogs(params);
    runsBatchRequestRef.current.call().then(() => {
      setRequestStatus(RequestStatusEnum.Ok);
      stopLiveUpdate();
      startLiveUpdate();
    });
  }

  function stopLiveUpdate(forceRequestAbort: boolean = false) {
    if (
      forceRequestAbort ||
      lastRequestType === LogsLastRequestEnum.LIVE_UPDATE
    ) {
      runsBatchRequestRef.current?.abort();
    }
    if (liveUpdate.current?.intervalId) {
      clearInterval(liveUpdate.current.intervalId);
    }
  }

  function onScroll({ scrollOffset, scrollDirection }: ListOnScrollProps) {
    setScrollOffset(scrollOffset);
    if (
      scrollOffset <= SINGLE_LINE_HEIGHT &&
      keysList &&
      keysList[0] !== 0 &&
      scrollDirection === 'backward' &&
      (requestStatus === RequestStatusEnum.Ok ||
        (requestStatus === RequestStatusEnum.Pending &&
          lastRequestType === LogsLastRequestEnum.LIVE_UPDATE))
    ) {
      stopLiveUpdate();
      setLastRequestType(LogsLastRequestEnum.LOAD_MORE);
      getRunLogs({
        runHash,
        record_range: `${
          logsRange.current?.[0] > LOAD_MORE_LOGS_COUNT
            ? logsRange.current?.[0] - LOAD_MORE_LOGS_COUNT
            : 0
        }:${logsRange.current?.[0]}`,
      });
    }
  }

  function onItemsRendered({
    visibleStartIndex,
    visibleStopIndex,
  }: ListOnItemsRenderedProps) {
    setVisibleRowsRange({ visibleStartIndex, visibleStopIndex });
  }

  React.useEffect(() => {
    if (!inProgress) {
      stopLiveUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgress]);

  React.useEffect(() => {
    const values: Array<{ index: string; value: string }> = _.sortBy(
      Object.values(runLogs ?? {}),
      'index',
    );
    const keys: number[] = _.sortBy(
      values.map((value: { index: string; value: string }) => +value.index),
    );
    const arrayWithEmptyStrings: string[] = Array(3).fill('');
    logsRange.current = [keys[0], keys[keys.length - 1]];
    setKeyList(keys);
    logsRowsData.current = values
      .map((value: { index: string; value: string }) => value.value)
      .concat(arrayWithEmptyStrings);
  }, [runLogs]);

  React.useEffect(() => {
    const logsRowsCount = logsRowsData.current?.length ?? 0;
    if (lastRequestType === LogsLastRequestEnum.LOAD_MORE && visibleRowsRange) {
      listRef.current?.scrollToItem?.(
        visibleRowsRange.visibleStartIndex + updatedLogsCount,
        'start',
      );
      setLastRequestType(LogsLastRequestEnum.DEFAULT);
    } else if (
      (lastRequestType === LogsLastRequestEnum.LIVE_UPDATE &&
        visibleRowsRange &&
        visibleRowsRange?.visibleStopIndex + updatedLogsCount >=
          logsRowsCount - 1) ||
      lastRequestType === LogsLastRequestEnum.DEFAULT
    ) {
      if (!_.isEmpty(keysList)) {
        listRef.current?.scrollToItem?.(logsRowsCount, 'end');
      }
    } else {
      listRef.current?.scrollToItem?.(
        visibleRowsRange?.visibleStartIndex ?? 0,
        'start',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsRowsData.current, keysList]);

  React.useEffect(() => {
    if (
      lastRequestType === LogsLastRequestEnum.DEFAULT &&
      parentHeight &&
      parentWidth
    ) {
      if (!_.isEmpty(keysList)) {
        listRef.current?.scrollToItem?.(
          visibleRowsRange?.visibleStartIndex ?? 0,
          'start',
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentHeight, parentWidth]);

  useResizeObserver(() => {
    if (logsContainerRef.current) {
      setParentHeight(logsContainerRef.current.offsetHeight);
      setParentWidth(logsContainerRef.current.offsetWidth);
    }
  }, logsContainerRef);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={
          isRunLogsLoading && lastRequestType === LogsLastRequestEnum.DEFAULT
        }
        className='RunDetailTabLoader'
        height='100%'
      >
        {!_.isEmpty(runLogs) &&
        !_.isEmpty(keysList) &&
        !_.isNil(logsRowsData.current) ? (
          <div className='RunDetailLogsTabWrapper'>
            <div className='RunDetailLogsTab'>
              <div className='Logs' ref={logsContainerRef}>
                <div className='Logs__wrapper'>
                  <List
                    ref={listRef}
                    key={`${parentHeight}${parentWidth}`}
                    height={parentHeight || 100}
                    itemCount={logsRowsData.current?.length + 1}
                    itemSize={() => SINGLE_LINE_HEIGHT}
                    width={'100%'}
                    overscanCount={100}
                    initialScrollOffset={
                      scrollOffset ??
                      logsRowsData.current?.length * SINGLE_LINE_HEIGHT
                    }
                    onItemsRendered={onItemsRendered}
                    itemData={{
                      logsList: logsRowsData.current,
                    }}
                    onScroll={onScroll}
                  >
                    {LogRow}
                  </List>
                  <div
                    className={classNames('overlay', {
                      loading:
                        isRunLogsLoading &&
                        lastRequestType === LogsLastRequestEnum.LOAD_MORE,
                    })}
                  >
                    <Spinner size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <IllustrationBlock
            size='xLarge'
            className='RunDetailTabLoader'
            title='No Logs'
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunLogsTab.displayName = 'RunLogsTab';

export default React.memo(RunLogsTab);
