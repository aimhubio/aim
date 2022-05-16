import React from 'react';
import _ from 'lodash-es';
import { ListOnScrollProps, VariableSizeList as List } from 'react-window';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import LogRow from './LogRow';
import { IRunLogsTabProps, LogsLastRequestEnum } from './RunLogsTab.d';

import './RunLogsTab.scss';

const SINGLE_LINE_HEIGHT = 16.5;
const LOAD_MORE_LOGS_COUNT = 100;

function RunLogsTab({
  isRunLogsLoading,
  runHash,
  runLogs,
  inProgress,
  updatedLogsCount,
}: IRunLogsTabProps) {
  const liveUpdate = React.useRef<any>(null);
  const logsContainerRef = React.useRef<any>(null);
  const listRef = React.useRef<any>({});
  const runsBatchRequestRef = React.useRef<any>({});
  const [lastRequestType, setLastRequestType] =
    React.useState<LogsLastRequestEnum>(LogsLastRequestEnum.DEFAULT);
  const rangeRef = React.useRef<any>(null);
  const dataRef = React.useRef<any>(null);
  const [keysList, setKeyList] = React.useState<any>(null);
  const visibleItemsRange = React.useRef<any>(null);

  React.useEffect(() => {
    runsBatchRequestRef.current = runDetailAppModel.getRunLogs({ runHash });
    runsBatchRequestRef.current.call();

    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.logs.tabView);
    startLiveUpdate();

    return () => {
      runsBatchRequestRef.current.abort();
      if (liveUpdate.current?.intervalId) {
        clearInterval(liveUpdate.current.intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function liveUpdateCallBack() {
    return function () {
      setLastRequestType(LogsLastRequestEnum.LIVE_UPDATE);
      runsBatchRequestRef.current = runDetailAppModel.getRunLogs({
        runHash,
        record_range: dataRef.current
          ? `${+rangeRef.current?.[1] > 5 ? +rangeRef.current?.[1] - 5 : 0}:`
          : '',
        isLiveUpdate: true,
      });
      runsBatchRequestRef.current.call();
    };
  }

  function startLiveUpdate() {
    if (inProgress) {
      const intervalId = setInterval(liveUpdateCallBack(), 3000);
      liveUpdate.current = {
        intervalId,
      };
    }
  }

  function onScroll(props: ListOnScrollProps) {
    if (
      props.scrollOffset === 0 &&
      +keysList[0] !== 0 &&
      props.scrollDirection === 'backward'
    ) {
      if (liveUpdate.current?.intervalId) {
        clearInterval(liveUpdate.current.intervalId);
        runsBatchRequestRef.current.abort();
      }
      setLastRequestType(LogsLastRequestEnum.LOAD_MORE);
      runsBatchRequestRef.current = runDetailAppModel.getRunLogs({
        runHash,
        record_range: `${
          +rangeRef.current?.[0] > LOAD_MORE_LOGS_COUNT
            ? +rangeRef.current?.[0] - LOAD_MORE_LOGS_COUNT
            : 0
        }:${rangeRef.current?.[0]}`,
        isLiveUpdate: true,
      });
      runsBatchRequestRef.current.call();
      startLiveUpdate();
    }
  }

  React.useEffect(() => {
    if (!inProgress && liveUpdate.current?.intervalId) {
      clearInterval(liveUpdate.current.intervalId);
      runsBatchRequestRef.current.abort();
    }
  }, [inProgress]);

  React.useEffect(() => {
    const values = _.sortBy(Object.values(runLogs ?? {}), 'index');
    const keys = _.sortBy(values.map((value) => value.index));
    rangeRef.current = [keys[0], keys[keys.length - 1]];
    setKeyList(keys);
    dataRef.current = values;
  }, [runLogs]);

  React.useEffect(() => {
    if (lastRequestType === LogsLastRequestEnum.LOAD_MORE) {
      listRef.current?.scrollToItem?.(
        visibleItemsRange.current[0] + updatedLogsCount,
        'start',
      );
    } else if (
      (lastRequestType === LogsLastRequestEnum.LIVE_UPDATE &&
        visibleItemsRange.current[1] + updatedLogsCount >=
          dataRef.current?.length - 1) ||
      lastRequestType === LogsLastRequestEnum.DEFAULT
    ) {
      listRef.current?.scrollToItem?.(dataRef.current?.length - 1, 'end');
    } else {
      listRef.current?.scrollToItem?.(visibleItemsRange.current[0], 'start');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRef.current?.length]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunLogsLoading || _.isNil(runLogs)}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {!_.isEmpty(runLogs) ? (
          <div className='RunDetailLogsTabWrapper'>
            <div className='RunDetailLogsTab'>
              <div className='Logs'>
                <div ref={logsContainerRef} className={'Logs__wrapper'}>
                  <List
                    ref={listRef}
                    height={logsContainerRef.current?.offsetHeight || 100}
                    itemCount={dataRef.current?.length}
                    itemSize={() => SINGLE_LINE_HEIGHT}
                    width={'100%'}
                    overscanCount={100}
                    onItemsRendered={(props) => {
                      visibleItemsRange.current = [
                        props.visibleStartIndex,
                        props.visibleStopIndex,
                      ];
                    }}
                    itemData={{
                      logsList: dataRef.current,
                    }}
                    onScroll={onScroll}
                  >
                    {LogRow}
                  </List>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <IllustrationBlock
            size='xLarge'
            className='runDetailParamsTabLoader'
            title='No Logs'
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunLogsTab.displayName = 'RunLogsTab';

export default React.memo(RunLogsTab);
