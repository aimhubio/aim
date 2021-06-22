import './HubMainScreen.less';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import * as _ from 'lodash';
import { useToasts } from 'react-toast-notifications';

import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import * as storeUtils from '../../../storeUtils';
import { setItem, getItem } from '../../../services/storage';
import {
  USER_LAST_SEARCH_QUERY,
  AIM_QL_VERSION,
  USER_LAST_EXPLORE_CONFIG,
} from '../../../config';
import Panel from './components/Panel/Panel';
import ContextBox from './components/ContextBox/ContextBox';
import ControlsSidebar from './components/ControlsSidebar/ControlsSidebar';
import {
  deepEqual,
  buildUrl,
  getObjectValueByPath,
  classNames,
} from '../../../utils';
import * as analytics from '../../../services/analytics';
import SelectForm from './components/SelectForm/SelectForm';
import { HubMainScreenModel } from './models/HubMainScreenModel';
import BarViewModes from '../../../components/hub/BarViewModes/BarViewModes';
import Alert from './components/Alert/Alert';
import UI from '../../../ui';
import QueryParseErrorAlert from '../../../components/hub/QueryParseErrorAlert/QueryParseErrorAlert';
import SaveAsModal from './components/SaveAsModal/SaveAsModal';
import AlignmentWarning from './components/AlignmentWarning/AlignmentWarning';

const URLStateParams = [
  'chart.focused.circle',
  'chart.settings.persistent',
  'search',
  'contextFilter',
];

const excludedPropsForAppSave = [
  'runs',
  'traceList',
  'viewKey',
  'chart.focused.step',
  'chart.focused.metric',
  'chart.settings.zoomMode',
  'chart.settings.zoomHistory',
];

const defaultSearchQuery = 'loss';
const searchBarHeight = 75;

