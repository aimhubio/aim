import React from 'react';
import moment from 'moment';

import {
  TIMELINE_DAY_FORMAT,
  TIMELINE_MONTH_FORMAT,
  TIMELINE_TIME_FORMAT,
} from 'config/dates/dates';

import { IResourceState } from 'modules/core/utils/createResource';

import { IRun } from 'types/services/models/metrics/runModel';

import projectContributionsEngine from '../ProjectContributions/ProjectContributionsStore';

import contributionsFeedEngine from './DashboardContributionsFeedStore';

function useDashboardContributionsFeed() {
  const [data, setData] = React.useState<any>([]);
  const { current: engine } = React.useRef(contributionsFeedEngine);
  const contributionsFeedStore: IResourceState<any[]> =
    engine.contributionsFeedState((state) => state);
  const { current: contributionsEngine } = React.useRef(
    projectContributionsEngine,
  );
  const contributionsState = contributionsEngine.projectContributionsState(
    (state) => state,
  );

  React.useEffect(() => {
    engine.fetchContributionsFeed({
      limit: 25,
      exclude_params: true,
      exclude_traces: true,
    });
    return () => {
      engine.destroy();
    };
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
      const monthList = data?.reduce((acc: any, run: IRun<unknown>) => {
        const { props } = run;
        const month = moment(props.creation_time * 1000).format(
          TIMELINE_MONTH_FORMAT,
        );
        if (!acc.includes(month)) {
          acc.push(month);
        }
        return acc;
      }, []);
      // create a list of objects with month and contributions

      monthList.forEach((month: string) => {
        feedData[month] = {};
      });

      // add contributions to the month list
      data?.forEach((run: IRun<unknown>) => {
        const { props, hash } = run;

        // get the month
        const month = moment(props.creation_time * 1000).format(
          TIMELINE_MONTH_FORMAT,
        );

        // get the day of the month
        const day = moment(props.creation_time * 1000).format(
          TIMELINE_DAY_FORMAT,
        );

        // create a contribution object
        const contribution = {
          name: props.name,
          date: moment(props.creation_time * 1000).format(TIMELINE_TIME_FORMAT),
          hash,
          active: props.active,
          creation_time: props.creation_time,
          experiment: props.experiment?.name,
          experimentId: props.experiment?.id,
        };
        if (feedData[month]?.[day]?.length) {
          feedData[month][day].push(contribution);
        } else {
          feedData[month][day] = [contribution];
        }
      });
    }
    return feedData;
  }, [data]);

  function loadMore(): void {
    if (contributionsFeedStore.data && !contributionsFeedStore.loading) {
      engine.fetchContributionsFeed({
        limit: 25,
        exclude_params: true,
        exclude_traces: true,
        offset: data[data.length - 1].hash,
      });
    }
  }

  return {
    isLoading: contributionsFeedStore.loading,
    data: memoizedData,
    totalRunsCount: contributionsState.data?.num_runs,
    archivedRunsCount: contributionsState.data?.num_archived_runs,
    fetchedCount: data.length,
    loadMore,
  };
}

export default useDashboardContributionsFeed;
