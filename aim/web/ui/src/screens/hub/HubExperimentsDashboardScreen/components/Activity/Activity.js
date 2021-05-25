import './Activity.less';

import React, { useState, useEffect, Fragment } from 'react';
import ContentLoader from 'react-content-loader';

import * as analytics from '../../../../../services/analytics';
import * as storeUtils from '../../../../../storeUtils';
import * as classes from '../../../../../constants/classes';
import { NUM_EXPERIMENTS_KEY, NUM_RUNS_KEY } from '../../../../../config';
import { shiftDate } from '../../../../../utils';
import UI from '../../../../../ui';
import { getItem, setItem } from '../../../../../services/storage';

function Activity(props) {
  let [state, setState] = useState({
    isLoading: true,
  });

  useEffect(() => {
    props
      .getProjectActivity()
      .then((data) => {
        setState((s) => ({
          ...s,
          ...data,
          activityMapMax: !!data?.activity_map
            ? Math.max(...Object.values(data.activity_map))
            : 0,
        }));

        if (Number.isInteger(data?.num_experiments)) {
          analytics.trackEvent('Number of experiments', {
            num_experiments: data.num_experiments,
            diff: data.num_experiments - (getItem(NUM_EXPERIMENTS_KEY) || 0),
          });
          setItem(NUM_EXPERIMENTS_KEY, data.num_experiments);
        }
        if (Number.isInteger(data?.num_runs)) {
          analytics.trackEvent('Number of runs', {
            num_runs: data.num_runs,
            diff: data.num_runs - (getItem(NUM_RUNS_KEY) || 0),
          });
          setItem(NUM_RUNS_KEY, data.num_runs);
        }
      })
      .catch(() =>
        setState((s) => ({
          ...s,
          activity_map: {},
          num_experiments: 0,
          num_runs: 0,
        })),
      )
      .finally(() =>
        setState((s) => ({
          ...s,
          isLoading: false,
        })),
      );
  }, []);

  const today = new Date();

  function searchRuns(item, date, index) {
    if (!date) {
      return;
    }

    /*
    const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const query = `run.date > ${Math.floor(dateUTC / 1000)} and run.date < ${Math.ceil(dateUTC / 1000 + 24 * 60 * 60)}`;
     */

    const query = `run.date > ${Math.floor(
      date.getTime() / 1000,
    )} and run.date < ${Math.ceil(shiftDate(date, 1).getTime() / 1000)}`;
    props.setRunsSearchBarValue(query, true);

    analytics.trackEvent('[Dashboard] [Activity] Search runs by date');
  }

  return (
    <div className='HubExperimentsDashboardScreen__activity'>
      {state.isLoading && (
        <ContentLoader
          height={160}
          width={900}
          backgroundColor='#DDDDDD'
          foregroundColor='#D2D2D2'
        >
          <rect x='0' y='0' rx='4' ry='4' width='120' height='20' />
          <rect x='0' y='30' rx='4' ry='4' width='220' height='130' />
          <rect x='240' y='30' rx='4' ry='4' width='220' height='130' />

          <rect x='480' y='0' rx='4' ry='4' width='120' height='20' />
          <rect x='480' y='30' rx='4' ry='4' width='400' height='130' />
        </ContentLoader>
      )}
      {!state.isLoading && (
        <div className='HubExperimentsDashboardScreen__activity__body'>
          <div className='HubExperimentsDashboardScreen__activity__stats'>
            <UI.Text
              className='HubExperimentsDashboardScreen__content__block__title'
              type='primary'
              overline
              bold
            >
              Statistics
            </UI.Text>
            <div className='HubExperimentsDashboardScreen__activity__stats__items'>
              <div className='HubExperimentsDashboardScreen__activity__stats__item'>
                <UI.Text className='HubExperimentsDashboardScreen__activity__stats__title'>
                  Experiments
                </UI.Text>
                <UI.Text
                  size={1}
                  className='HubExperimentsDashboardScreen__activity__stats__figure'
                >
                  {state?.num_experiments ?? '0'}
                </UI.Text>
                <div className='HubExperimentsDashboardScreen__activity__stats__icon'>
                  <UI.Icon i='layers' spacingRight={false} />
                </div>
              </div>
              <div className='HubExperimentsDashboardScreen__activity__stats__item'>
                <UI.Text className='HubExperimentsDashboardScreen__activity__stats__title'>
                  Runs
                </UI.Text>
                <UI.Text
                  size={1}
                  className='HubExperimentsDashboardScreen__activity__stats__figure'
                >
                  {state?.num_runs ?? '0'}
                </UI.Text>
                <div className='HubExperimentsDashboardScreen__activity__stats__icon'>
                  <UI.Icon i='multiline_chart' spacingRight={false} />
                </div>
              </div>
            </div>
          </div>
          <div className='HubExperimentsDashboardScreen__activity__heatmap__box'>
            <UI.Text
              className='HubExperimentsDashboardScreen__content__block__title'
              type='primary'
              overline
              bold
            >
              Activity
            </UI.Text>
            <div className='HubExperimentsDashboardScreen__activity__heatmap'>
              <UI.CalendarHeatmap
                startDate={shiftDate(today, -10 * 30)}
                endDate={today}
                onCellClick={searchRuns}
                data={Object.keys(state?.activity_map ?? {}).map((k) => [
                  new Date(k),
                  state.activity_map[k],
                ])}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default storeUtils.getWithState(
  classes.HUB_PROJECT_EXPERIMENTS_DASHBOARD_SCREEN,
  Activity,
);