function HubMainScreen(props) {
  let [state, setState] = useState({
    height: 0,
    width: 0,
    resizing: false,
    searchError: null,
  });

  let { runs, traceList, search, searchInput, screen } =
    HubMainScreenModel.useHubMainScreenState([
      HubMainScreenModel.events.SET_RUNS_STATE,
      HubMainScreenModel.events.SET_TRACE_LIST,
      HubMainScreenModel.events.SET_RECOVERED_STATE,
      HubMainScreenModel.events.SET_SCREEN_STATE,
    ]);

  const {
    setRecoveredState,
    setRunsState,
    setContextFilter,
    setSearchState,
    setChartFocusedState,
    setChartFocusedActiveState,
    setChartSettingsState,
    setTraceList,
    setScreenState,
    setViewKey,
  } = HubMainScreenModel.emitters;

  const { traceToHash } = HubMainScreenModel.helpers;

  const projectWrapperRef = useRef();
  const searchBarRef = useRef();
  const firstEffect = useRef(true);

  const { addToast } = useToasts();

  function updateWindowDimensions() {
    const wrapper = projectWrapperRef.current;
    const projectWrapperHeight = wrapper
      ? projectWrapperRef.current.getHeaderHeight()
      : null;
    if (projectWrapperHeight !== null) {
      setState((s) => ({
        ...s,
        height: window.innerHeight - projectWrapperHeight - 1,
        width: window.innerWidth,
      }));
    } else {
      setTimeout(updateWindowDimensions, 25);
    }
  }

  function startResize() {
    document.addEventListener('mouseup', endResize);
    document.addEventListener('mousemove', resizeHandler);
    document.body.style.cursor = 'row-resize';
    setState((s) => ({
      ...s,
      resizing: true,
    }));
  }

  function endResize() {
    document.removeEventListener('mouseup', endResize);
    document.removeEventListener('mousemove', resizeHandler);
    document.body.style.cursor = 'auto';
    setState((s) => ({
      ...s,
      resizing: false,
    }));
  }

  function resizeHandler(evt) {
    window.requestAnimationFrame(() => {
      const searchBarHeight = searchBarRef.current.clientHeight;
      const height =
        evt.clientY -
        projectWrapperRef.current.getHeaderHeight() -
        searchBarHeight;
      const flex = height / (state.height - searchBarHeight);
      setScreenState({
        panelFlex: flex,
      });
    });
  }

  function getCurrentState() {
    const { chart, search, contextFilter } = HubMainScreenModel.getState();

    return {
      chart: {
        settings: {
          persistent: chart.settings?.persistent,
        },
        focused: {
          circle: chart.focused?.circle,
        },
      },
      search: {
        query: search?.query,
        v: search?.v,
      },
      contextFilter: contextFilter,
    };
  }

  function stateToURL(state) {
    const encodedState = btoa(JSON.stringify(state));
    let screenPath = '';
    switch (props.match.path) {
      case screens.EXPLORE_BOOKMARK:
      case screens.EXPLORE_BOOKMARK_SEARCH:
        screenPath = screens.EXPLORE_BOOKMARK_SEARCH;
        break;
      default:
        screenPath = screens.EXPLORE_SEARCH;
    }
    const URL = buildUrl(screenPath, {
      search: encodedState,
      bookmark_id: props.match.params.bookmark_id,
    });
    return URL;
  }

  function URLSearchToState(search) {
    if (search.indexOf('?search=') !== -1) {
      try {
        const encodedState = search.substr(8);
        let state = JSON.parse(atob(encodedState));
        let currentState = getCurrentState();
        return _.merge({}, currentState, state);
      } catch (e) {
        console.log(e);
        return null;
      }
    }
    return null;
  }

  function isURLStateOutdated(searchQuery) {
    const state = URLSearchToState(searchQuery);
    if (state === null) {
      return !(!!searchQuery && searchQuery.indexOf('?search=') !== -1);
    }

    for (let p in URLStateParams) {
      if (
        !deepEqual(
          getObjectValueByPath(state, URLStateParams[p]) ?? {},
          getObjectValueByPath(
            HubMainScreenModel.getState(),
            URLStateParams[p],
          ) ?? {},
        )
      ) {
        return true;
      }
    }
    return false;
  }

  function recoverStateFromURL(search) {
    if (!!search && search.indexOf('?search=') !== -1) {
      if (!isURLStateOutdated(search)) {
        return;
      }

      const state = URLSearchToState(search);
      if (state.search.v !== AIM_QL_VERSION) {
        return;
      }

      setContextFilter(state.contextFilter, null, false, true, false);
      if (!deepEqual(state.search, HubMainScreenModel.getState().search)) {
        setSearchState(
          state.search,
          () => {
            setChartFocusedActiveState(state.chart.focused, null, true);
            setChartSettingsState(state.chart.settings, null, true);
            searchByQuery().then(setTraceList);
          },
          false,
          true,
        );
      } else {
        setChartFocusedState(state.chart.focused, null, true);
        setChartSettingsState(state.chart.settings, setTraceList, true);
      }
    } else {
      let setSearchQuery = getItem(USER_LAST_SEARCH_QUERY);
      if (!setSearchQuery) {
        setSearchQuery = defaultSearchQuery;
      }
      if (!!setSearchQuery) {
        setSearchState(
          {
            query: setSearchQuery,
          },
          () => {
            searchByQuery().then(() => {});
          },
          false,
          true,
        );
      }
    }
  }

  function recoverStateFromAPI(app_id) {
    return new Promise((resolve, reject) => {
      setRunsState({ isLoading: true });
      props
        .getAppState(app_id)
        .then((data) => {
          if (_.isEmpty(data)) {
            props.history.replace(screens.EXPLORE);
            console.log(`Problems with fetching app: ${app_id}`);
          } else {
            setRecoveredState(data.app_state, () =>
              searchByQuery().then(() => {
                setChartFocusedActiveState(
                  data.app_state.chart.focused,
                  null,
                  false,
                );
                setChartSettingsState(
                  data.app_state.chart.settings,
                  setTraceList,
                  false,
                );
              }),
            );
          }
        })
        .catch((err) => {
          props.history.replace(screens.EXPLORE);
          console.log(`Problems with fetching app: ${app_id}`);
        });
    });
  }

  function updateURL({ replaceUrl }) {
    const state = getCurrentState();

    const URL = stateToURL(state);

    if (
      props.match.path === screens.EXPLORE ||
      props.match.path === screens.EXPLORE_SEARCH
    ) {
      setItem(USER_LAST_EXPLORE_CONFIG, URL);
    }

    if (props.location.pathname + props.location.search !== URL) {
      if (replaceUrl) {
        props.history.replace(URL);
        console.log(`Replace: URL(${URL})`);
      } else {
        props.history.push(URL);
        console.log(`Update: URL(${URL})`);
      }

      if (
        (props.match.path === screens.EXPLORE ||
          props.match.path === screens.EXPLORE_SEARCH) &&
        state.search?.query !== null
      ) {
        setItem(USER_LAST_SEARCH_QUERY, state.search?.query);
      }
    }
  }

  function searchByQuery(search = true) {
    return new Promise((resolve) => {
      setChartFocusedState(
        {
          step: null,
          metric: {
            runHash: null,
            metricName: null,
            traceContext: null,
          },
          circle: {
            active: false,
            runHash: null,
            metricName: null,
            traceContext: null,
            step: null,
          },
        },
        () => {
          const xAxis =
            HubMainScreenModel.getState().chart.settings.persistent.xAlignment;
          const metricName = Array.isArray(xAxis) ? xAxis[0] : undefined;
          if (search) {
            const query = HubMainScreenModel.getState().search?.query?.trim();
            const pointsCount =
              HubMainScreenModel.getState().chart.settings.persistent
                .pointsCount || 50;
            getRunsByQuery(query, pointsCount, metricName).then(resolve);
          } else {
            if (metricName !== undefined) {
              alignRunsByMetric(metricName).then(resolve);
            }
          }
        },
      );
    });
  }

  function getRunsByQuery(query, numPoints, xAxis) {
    return new Promise((resolve, reject) => {
      setRunsState({ isLoading: true });
      props
        .getCommitsMetricsByQuery(query, numPoints, xAxis)
        .then((data) => {
          setRunsState(
            {
              isEmpty: !data.runs || data.runs.length === 0,
              data: data.runs,
              params: data.params,
              aggMetrics: data.agg_metrics,
              meta: data.meta,
              ...(xAxis !== undefined && getAlignmentFields(data.runs)),
            },
            resolve,
          );
          setState((s) => ({
            ...s,
            searchError: null,
          }));
        })
        .catch((err) => {
          const errorBody = err?.response?.body;
          setState((s) => ({
            ...s,
            searchError: errorBody?.type === 'parse_error' ? errorBody : null,
          }));
          setRunsState(
            {
              isEmpty: true,
              data: null,
              params: [],
              aggMetrics: {},
              meta: null,
            },
            resolve,
          );
        })
        .finally(() => {
          setRunsState({ isLoading: false });
        });
    });
  }

  function updateAppState() {
    return new Promise((resolve, reject) => {
      const app_id = HubMainScreenModel.getState().viewKey;
      const appOptions = _.omit(
        HubMainScreenModel.getState(),
        excludedPropsForAppSave,
      );
      props
        .updateApp(app_id, appOptions)
        .then(() => {
          analytics.trackEvent('[Explore] update bookmark state');
          addToast('Bookmark successfully updated', {
            appearance: 'success',
          });
          resolve();
        })
        .catch((err) => {
          addToast('Unable to update the bookmark. Something went wrong.', {
            appearance: 'error',
          });
          reject(err);
        });
    });
  }

  function alignRunsByMetric(metricName) {
    return new Promise((resolve, reject) => {
      setRunsState({ isLoading: true });

      const reqBody = {
        align_by: metricName,
        runs: HubMainScreenModel.getState().runs?.data.map((run) => ({
          run_hash: run.run_hash,
          experiment_name: run.experiment_name,
          metrics: run.metrics.map((metric) => ({
            name: metric?.name,
            traces: metric?.traces.map((trace) => ({
              slice: trace?.slice,
              context: trace?.context,
            })),
          })),
        })),
      };

      props
        .alignXAxisByMetric(reqBody)
        .then((data) => {
          const currentRuns = mergeMetricAlignDataToRuns(
            _.cloneDeep(HubMainScreenModel.getState().runs?.data),
            data.runs,
          );
          setRunsState(currentRuns, resolve);
          setState((s) => ({
            ...s,
            searchError: null,
          }));
        })
        .catch((err) => {
          const errorBody = err?.response?.body;
          setState((s) => ({
            ...s,
            searchError: errorBody?.type === 'parse_error' ? errorBody : null,
          }));
          setRunsState(
            {
              isEmpty: true,
              data: null,
              params: [],
              aggMetrics: {},
              meta: null,
            },
            resolve,
          );
        })
        .finally(() => {
          setRunsState({ isLoading: false });
        });
    });
  }

  function mergeMetricAlignDataToRuns(runs, alignedRuns) {
    let isSynced = true;
    let isAsc = true;
    let isSkipped = false;
    let isAligned = false;
    runs.forEach((run) => {
      run?.metrics?.forEach((metric) => {
        metric?.traces?.forEach((trace) => {
          const traceKey = traceToHash(
            run?.run_hash,
            metric?.name,
            trace?.context,
          );
          let merged = false;
          alignedRuns.forEach((alignedRun) => {
            alignedRun?.metrics?.forEach((alignedMetric) => {
              alignedMetric?.traces?.forEach((alignedTrace) => {
                const alignedTraceKey = traceToHash(
                  alignedRun?.run_hash,
                  alignedMetric?.name,
                  alignedTrace?.context,
                );
                if (traceKey !== alignedTraceKey) {
                  return;
                }
                if (alignedTrace.alignment) {
                  const { is_synced, is_asc, skipped_steps } =
                    alignedTrace.alignment;
                  if (!is_synced) {
                    isSynced = false;
                  }
                  if (!is_asc) {
                    isAsc = false;
                  }
                  if (skipped_steps > 0) {
                    isSkipped = true;
                  }
                  isAligned = true;
                  merged = true;

                  trace.alignment = alignedTrace.alignment;
                  trace.data = trace.data.map((point, i) => {
                    return point.slice(0, 4).concat([alignedTrace.data[i]]);
                  });
                } else {
                  isSynced = false;
                  trace.alignment = undefined;
                }
              });
            });
          });
          if (!merged) {
            trace.data = trace.data.map((point) =>
              point.slice(0, 4).concat([null]),
            );
            trace.alignment = undefined;
          }
        });
      });
    });

    return {
      data: runs,
      isSynced,
      isAsc,
      isSkipped,
      isAligned,
    };
  }

  function getAlignmentFields(runs) {
    let isSynced = true;
    let isAsc = true;
    let isSkipped = false;
    let isAligned = false;

    runs.forEach((run) => {
      run?.metrics.forEach((metric) => {
        metric?.traces.forEach((trace) => {
          if (trace.alignment) {
            const { is_synced, is_asc, skipped_steps } = trace.alignment;
            if (!is_synced) {
              isSynced = false;
            }
            if (!is_asc) {
              isAsc = false;
            }
            if (skipped_steps > 0) {
              isSkipped = true;
            }
            isAligned = true;
          } else {
            isSynced = false;
          }
        });
      });
    });

    return {
      isSynced,
      isAsc,
      isSkipped,
      isAligned,
    };
  }

  useEffect(() => {
    const { bookmark_id } = props.match.params;
    if (!!bookmark_id && firstEffect.current) {
      setViewKey(bookmark_id);
      recoverStateFromAPI(bookmark_id);
    } else {
      if (!bookmark_id) {
        setViewKey(null);
      }
      recoverStateFromURL(props.location.search);
    }
    if (firstEffect.current) {
      firstEffect.current = false;
    }
  }, [props.location]);

  useEffect(() => {
    props.completeProgress();
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);

    const subscription = HubMainScreenModel.subscribe(
      [
        HubMainScreenModel.events.SET_CHART_FOCUSED_ACTIVE_STATE,
        HubMainScreenModel.events.SET_CHART_SETTINGS_STATE,
        HubMainScreenModel.events.SET_CHART_POINTS_COUNT,
        HubMainScreenModel.events.SET_CHART_X_AXIS_METRIC_ALIGNMENT,
        HubMainScreenModel.events.SET_CONTEXT_FILTER,
        HubMainScreenModel.events.SET_SEARCH_STATE,
        HubMainScreenModel.events.SET_SEED,
        HubMainScreenModel.events.TOGGLE_PERSISTENCE,
      ],
      updateURL,
    );

    const pointsCountChangeSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.SET_CHART_POINTS_COUNT,
      searchByQuery,
    );

    const xAxisMetricAlignmentChangeSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.SET_CHART_X_AXIS_METRIC_ALIGNMENT,
      () => searchByQuery(false),
    );

    const updateAppStateSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.UPDATE_APP,
      updateAppState,
    );

    // Analytics
    analytics.pageView('Explore');

    return () => {
      subscription.unsubscribe();
      pointsCountChangeSubscription.unsubscribe();
      updateAppStateSubscription.unsubscribe();
      xAxisMetricAlignmentChangeSubscription.unsubscribe();
      HubMainScreenModel.resetState();
      window.removeEventListener('resize', updateWindowDimensions);
      document.removeEventListener('mouseup', endResize);
      document.removeEventListener('mousemove', resizeHandler);
    };
  }, []);

  function _renderContent() {
    const panelIndicesLen = traceList?.getChartsNumber();
    const panelIndices = [...Array(panelIndicesLen).keys()];
    const headerWidth = 70;
    const controlsWidth = 75;

    return (
      <div
        className={classNames({
          HubMainScreen__grid__body: true,
          [`HubMainScreen__grid__body--${screen.viewMode}`]: true,
        })}
        style={{
          height: `${state.height - searchBarHeight}px`,
        }}
      >
        {!runs.isLoading &&
        Array.isArray(
          HubMainScreenModel.getState().chart.settings.persistent.xAlignment,
        ) &&
        !runs.isAligned ? (
            <div className='HubMainScreen__grid__body__blocks'>
              <Alert segment>
                <UI.Text type='grey' center>
                Unable to align runs by the given metric.
                </UI.Text>
              </Alert>
            </div>
          ) : (
            <div className='HubMainScreen__grid__body__blocks'>
              {screen.viewMode !== 'context' && (
                <div
                  className='HubMainScreen__grid__panel'
                  style={{
                    flex: screen.viewMode === 'panel' ? 1 : screen.panelFlex,
                  }}
                >
                  <Panel
                    parentHeight={state.height}
                    parentWidth={state.width}
                    mode={screen.viewMode}
                    indices={panelIndices}
                    resizing={state.resizing}
                  />
                  {Array.isArray(
                    HubMainScreenModel.getState().chart.settings.persistent
                      .xAlignment,
                  ) &&
                  (runs.isSkipped || !runs.isSynced || !runs.isAsc) && (
                    <AlignmentWarning
                      isSkipped={runs.isSkipped}
                      isSynced={runs.isSynced}
                      isAsc={runs.isAsc}
                    />
                  )}
                </div>
              )}
              {screen.viewMode === 'resizable' && (
                <div
                  className='HubMainScreen__grid__resize__area'
                  onMouseDown={startResize}
                >
                  <div
                    className={classNames({
                      HubMainScreen__grid__resize__handler: true,
                      active: state.resizing,
                    })}
                  >
                    <div className='HubMainScreen__grid__resize__icon' />
                  </div>
                </div>
              )}
              <div
                className={classNames({
                  HubMainScreen__grid__context: true,
                  'HubMainScreen__grid__context--minimize':
                  screen.viewMode === 'panel',
                })}
                style={{
                  flex:
                  screen.viewMode === 'context'
                    ? 1
                    : screen.viewMode === 'panel'
                      ? 0
                      : 1 - screen.panelFlex,
                }}
              >
                {screen.viewMode !== 'panel' ? (
                  <ContextBox
                    spacing={screen.viewMode !== 'resizable'}
                    width={state.width - headerWidth - controlsWidth - 5}
                    resizing={state.resizing}
                    viewMode={screen.viewMode}
                    setViewMode={(mode) => setScreenState({ viewMode: mode })}
                  />
                ) : (
                  <div className='HubMainScreen__grid__context__bar'>
                    <BarViewModes
                      viewMode={screen.viewMode}
                      setViewMode={(mode) => setScreenState({ viewMode: mode })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        <div className='HubMainScreen__grid__controls'>
          <ControlsSidebar />
        </div>
      </div>
    );
  }

  function _renderEmptyFieldsAlert() {
    return (
      <Alert segment>
        <UI.Text type='grey' center>
          No metric or parameter is selected. Please{' '}
          <UI.Text
            className='link'
            type='primary'
            inline
            onClick={() =>
              document
                .querySelector('.SelectForm__form__row__input__wrapper input')
                .focus()
            }
          >
            select
          </UI.Text>{' '}
          one to explore your runs.
        </UI.Text>
      </Alert>
    );
  }

  function _renderParseErrorAlert() {
    return (
      <Alert>
        <QueryParseErrorAlert
          key={state.searchError.statement}
          query={`select ${state.searchError.statement}`}
          errorOffset={state.searchError.location - 1 + 7}
        />
      </Alert>
    );
  }

  function _renderNoExperimentsAlert() {
    return (
      <Alert segment>
        {!!search.query ? (
          <UI.Text type='grey' center>
            You haven't recorded experiments matching this query.
          </UI.Text>
        ) : (
          <UI.Text type='grey' center>
            It's super easy to search Aim experiments.
          </UI.Text>
        )}
        <UI.Text type='grey' center>
          Lookup{' '}
          <a
            className='link'
            href='https://github.com/aimhubio/aim#searching-experiments'
            target='_blank'
            rel='noopener noreferrer'
          >
            search docs
          </a>{' '}
          to learn more.
        </UI.Text>
      </Alert>
    );
  }

  function _renderBody() {
    return runs.isLoading === false && runs.isEmpty === true ? (
      <div className='HubMainScreen__alerts'>
        {!searchInput.selectInput.length ? (
          _renderEmptyFieldsAlert()
        ) : (
          <Fragment>
            {!!state.searchError && _renderParseErrorAlert()}
            {state.searchError === null && _renderNoExperimentsAlert()}
          </Fragment>
        )}
      </div>
    ) : (
      _renderContent()
    );
  }

  return (
    <ProjectWrapper size='fluid' gap={false} ref={projectWrapperRef}>
      <Helmet>
        <meta title='' content='' />
      </Helmet>
      <div
        className='HubMainScreen__wrapper'
        style={{
          height: state.height,
        }}
      >
        <div className='HubMainScreen'>
          <div className='HubMainScreen__grid'>
            <div
              className='HubMainScreen__grid__search-filter'
              ref={searchBarRef}
            >
              <SelectForm searchByQuery={searchByQuery} />
            </div>
            {_renderBody()}
          </div>
        </div>
      </div>
      <SaveAsModal
        createApp={props.createApp}
        createDashboard={props.createDashboard}
        excludedPropsForAppSave={excludedPropsForAppSave}
      />
    </ProjectWrapper>
  );
}

export default withRouter(
  storeUtils.getWithState(classes.HUB_MAIN_SCREEN, HubMainScreen),
);
