import React from 'react';
import moment from 'moment';

import { IResourceState } from 'modules/core/utils/createResource';

import { CONTRIBUTION_DAY_FORMAT, TABLE_DATE_FORMAT } from 'config/dates/dates';

import { IRun } from 'types/services/models/metrics/runModel';

import contributionsFeedEngine from './ContributionsFeedStore';

function useContributionsFeed() {
  const { current: engine } = React.useRef(contributionsFeedEngine);
  const contributionsFeedStore: IResourceState<any[]> =
    engine.contributionsFeedState((state) => state);
  React.useEffect(() => {
    engine.fetchContributionsFeed();
    return () => {
      engine.contributionsFeedState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const memoizedData = React.useMemo(() => {
    // get existing month list from the contributionsFeedStore data
    const data: { [key: string]: any } = {};
    if (contributionsFeedStore.data?.length) {
      const monthList = contributionsFeedStore.data?.reduce(
        (acc, run: IRun<unknown>) => {
          const { props } = run;
          const month = moment(props.creation_time * 1000).format('MMMM_YYYY');
          if (!acc.includes(month)) {
            acc.push(month);
          }
          return acc;
        },
        [],
      );
      // create a list of objects with month and contributions

      monthList.forEach((month: string) => {
        data[month] = [];
      });

      // add contributions to the month list
      contributionsFeedStore.data?.forEach((run: IRun<unknown>) => {
        const { props } = run;

        // get the month
        const month = moment(props.creation_time * 1000).format('MMMM_YYYY');

        // get the day of the month
        const day = moment(props.creation_time * 1000).format(
          CONTRIBUTION_DAY_FORMAT,
        );

        // create a contribution object
        const contribution = {
          name: props.name,
          date: moment(props.creation_time * 1000).format(TABLE_DATE_FORMAT),
        };

        // check if the day already exists in the month list
        if (data[month]?.[day]?.length) {
          data[month][day].push(contribution);
        } else {
          data[month][day] = [contribution];
        }
      });
    }
    return data;
  }, [contributionsFeedStore.data]);
  return {
    isLoading: contributionsFeedStore.loading,
    data: memoizedData,
  };
}

export default useContributionsFeed;
