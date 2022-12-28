import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';

import { IResourceState } from 'modules/core/utils/createResource';

import {
  CONTRIBUTION_DAY_FORMAT,
  CONTRIBUTION_MONTH_FORMAT,
  CONTRIBUTION_TIME_FORMAT,
} from 'config/dates/dates';

import runRecordsEngine from './RunLogRecordsStore';

import { RunLogRecordType } from '.';

function useRunLogRecords(runId: string) {
  const [data, setData] = React.useState<RunLogRecordType[]>([]);
  const { current: engine } = React.useRef(runRecordsEngine);
  const runLogRecordsState: IResourceState<RunLogRecordType[]> =
    engine.runLogRecordsState((state) => state);

  React.useEffect(() => {
    if (_.isEmpty(runLogRecordsState.data)) {
      engine.fetchRunLogRecords({ runId, record_range: '' });
    }
    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (runLogRecordsState.data?.length) {
      let newData = [...data, ...runLogRecordsState.data];
      setData(newData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runLogRecordsState.data]);

  const memoizedData = React.useMemo(() => {
    // get existing month list from the contributionsFeedStore data
    const feedData: { [key: string]: any } = {};
    if (data.length) {
      const monthList = data?.reduce(
        (acc: string[], record: RunLogRecordType) => {
          const month = moment(record.timestamp * 1000).format(
            CONTRIBUTION_MONTH_FORMAT,
          );
          if (!acc.includes(month)) {
            acc.push(month);
          }
          return acc;
        },
        [],
      );
      // create a list of objects with month and contributions

      monthList.forEach((month: string) => {
        feedData[month] = {};
      });

      // add contributions to the month list
      data?.forEach((record: RunLogRecordType) => {
        // get the month
        const month = moment(record.timestamp * 1000).format(
          CONTRIBUTION_MONTH_FORMAT,
        );

        // get the day of the month
        const day = moment(record.timestamp * 1000).format(
          CONTRIBUTION_DAY_FORMAT,
        );
        // create a contribution object
        const contribution = {
          date: moment(record.timestamp * 1000).format(
            CONTRIBUTION_TIME_FORMAT,
          ),
          hash: record.hash,
          message: record.message,
          type: record.log_level,
          creation_time: record.timestamp,
          runId,
        };
        if (feedData[month]?.[day]?.length) {
          feedData[month][day].push(contribution);
        } else {
          feedData[month][day] = [contribution];
        }
      });
    }
    return feedData;
  }, [data, runId]);

  function loadMore(): void {
    if (runLogRecordsState.data && !runLogRecordsState.loading) {
      engine.fetchRunLogRecords({ runId, record_range: '' });
    }
  }

  return {
    isLoading: runLogRecordsState.loading,
    data: memoizedData,
    totalRunLogRecordCount: 1,
    fetchedCount: data.length,
    loadMore,
  };
}

export default useRunLogRecords;
