import './HubMainScreen.less';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import * as _ from 'lodash';

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

const URLStateParams = [
  'chart.focused.circle',
  'chart.settings.persistent',
  'search',
  'contextFilter',
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
      HubMainScreenModel.events.SET_SCREEN_STATE,
    ]);

  const {
    setRunsState,
    setContextFilter,
    setSearchState,
    setChartFocusedState,
    setChartFocusedActiveState,
    setChartSettingsState,
    setTraceList,
    setScreenState,
  } = HubMainScreenModel.emitters;

  const projectWrapperRef = useRef();
  const searchBarRef = useRef();

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
    const URL = buildUrl(screens.EXPLORE_SEARCH, {
      search: encodedState,
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
            searchByQuery(state.chart.settings.persistent.pointsCount).then(
              () => {
                setChartFocusedActiveState(state.chart.focused, null, true);
                setChartSettingsState(state.chart.settings, setTraceList, true);
              },
            );
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

  function updateURL({ replaceUrl }) {
    if (!isURLStateOutdated(window.location.search)) {
      return;
    }

    const state = getCurrentState();

    const URL = stateToURL(state);
    setItem(USER_LAST_EXPLORE_CONFIG, URL);
    if (window.location.pathname + window.location.search !== URL) {
      if (replaceUrl) {
        props.history.replace(URL);
        console.log(`Replace: URL(${URL})`);
      } else {
        props.history.push(URL);
        console.log(`Update: URL(${URL})`);
      }

      if (state.search?.query !== null) {
        setItem(USER_LAST_SEARCH_QUERY, state.search?.query);
      }
    }
  }

  function searchByQuery(
    pointsCount = HubMainScreenModel.getState().chart.settings.persistent
      .pointsCount || 50,
  ) {
    return new Promise((resolve) => {
      const query = HubMainScreenModel.getState().search?.query?.trim();
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
          Promise.all([
            getRunsByQuery(query, pointsCount),
            // Get other properties
          ]).then(() => {
            resolve();
          });
        },
      );
    });
  }

  function getRunsByQuery(query, numPoints) {
    return new Promise((resolve, reject) => {
      setRunsState({ isLoading: true });
      props
        .getCommitsMetricsByQuery(query, numPoints)
        .then((data) => {
          setRunsState(
            {
              isEmpty: !data.runs || data.runs.length === 0,
              data: data.runs,
              params: data.params,
              aggMetrics: data.agg_metrics,
              meta: data.meta,
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

  useEffect(() => {
    recoverStateFromURL(window.location.search);
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
        HubMainScreenModel.events.SET_CONTEXT_FILTER,
        HubMainScreenModel.events.SET_SEARCH_STATE,
        HubMainScreenModel.events.SET_SEED,
        HubMainScreenModel.events.TOGGLE_PERSISTENCE,
      ],
      updateURL,
    );

    const pointsCountChangeSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.SET_CHART_POINTS_COUNT,
      (stateUpdate) => {
        searchByQuery(stateUpdate.chart.settings.persistent.pointsCount);
      },
    );

    // Analytics
    analytics.pageView('Explore');

    return () => {
      subscription.unsubscribe();
      pointsCountChangeSubscription.unsubscribe();
      HubMainScreenModel.emit(null, {
        search: {
          ...HubMainScreenModel.getState().search,
          query: '',
        },
      });
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
    </ProjectWrapper>
  );
}

export default withRouter(
  storeUtils.getWithState(classes.HUB_MAIN_SCREEN, HubMainScreen),
);
