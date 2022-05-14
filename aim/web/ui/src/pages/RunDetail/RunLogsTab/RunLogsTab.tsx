import React from 'react';
import _ from 'lodash-es';
import { ListOnScrollProps, VariableSizeList as List } from 'react-window';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useResizeObserver from 'hooks/window/useResizeObserver';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import { IRunLogsTabProps } from './RunLogsTab.d';

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
  const [lastRequestType, setLastRequestType] = React.useState<
    'default' | 'live-update' | 'load-more'
  >('default');
  const rangeRef = React.useRef<any>(null);
  const dataRef = React.useRef<any>(null);
  const [parentHeight, setParentHeight] = React.useState<any>(0);
  const [parentWidth, setParentWidth] = React.useState<any>(0);
  const [keysList, setKeyList] = React.useState<any>(null);
  const visibleItemsRange = React.useRef<any>(null);

  React.useEffect(() => {
    runsBatchRequestRef.current = runDetailAppModel.getRunLogs({ runHash });
    runsBatchRequestRef.current.call();

    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.logs.tabView);
    startLiveUpdate();

    return () => {
      runsBatchRequestRef.current.abort();
      if (liveUpdate.current?.intervalToken) {
        clearInterval(liveUpdate.current.intervalToken);
      }
    };
  }, []);

  function liveUpdateCallBack() {
    return function () {
      setLastRequestType('live-update');
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
      const intervalToken = setInterval(liveUpdateCallBack(), 3000);
      liveUpdate.current = {
        intervalToken,
      };
    }
  }

  function onScroll(props: ListOnScrollProps) {
    if (
      props.scrollOffset === 0 &&
      +keysList[0] !== 0 &&
      props.scrollDirection === 'backward'
    ) {
      if (liveUpdate.current?.intervalToken) {
        clearInterval(liveUpdate.current.intervalToken);
        runsBatchRequestRef.current.abort();
      }
      setLastRequestType('load-more');
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
    if (!inProgress && liveUpdate.current?.intervalToken) {
      clearInterval(liveUpdate.current.intervalToken);
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
    if (lastRequestType === 'load-more') {
      listRef.current?.scrollToItem?.(
        visibleItemsRange.current[0] + updatedLogsCount,
        'start',
      );
    } else if (
      (lastRequestType === 'live-update' &&
        visibleItemsRange.current[1] + updatedLogsCount >=
          dataRef.current?.length - 1) ||
      lastRequestType === 'default'
    ) {
      listRef.current?.scrollToItem?.(dataRef.current?.length - 1, 'end');
    } else {
      listRef.current?.scrollToItem?.(visibleItemsRange.current[0], 'start');
    }
  }, [dataRef.current?.length, listRef.current]);

  useResizeObserver(() => {
    if (logsContainerRef.current) {
      setParentHeight(logsContainerRef.current.offsetHeight);
      setParentWidth(logsContainerRef.current.offsetWidth);
    }
  }, logsContainerRef);

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
                      parentHeight,
                      parentWidth,
                      keysList,
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

function LogRow({
  index,
  style,
  data,
}: {
  index: number;
  style: any;
  data: {
    parentHeight: any;
    parentWidth: any;
    logsList: Array<{ index: string; value: string }>;
    keysList: any;
  };
}) {
  return (
    <div style={style}>
      <pre className={`LogRow__line line${data.logsList?.[index]?.index}`}>
        {data.logsList?.[index]?.value}
      </pre>
    </div>
  );
}

RunLogsTab.displayName = 'RunLogsTab';

export default React.memo(RunLogsTab);
