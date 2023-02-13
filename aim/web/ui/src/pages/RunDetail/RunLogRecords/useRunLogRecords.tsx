import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';

import {
  TIMELINE_DAY_FORMAT,
  TIMELINE_MONTH_FORMAT,
  TIMELINE_TIME_FORMAT,
} from 'config/dates/dates';

import { IResourceState } from 'modules/core/utils/createResource';

import { LogsLastRequestEnum } from '../RunLogsTab';

import runRecordsEngine from './RunLogRecordsStore';
import { ListItemEnum } from './LogRecordItem/config';

import { MessagesItemType, RunLogRecordType } from '.';

function useRunLogRecords(runId: string, inProgress: boolean) {
  const [data, setData] = React.useState<RunLogRecordType[]>([]);
  const [elementsHeightsSum, setElementsHeightsSum] = React.useState<number>(0);
  const [scrollOffset, setScrollOffset] = React.useState<number>(0);
  const [lastRequestType, setLastRequestType] =
    React.useState<LogsLastRequestEnum>(LogsLastRequestEnum.DEFAULT);
  const { current: engine } = React.useRef(runRecordsEngine);
  const liveUpdate = React.useRef<{ intervalId: number } | null>(null);
  const lastItemHash = React.useRef<number>(-1);
  const runLogRecordsState: IResourceState<{
    runLogRecordsList: RunLogRecordType[];
    runLogRecordsTotalCount: number;
  }> = engine.runLogRecordsState((state) => state);

  React.useEffect(() => {
    if (_.isEmpty(runLogRecordsState.data?.runLogRecordsList)) {
      engine.fetchRunLogRecords({ runId }).then(() => {
        stopLiveUpdate();
        startLiveUpdate();
      });
    }
    return () => {
      engine.destroy();
      stopLiveUpdate(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!inProgress) {
      stopLiveUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgress]);

  React.useEffect(() => {
    if (runLogRecordsState.data?.runLogRecordsList?.length) {
      let newData =
        lastRequestType === LogsLastRequestEnum.LIVE_UPDATE
          ? [...runLogRecordsState.data.runLogRecordsList, ...data]
          : [...data, ...runLogRecordsState.data.runLogRecordsList];
      setData(newData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runLogRecordsState.data]);

  const memoizedData = React.useMemo(() => {
    const messagesList: MessagesItemType[] = [];
    let currentMonth = '';
    let currentDay = '';
    let pageSize = 0;
    if (data.length) {
      data?.forEach((record: RunLogRecordType) => {
        const month = moment(record.timestamp * 1000).format(
          TIMELINE_MONTH_FORMAT,
        );
        if (month !== currentMonth) {
          messagesList.push({
            date: month,
            itemType: ListItemEnum.MONTH,
            height: 28,
          });
          pageSize += 28;
          currentMonth = month;
        }

        const day = moment(record.timestamp * 1000).format(TIMELINE_DAY_FORMAT);
        if (day !== currentDay) {
          messagesList.push({
            date: day,
            itemType: ListItemEnum.DAY,
            height: 28,
          });
          pageSize += 28;
          currentDay = day;
        }
        let messageSize =
          42 + (record.message.trim().match(/\n/g) || '').length * 14.5;

        function getObjectKeysCount(obj: Record<string, any>, count = 1) {
          let size = count + (Object.keys(obj).length > 0 ? 1 : 0);
          for (let key in obj) {
            if (
              Array.isArray(obj[key]) ||
              (typeof obj[key] === 'object' && obj[key] !== null)
            ) {
              size += getObjectKeysCount(obj[key], size);
            } else {
              size++;
            }
          }

          if (size > 5) {
            return 5;
          }

          return size;
        }
        if (record.args) {
          const payloadRowsCount = getObjectKeysCount(record.args);
          messageSize += payloadRowsCount * 16.5;
        }
        const feedItem = {
          date: moment(record.timestamp * 1000).format(TIMELINE_TIME_FORMAT),
          hash: record.hash,
          message: record.message.trim(),
          type: record.log_level,
          creation_time: record.timestamp,
          extraParams: record.args,
          runId,
          itemType: ListItemEnum.RECORD,
          height: messageSize,
        };
        pageSize += messageSize;
        messagesList.push(feedItem);
      });
    }
    setElementsHeightsSum(pageSize);
    lastItemHash.current = data[0]?.hash;
    return [{ itemType: ListItemEnum.EMPTY, height: 24 }, ...messagesList];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, runId]);

  function loadMore(): void {
    if (
      runLogRecordsState.data?.runLogRecordsList &&
      !runLogRecordsState.loading
    ) {
      stopLiveUpdate();
      setLastRequestType(LogsLastRequestEnum.LOAD_MORE);
      const { hash } = data[data.length - 1];
      engine
        .fetchRunLogRecords({
          runId,
          record_range: hash > 200 ? `${hash - 200}:${hash}` : `0:${hash}`,
        })
        .then(() => {
          stopLiveUpdate();
          startLiveUpdate();
        });
    }
  }

  function liveUpdateCallBack() {
    if (lastItemHash.current) {
      setLastRequestType(LogsLastRequestEnum.LIVE_UPDATE);
      engine
        .fetchRunLogRecords({
          runId,
          record_range: `${lastItemHash.current}:`,
        })
        .then(() => {
          stopLiveUpdate();
          startLiveUpdate();
        });
    } else {
      stopLiveUpdate();
      startLiveUpdate();
    }
  }

  function startLiveUpdate() {
    if (inProgress) {
      const intervalId: number = window.setTimeout(liveUpdateCallBack, 3000);
      liveUpdate.current = {
        intervalId,
      };
    }
  }

  function stopLiveUpdate(forceRequestAbort: boolean = false) {
    if (
      forceRequestAbort ||
      lastRequestType === LogsLastRequestEnum.LIVE_UPDATE
    ) {
      engine.abortRunLogRecordsFetching();
    }
    if (liveUpdate.current?.intervalId) {
      clearInterval(liveUpdate.current.intervalId);
      liveUpdate.current = null;
    }
  }

  return {
    isLoading: runLogRecordsState.loading,
    data: memoizedData,
    totalRunLogRecordCount:
      runLogRecordsState.data?.runLogRecordsTotalCount ?? 0,
    fetchedCount: data.length,
    elementsHeightsSum,
    lastRequestType,
    loadMore,
    startLiveUpdate,
    stopLiveUpdate,
    updateScrollOffset: setScrollOffset,
    scrollOffset,
    liveUpdateToken: liveUpdate.current,
  };
}

export default useRunLogRecords;
