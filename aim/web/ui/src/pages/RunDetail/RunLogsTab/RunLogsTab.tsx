import React from 'react';
import _ from 'lodash-es';
import {
  VariableSizeGrid as Grid,
  GridOnScrollProps,
  GridOnItemsRenderedProps,
} from 'react-window';
import classNames from 'classnames';
import { useResizeObserver } from 'hooks';

import CircularProgress from '@material-ui/core/CircularProgress';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import LogRow from './LogCell';
import { IRunLogsTabProps, LogsLastRequestEnum } from './RunLogsTab.d';

import './RunLogsTab.scss';

const SINGLE_LINE_HEIGHT: number = 15;
const LOAD_MORE_LOGS_COUNT: number = 500;
const CELL_WIDTH: number = 2996;
const ROW_PADDING: number = 12;
const CELL_CHAR_COUNT: number = 500;

function RunLogsTab({
  isRunLogsLoading,
  runHash,
  runLogs,
  inProgress,
  updatedLogsCount,
}: IRunLogsTabProps) {
  const liveUpdate = React.useRef<{
    intervalId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const logsContainerRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<any>(null);
  const runsBatchRequestRef = React.useRef<any>({});
  const [lastRequestType, setLastRequestType] =
    React.useState<LogsLastRequestEnum>(LogsLastRequestEnum.DEFAULT);
  const rangeRef = React.useRef<any>(null);
  const [parentHeight, setParentHeight] = React.useState<number>(0);
  const [parentWidth, setParentWidth] = React.useState<number>(0);
  const dataRef = React.useRef<any>(null);
  const scrollOffsetRef = React.useRef<any>(null);
  const [keysList, setKeyList] = React.useState<any>(null);
  const visibleItemsRange = React.useRef<any>(null);
  const [columnCount, setColumnCount] = React.useState<any>(0);

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

  function onScroll({
    scrollTop,
    scrollLeft,
    horizontalScrollDirection,
  }: GridOnScrollProps) {
    if (parentHeight && parentWidth) {
      scrollOffsetRef.current = {
        scrollTop,
        scrollLeft,
      };
    }

    if (
      scrollTop <= 15 &&
      +keysList?.[0] !== 0 &&
      horizontalScrollDirection === 'backward'
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
        isLoadMore: true,
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
    const arrayWithEmptyStrings = Array(3).fill('');
    let tmpColumnCount = 0;
    rangeRef.current = [keys[0], keys[keys.length - 1]];
    setKeyList(keys);
    dataRef.current = values.concat(arrayWithEmptyStrings).map((value) => {
      if (value) {
        const rowCellCount = value.value.length / CELL_CHAR_COUNT;
        rowCellCount > tmpColumnCount && setColumnCount(rowCellCount);
        return [...(value.value?.match(/.{1,500}/g) ?? '')];
      }
      return '';
    });
  }, [runLogs]);

  React.useEffect(() => {
    const dataLength = dataRef.current?.length;
    const startVisibleRow = visibleItemsRange.current?.row[0];
    const endVisibleRow = visibleItemsRange.current?.row[1];
    const startVisibleColumn = visibleItemsRange.current?.column[0];

    if (
      lastRequestType === LogsLastRequestEnum.LOAD_MORE &&
      visibleItemsRange.current
    ) {
      gridRef.current?.scrollToItem?.({
        align: 'start',
        rowIndex: startVisibleRow + updatedLogsCount,
        columnIndex: startVisibleColumn ?? 0,
      });
      setLastRequestType(LogsLastRequestEnum.DEFAULT);
    } else if (
      (lastRequestType === LogsLastRequestEnum.LIVE_UPDATE &&
        endVisibleRow + updatedLogsCount >= dataLength - 1) ||
      lastRequestType === LogsLastRequestEnum.DEFAULT
    ) {
      if (!_.isEmpty(keysList)) {
        gridRef.current?.scrollToItem?.({
          align: 'end',
          rowIndex: dataLength,
          columnIndex: startVisibleColumn ?? 0,
        });
      }
    } else {
      gridRef.current?.scrollToItem?.({
        align: 'start',
        rowIndex: startVisibleRow ?? 0,
        columnIndex: startVisibleColumn ?? 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRef.current?.length, keysList]);

  React.useEffect(() => {
    if (
      lastRequestType === LogsLastRequestEnum.DEFAULT &&
      parentHeight &&
      parentWidth
    ) {
      if (!_.isEmpty(keysList)) {
        gridRef.current?.scrollToItem?.({
          align: 'start',
          rowIndex: visibleItemsRange.current?.row[0] ?? 0,
          columnIndex: visibleItemsRange.current?.column[0] ?? 0,
        });
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
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {!_.isEmpty(runLogs) && !_.isEmpty(keysList) ? (
          <div className='RunDetailLogsTabWrapper'>
            <div className='RunDetailLogsTab'>
              <div className='Logs' ref={logsContainerRef}>
                <div className='Logs__wrapper'>
                  <Grid
                    ref={gridRef}
                    key={`${parentHeight}${parentWidth}`}
                    height={logsContainerRef.current?.offsetHeight || 3000}
                    rowCount={dataRef.current?.length + 1}
                    columnWidth={(columnIndex: number) => {
                      if (
                        columnIndex === 0 ||
                        columnIndex === columnCount - 1
                      ) {
                        return CELL_WIDTH + ROW_PADDING;
                      }
                      return CELL_WIDTH;
                    }}
                    columnCount={columnCount}
                    rowHeight={() => SINGLE_LINE_HEIGHT}
                    width={logsContainerRef.current?.offsetWidth || 3000}
                    overscanColumnCount={10}
                    overscanRowCount={10}
                    initialScrollTop={
                      scrollOffsetRef.current?.scrollTop ??
                      dataRef.current?.length * 15
                    }
                    initialScrollLeft={scrollOffsetRef.current?.scrollLeft ?? 0}
                    onItemsRendered={(props: GridOnItemsRenderedProps) => {
                      visibleItemsRange.current = {
                        column: [
                          props.visibleColumnStartIndex,
                          props.visibleColumnStopIndex,
                        ],
                        row: [
                          props.visibleRowStartIndex,
                          props.visibleRowStopIndex,
                        ],
                      };
                    }}
                    itemData={{
                      logsList: dataRef.current,
                      columnCount,
                    }}
                    onScroll={onScroll}
                  >
                    {LogRow}
                  </Grid>
                  <div
                    className={classNames('overlay', {
                      loading:
                        isRunLogsLoading &&
                        lastRequestType === LogsLastRequestEnum.LOAD_MORE,
                    })}
                  >
                    <CircularProgress
                      size={24}
                      value={75}
                      thickness={4}
                      color='primary'
                    />
                  </div>
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
