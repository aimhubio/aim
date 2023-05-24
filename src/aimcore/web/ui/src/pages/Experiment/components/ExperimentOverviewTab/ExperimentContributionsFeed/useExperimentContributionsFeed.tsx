import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';

import {
  TIMELINE_DAY_FORMAT,
  TIMELINE_MONTH_FORMAT,
  TIMELINE_TIME_FORMAT,
} from 'config/dates/dates';

import { IResourceState } from 'modules/core/utils/createResource';
import { ExperimentRun } from 'modules/core/api/experimentsApi';

import experimentContributionsEngine from '../ExperimentContributions/ExperimentContributionsStore';

import experimentContributionsFeedEngine from './ExperimentContributionsFeedStore';

function useExperimentContributionsFeed(
  experimentId: string,
  experimentName: string,
) {
  const [data, setData] = React.useState<any>([]);
  const { current: engine } = React.useRef(experimentContributionsFeedEngine);
  const contributionsFeedStore: IResourceState<ExperimentRun[]> =
    engine.experimentContributionsFeedState((state) => state);

  const { current: contributionsEngine } = React.useRef(
    experimentContributionsEngine,
  );
  const experimentContributionsState =
    contributionsEngine.experimentContributionsState((state) => state);

  React.useEffect(() => {
    if (_.isEmpty(contributionsFeedStore.data)) {
      engine.fetchExperimentContributionsFeed(experimentId, {
        limit: 25,
      });
    }
    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (contributionsFeedStore.data?.length) {
      let newData = [...data, ...contributionsFeedStore.data];
      setData(newData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributionsFeedStore.data]);

  const memoizedData = React.useMemo(() => {
    // get existing month list from the contributionsFeedStore data
    const feedData: { [key: string]: any } = {};
    if (data.length) {
      const monthList = data?.reduce(
        (acc: { [key: string]: any }, run: ExperimentRun) => {
          const month = moment(run.creation_time * 1000).format(
            TIMELINE_MONTH_FORMAT,
          );
          if (!acc.includes(month) && !run.archived) {
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
      data?.forEach((run: ExperimentRun) => {
        if (!run.archived) {
          // get the month
          const month = moment(run.creation_time * 1000).format(
            TIMELINE_MONTH_FORMAT,
          );

          // get the day of the month
          const day = moment(run.creation_time * 1000).format(
            TIMELINE_DAY_FORMAT,
          );

          // create a contribution object
          const contribution = {
            name: run.name,
            date: moment(run.creation_time * 1000).format(TIMELINE_TIME_FORMAT),
            hash: run.run_id,
            creation_time: run.creation_time,
            experiment: experimentName,
            experimentId: experimentId,
          };
          if (feedData[month]?.[day]?.length) {
            feedData[month][day].push(contribution);
          } else {
            feedData[month][day] = [contribution];
          }
        }
      });
    }
    return feedData;
  }, [data, experimentName, experimentId]);

  function loadMore(): void {
    if (contributionsFeedStore.data && !contributionsFeedStore.loading) {
      engine.fetchExperimentContributionsFeed(experimentId, {
        limit: 25,
        offset: data[data.length - 1].run_id,
      });
    }
  }

  return {
    isLoading: contributionsFeedStore.loading,
    data: memoizedData,
    totalRunsCount: experimentContributionsState.data?.num_runs,
    archivedRunsCount: experimentContributionsState.data?.num_archived_runs,
    fetchedCount: data.length,
    loadMore,
  };
}

export default useExperimentContributionsFeed;
