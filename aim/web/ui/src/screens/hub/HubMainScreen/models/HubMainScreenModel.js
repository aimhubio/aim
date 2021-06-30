import { useState, useEffect } from 'react';
import * as _ from 'lodash';

import {
  AIM_QL_VERSION,
  EXPLORE_METRIC_HIGHLIGHT_MODE,
  USER_LAST_EXPLORE_CONFIG,
  EXPLORE_PANEL_SORT_FIELDS,
  EXPLORE_PANEL_COLOR_PALETTE,
  EXPLORE_PANEL_HIDDEN_METRICS,
  EXPLORE_PANEL_SINGLE_ZOOM_MODE,
  EXPLORE_PANEL_CHART_TOOLTIP_OPTIONS,
  EXPLORE_PANEL_VIEW_MODE,
  EXPLORE_PANEL_FLEX_STYLE,
  CONTEXT_TABLE_CONFIG,
  TABLE_COLUMNS,
  TABLE_COLUMNS_WIDTHS,
} from '../../../../config';
import { getItem, removeItem, setItem } from '../../../../services/storage';
import { flattenObject, sortOnKeys } from '../../../../utils';
import Color from 'color';
import { COLORS } from '../../../../constants/colors';
import TraceList from './TraceList';
import { getGroupingOptions } from '../components/ControlsSidebar/helpers';

// Events

const events = {
  SET_RECOVERED_STATE: 'SET_RECOVERED_STATE',
  SET_RUNS_STATE: 'SET_RUNS_STATE',
  SET_TRACE_LIST: 'SET_TRACE_LIST',
  SET_CHART_FOCUSED_STATE: 'SET_CHART_FOCUSED_STATE',
  SET_CHART_FOCUSED_ACTIVE_STATE: 'SET_CHART_FOCUSED_ACTIVE_STATE',
  SET_CHART_SETTINGS_STATE: 'SET_CHART_SETTINGS_STATE',
  SET_CHART_POINTS_COUNT: 'SET_CHART_POINTS_COUNT',
  SET_CHART_X_AXIS_METRIC_ALIGNMENT: 'SET_CHART_X_AXIS_METRIC_ALIGNMENT',
  SET_CHART_HIDDEN_METRICS: 'SET_CHART_HIDDEN_METRICS',
  SET_CHART_TOOLTIP_OPTIONS: 'SET_CHART_TOOLTIP_OPTIONS',
  SET_CONTEXT_FILTER: 'SET_CONTEXT_FILTER',
  SET_SEARCH_STATE: 'SET_SEARCH_STATE',
  SET_SEARCH_INPUT_STATE: 'SET_SEARCH_INPUT_STATE',
  SET_SORT_FIELDS: 'SET_SORT_FIELDS',
  SET_SEED: 'SET_SEED',
  TOGGLE_PERSISTENCE: 'TOGGLE_PERSISTENCE',
  SET_COLOR_PALETTE: 'SET_COLOR_PALETTE',
  SET_SCREEN_STATE: 'SET_SCREEN_STATE',
  SET_TABLE_ROW_HEIGHT_MODE: 'SET_TABLE_ROW_HEIGHT_MODE',
  SET_TABLE_EXCLUDED_FIELDS: 'SET_TABLE_EXCLUDED_FIELDS',
  SET_TABLE_COLUMNS_ORDER: 'SET_TABLE_COLUMNS_ORDER',
  SET_TABLE_COLUMNS_WIDTHS: 'SET_TABLE_COLUMNS_WIDTHS',
  SET_VIEW_KEY: 'SET_VIEW_KEY',
  CREATE_APP: 'CREATE_APP',
  UPDATE_APP: 'UPDATE_APP',
};

// State

function getInitialState() {
  return {
    // Chart config
    chart: {
      focused: {
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
      settings: {
        zoomMode: false,
        singleZoomMode:
          (getItem(EXPLORE_PANEL_SINGLE_ZOOM_MODE) || 'true') === 'true',
        zoomHistory: [],
        highlightMode: getItem(EXPLORE_METRIC_HIGHLIGHT_MODE) ?? 'run',
        persistent: {
          displayOutliers: false,
          zoom: null,
          interpolate: false,
          indicator: true,
          xAlignment: 'step',
          xScale: 0,
          yScale: 0,
          pointsCount: 50,
          smoothingAlgorithm: 'ema',
          smoothFactor: 0,
          aggregated: false,
        },
      },
      hiddenMetrics: JSON.parse(getItem(EXPLORE_PANEL_HIDDEN_METRICS)) ?? [],
      tooltipOptions: JSON.parse(
        getItem(EXPLORE_PANEL_CHART_TOOLTIP_OPTIONS),
      ) ?? {
        display: true,
        fields: [],
      },
    },

    // Chart data - runs
    runs: {
      isLoading: false,
      isEmpty: true,
      isAligned: true,
      isSynced: true,
      isAsc: true,
      isSkipped: false,
      data: null,
      params: [],
      aggMetrics: {},
      meta: null,
    },

    // Search
    search: {
      query: '',
      v: AIM_QL_VERSION,
    },
    searchInput: {
      value: undefined,
      selectInput: '',
      selectConditionInput: '',
    },

    // Grouping filter
    contextFilter: {
      groupByColor: [],
      groupByStyle: [],
      groupByChart: [],
      groupAgainst: {
        color: false,
        style: false,
        chart: false,
      },
      aggregatedArea: 'min_max',
      aggregatedLine: 'avg',
      seed: {
        color: 10,
        style: 10,
      },
      persist: {
        color: false,
        style: false,
      },
    },

    // Sort fields
    sortFields: JSON.parse(getItem(EXPLORE_PANEL_SORT_FIELDS)) ?? [],

    // Trace list
    traceList: null,

    // Color palette
    colorPalette: !!getItem(EXPLORE_PANEL_COLOR_PALETTE)
      ? +getItem(EXPLORE_PANEL_COLOR_PALETTE)
      : 0,

    // Screen state
    screen: {
      panelFlex: +getItem(EXPLORE_PANEL_FLEX_STYLE) ?? null,
      viewMode: getItem(EXPLORE_PANEL_VIEW_MODE) ?? 'resizable',
    },

    // Context table state
    table: {
      rowHeightMode:
        JSON.parse(getItem(CONTEXT_TABLE_CONFIG.replace('{name}', 'context')))
          ?.rowHeightMode ?? 'medium',
      excludedFields:
        JSON.parse(getItem(CONTEXT_TABLE_CONFIG.replace('{name}', 'context')))
          ?.excludedFields ?? [],
      columnsOrder: JSON.parse(getItem(TABLE_COLUMNS))?.context ?? {
        left: [],
        middle: [],
        right: [],
      },
      columnsWidths: JSON.parse(getItem(TABLE_COLUMNS_WIDTHS))?.context ?? {},
    },

    // Explore view key
    viewKey: null,
  };
}

const state = getInitialState();

// initial controls

const initialControls = {
  chart: {
    settings: {
      zoomMode: false,
      singleZoomMode: true,
      zoomHistory: [],
      highlightMode: getItem(EXPLORE_METRIC_HIGHLIGHT_MODE) ?? 'run',
      persistent: {
        displayOutliers: false,
        zoom: null,
        interpolate: false,
        indicator: true,
        xAlignment: 'step',
        xScale: 0,
        yScale: 0,
        pointsCount: getState().chart.settings.persistent.pointsCount,
        smoothingAlgorithm: 'ema',
        smoothFactor: 0,
        aggregated: false,
      },
    },
  },
  contextFilter: {
    groupByColor: [],
    groupByStyle: [],
    groupByChart: [],
    groupAgainst: {
      color: false,
      style: false,
      chart: false,
    },
    aggregatedArea: 'min_max',
    aggregatedLine: 'avg',
    seed: getState().contextFilter.seed,
    persist: getState().contextFilter.persist,
  },
};

// getter & setter

function getState() {
  return state;
}

function setState(stateUpdate) {
  Object.assign(state, stateUpdate);
}

function resetState() {
  setState(getInitialState());
}

// Event emitter

const subscriptions = {};

function subscribe(event, fn) {
  const multipleEvents = Array.isArray(event);
  if (multipleEvents) {
    event.forEach((evt) => {
      (subscriptions[evt] || (subscriptions[evt] = [])).push(fn);
    });
  } else {
    (subscriptions[event] || (subscriptions[event] = [])).push(fn);
  }

  return {
    unsubscribe: () => {
      if (multipleEvents) {
        event.forEach((evt) => {
          subscriptions[evt] &&
            subscriptions[evt].splice(subscriptions[evt].indexOf(fn) >>> 0, 1);
        });
      } else {
        subscriptions[event] &&
          subscriptions[event].splice(
            subscriptions[event].indexOf(fn) >>> 0,
            1,
          );
      }
    },
  };
}

function emit(event, data) {
  setState(_.omit(data, 'replaceUrl'));
  (subscriptions[event] || []).forEach((fn) => fn(data));
}

// event emitters

function setRecoveredState(state, cb) {
  emit(events.SET_RECOVERED_STATE, _.assign({}, getState(), state));

  if (typeof cb === 'function') {
    cb();
  }
}

function setRunsState(runsState, callback = null) {
  const chartTypeChanged =
    runsState.hasOwnProperty('meta') &&
    runsState.data !== null &&
    getState().runs.data !== null &&
    runsState.meta?.params_selected !== getState().runs.meta?.params_selected;

  emit(events.SET_RUNS_STATE, {
    runs: {
      ...getState().runs,
      ...runsState,
    },
    ...(chartTypeChanged && {
      chart: {
        ...getState().chart,
        settings: {
          ...getState().chart.settings,
          persistent: {
            ...getState().chart.settings.persistent,
            aggregated: false,
          },
        },
      },
      contextFilter: {
        ...getState().contextFilter,
        groupByColor: [],
        groupByStyle: [],
        groupByChart: [],
      },
    }),
  });

  if (!getState().runs.isLoading && !getState().runs.isEmpty) {
    setTraceList();
    const paramsPaths = getAllParamsPaths();
    let possibleSortFields = Object.keys(paramsPaths)
      .map((paramKey) => {
        return paramsPaths[paramKey].map((key) => `${paramKey}.${key}`);
      })
      .flat();
    if (isExploreParamsModeEnabled()) {
      const metrics = getAllMetrics();
      possibleSortFields = possibleSortFields.concat(
        Object.keys(metrics)
          .map((metricKey) => {
            return Object.keys(metrics[metricKey]).map(
              (key) => `${metricKey} ${key}`,
            );
          })
          .flat(),
      );
    }
    const sortFields = getState().sortFields.filter((field) => {
      return possibleSortFields.includes(field[0]);
    });
    setSortFields(sortFields);
  }

  if (callback !== null) {
    callback();
  }
}

function setTraceList() {
  const runs = getState().runs?.data;
  if (!runs) {
    return;
  }

  const seed = getState().contextFilter.seed;
  const persist = getState().contextFilter.persist;
  const colorPalette = getState().colorPalette;
  const groupAgainst = getState().contextFilter.groupAgainst;
  let groupByColor;
  let groupByStyle;
  let groupByChart;

  const groupingAvailableOptions = getGroupingOptions(
    getAllParamsPaths(),
    [],
    false,
    false,
  );
  const groupingAvailableFields = groupingAvailableOptions
    .map((category) => category.options.map((option) => option.value).flat())
    .flat();

  if (getState().contextFilter.groupByColor.length > 0 && groupAgainst?.color) {
    groupByColor = _.difference(
      groupingAvailableFields,
      getState().contextFilter.groupByColor,
    );
  } else {
    groupByColor = getState().contextFilter.groupByColor;
  }
  if (getState().contextFilter.groupByStyle.length > 0 && groupAgainst?.style) {
    groupByStyle = _.difference(
      groupingAvailableFields,
      getState().contextFilter.groupByStyle,
    );
  } else {
    groupByStyle = getState().contextFilter.groupByStyle;
  }
  if (getState().contextFilter.groupByChart.length > 0 && groupAgainst?.chart) {
    groupByChart = _.difference(
      groupingAvailableFields,
      getState().contextFilter.groupByChart,
    );
  } else {
    groupByChart = getState().contextFilter.groupByChart;
  }
  const grouping = {
    color: groupByColor,
    stroke: groupByStyle,
    chart: groupByChart,
  };
  const xAlignment = getState().chart.settings.persistent.xAlignment;
  const scale = {
    xScale: getState().chart.settings.persistent.xScale ?? 0,
    yScale: getState().chart.settings.persistent.yScale ?? 0,
  };
  const smoothingAlgorithm =
    getState().chart.settings.persistent.smoothingAlgorithm;
  const smoothFactor = getState().chart.settings.persistent.smoothFactor;

  const traceList = new TraceList(grouping);
  const aggregate = traceList.groupingFields.length > 0;
  const aggregatedArea = getState().contextFilter.aggregatedArea;
  const aggregatedLine = getState().contextFilter.aggregatedLine;
  const sortFields = getState().sortFields;
  const hiddenMetrics = getState().chart.hiddenMetrics;

  _.orderBy(
    runs,
    sortFields.map(
      (field) =>
        function (run) {
          if (field[0].includes('="') || field[0].includes('No context')) {
            const paramKey = '__METRICS__';
            for (let key in run.params?.[paramKey]) {
              for (let i = 0; i < run.params[paramKey][key].length; i++) {
                const value = run.params[paramKey][key][i].context
                  .map((metric) => `${metric[0]}="${metric[1]}"`)
                  .join(', ');
                const context = value === '' ? 'No context' : `${value}`;
                if (field[0] === `${key} ${context}`) {
                  let val =
                    run.params[paramKey][key][i].values?.last ?? -Infinity;
                  return val === 'inf'
                    ? Infinity
                    : val === '-inf'
                      ? -Infinity
                      : val === 'nan'
                        ? NaN
                        : val;
                }
              }
            }
            return -Infinity;
          }
          return _.get(run, `params.${field[0]}`) ?? '';
        },
    ),
    sortFields.map((field) => field[1]),
  ).forEach((run) => {
    if (!run.metrics?.length) {
      const metricKey = `${run.run_hash}/undefined/${contextToHash(undefined)}`;
      const isHidden = hiddenMetrics.includes(metricKey);
      traceList.addSeries(
        run,
        null,
        null,
        xAlignment,
        aggregate,
        scale,
        persist,
        seed,
        colorPalette,
        isHidden,
        smoothingAlgorithm,
        smoothFactor,
        aggregatedLine,
        aggregatedArea,
      );
    } else {
      run.metrics.forEach((metric) => {
        metric?.traces.forEach((trace) => {
          const metricKey = `${run.run_hash}/${metric?.name}/${contextToHash(
            trace?.context,
          )}`;
          let isHidden = hiddenMetrics.includes(metricKey);
          if (!Array.isArray(xAlignment) || trace.alignment !== undefined) {
            traceList.addSeries(
              run,
              metric,
              trace,
              xAlignment,
              aggregate,
              scale,
              persist,
              seed,
              colorPalette,
              isHidden,
              smoothingAlgorithm,
              smoothFactor,
              aggregatedLine,
              aggregatedArea,
            );
          }
        });
      });
    }
  });

  emit(events.SET_TRACE_LIST, {
    traceList,
  });
}

function setChartSettingsState(
  settingsState,
  callback = null,
  replaceUrl = false,
) {
  emit(events.SET_CHART_SETTINGS_STATE, {
    chart: {
      ...getState().chart,
      settings: {
        ...getState().chart.settings,
        ...settingsState,
      },
    },
    replaceUrl,
  });
  if (callback !== null) {
    callback();
  }
}

function setChartPointsCount(count) {
  emit(events.SET_CHART_POINTS_COUNT, {
    chart: {
      ...getState().chart,
      settings: {
        ...getState().chart.settings,
        persistent: {
          ...getState().chart.settings.persistent,
          pointsCount: +count,
        },
      },
    },
  });
}

function setChartXAxisAlignment(type) {
  if (Array.isArray(type)) {
    emit(events.SET_CHART_X_AXIS_METRIC_ALIGNMENT, {
      chart: {
        ...getState().chart,
        settings: {
          ...getState().chart.settings,
          zoomMode: false,
          zoomHistory: [],
          persistent: {
            ...getState().chart.settings.persistent,
            zoom: null,
            xAlignment: type,
          },
        },
      },
    });
  } else {
    setChartSettingsState(
      {
        ...getState().chart.settings,
        zoomMode: false,
        zoomHistory: [],
        persistent: {
          ...getState().chart.settings.persistent,
          zoom: null,
          xAlignment: type,
        },
      },
      setTraceList,
    );
  }
}

function setHiddenMetrics(metricKey) {
  let hiddenMetricsClone;
  if (metricKey === 'show_all_metrics') {
    hiddenMetricsClone = [];
  } else if (metricKey === 'hide_all_metrics') {
    hiddenMetricsClone = [];
    getState().traceList?.traces.forEach((trace) => {
      (isExploreParamsModeEnabled()
        ? _.uniqBy(trace.series, 'run.run_hash')
        : trace.series
      ).forEach((series) => {
        const { run, metric, trace } = series;
        const contextHash = contextToHash(trace?.context);
        const currentMetricKey = `${run.run_hash}/${metric?.name}/${contextHash}`;
        hiddenMetricsClone.push(currentMetricKey);
      });
    });
  } else {
    hiddenMetricsClone = getState().chart.hiddenMetrics.slice();
    if (hiddenMetricsClone.includes(metricKey)) {
      hiddenMetricsClone.splice(hiddenMetricsClone.indexOf(metricKey), 1);
    } else {
      const { runHash, metricName, traceContext } =
        getState().chart.focused.circle;
      if (runHash !== null) {
        const activeMetricKey = `${runHash}/${metricName}/${traceContext}`;
        if (activeMetricKey === metricKey) {
          setChartFocusedActiveState({
            circle: {
              active: false,
              runHash: null,
              metricName: null,
              traceContext: null,
              step: null,
            },
          });
        }
      }
      hiddenMetricsClone.push(metricKey);
    }
  }

  emit(events.SET_CHART_HIDDEN_METRICS, {
    chart: {
      ...getState().chart,
      hiddenMetrics: hiddenMetricsClone,
    },
  });

  setTraceList();

  if (getState().viewKey === null) {
    setItem(EXPLORE_PANEL_HIDDEN_METRICS, JSON.stringify(hiddenMetricsClone));
  }
}

function setChartTooltipOptions(options) {
  const tooltipOptions = {
    ...getState().chart.tooltipOptions,
    ...options,
  };
  emit(events.SET_CHART_TOOLTIP_OPTIONS, {
    chart: {
      ...getState().chart,
      tooltipOptions,
    },
  });

  if (getState().viewKey === null) {
    setItem(
      EXPLORE_PANEL_CHART_TOOLTIP_OPTIONS,
      JSON.stringify(tooltipOptions),
    );
  }
}

function setChartFocusedState(
  focusedState,
  callback = null,
  replaceUrl = false,
) {
  emit(events.SET_CHART_FOCUSED_STATE, {
    chart: {
      ...getState().chart,
      focused: {
        ...getState().chart.focused,
        ...focusedState,
      },
    },
    replaceUrl,
  });
  if (callback !== null) {
    callback();
  }
}

function setChartFocusedActiveState(
  focusedState,
  callback = null,
  replaceUrl = false,
) {
  emit(events.SET_CHART_FOCUSED_ACTIVE_STATE, {
    chart: {
      ...getState().chart,
      focused: {
        ...getState().chart.focused,
        ...focusedState,
      },
    },
    replaceUrl,
  });
  if (callback !== null) {
    callback();
  }
}

function setContextFilter(
  contextFilterUpdate,
  callback = null,
  resetZoom,
  replaceUrl = false,
  updateColumnsOrder = true,
) {
  let stateUpdate = {
    contextFilter: {
      ...getState().contextFilter,
      ...contextFilterUpdate,
    },
  };

  if (replaceUrl) {
    stateUpdate.replaceUrl = true;
  }

  if (resetZoom && contextFilterUpdate.hasOwnProperty('groupByChart')) {
    stateUpdate.chart = {
      ...getState().chart,
      settings: {
        ...getState().chart.settings,
        zoomMode: false,
        zoomHistory: [],
        persistent: {
          ...getState().chart.settings.persistent,
          zoom: null,
        },
      },
    };
  }

  if (contextFilterUpdate.hasOwnProperty('groupByColor')) {
    stateUpdate.chart = {
      ...getState().chart,
      settings: {
        ...getState().chart.settings,
        persistent: {
          ...getState().chart.settings.persistent,
          indicator: false,
        },
      },
    };
  }

  if (
    getState().chart.settings.persistent.aggregated &&
    stateUpdate.contextFilter.groupByColor.length === 0 &&
    stateUpdate.contextFilter.groupByStyle.length === 0 &&
    stateUpdate.contextFilter.groupByChart.length === 0
  ) {
    stateUpdate.chart = {
      ...getState().chart,
      settings: {
        ...getState().chart.settings,
        persistent: {
          ...getState().chart.settings.persistent,
          aggregated: false,
        },
      },
    };
  }

  // if (updateColumnsOrder) {
  //   ContextTableModel.emit(ContextTableModel.events.SET_GROUPED_COLUMNS, {
  //     name: 'context',
  //     columns: _.difference(
  //       _.concat(
  //         contextFilterUpdate.groupByColor ?? [],
  //         contextFilterUpdate.groupByStyle ?? [],
  //         contextFilterUpdate.groupByChart ?? [],
  //       ),
  //       _.concat(
  //         getState().contextFilter.groupByColor,
  //         getState().contextFilter.groupByStyle,
  //         getState().contextFilter.groupByChart,
  //       ),
  //     ),
  //   });
  // }
  emit(events.SET_CONTEXT_FILTER, stateUpdate);

  setTraceList();

  if (callback !== null) {
    callback();
  }
}

function resetControls() {
  setChartSettingsState(initialControls.chart.settings);
  setContextFilter(initialControls.contextFilter);
  removeItem(USER_LAST_EXPLORE_CONFIG);
  removeItem(EXPLORE_PANEL_SINGLE_ZOOM_MODE);
}

function setSearchState(
  searchState,
  callback = null,
  resetZoomAndHiddenMetrics = true,
  replaceUrl = false,
) {
  const searchQuery = searchState.query || getState().searchInput?.value;

  let selectInput = '';
  let selectConditionInput = '';
  if (searchQuery) {
    const searchParts = searchQuery.split(' if ');
    if (searchParts.length === 2) {
      selectInput = searchParts[0];
      selectConditionInput = searchParts[1];
    } else if (searchParts.length === 1) {
      selectInput = searchParts[0];
      selectConditionInput = '';
    }
  }

  emit(events.SET_SEARCH_STATE, {
    search: {
      ...getState().search,
      ...searchState,
    },
    searchInput: {
      ...getState().searchInput,
      value: searchQuery,
      selectInput,
      selectConditionInput,
    },
    ...(resetZoomAndHiddenMetrics && {
      chart: {
        ...getState().chart,
        settings: {
          ...getState().chart?.settings,
          zoomMode: false,
          zoomHistory: [],
          persistent: {
            ...getState().chart?.settings?.persistent,
            zoom: null,
          },
        },
        hiddenMetrics: [],
      },
    }),
    replaceUrl,
  });
  if (resetZoomAndHiddenMetrics) {
    removeItem(EXPLORE_PANEL_HIDDEN_METRICS);
  }
  if (callback !== null) {
    callback();
  }
}

function setSearchInputState(searchInput, callback = null) {
  emit(events.SET_SEARCH_INPUT_STATE, {
    searchInput: {
      ...getState().searchInput,
      ...searchInput,
    },
  });
  if (callback !== null) {
    callback();
  }
}

function setSortFields(sortFields) {
  emit(events.SET_SORT_FIELDS, {
    sortFields,
  });

  setTraceList();

  if (getState().viewKey === null) {
    setItem(EXPLORE_PANEL_SORT_FIELDS, JSON.stringify(sortFields));
  }
}

function setSeed(seed, type) {
  emit(events.SET_SEED, {
    contextFilter: {
      ...getState().contextFilter,
      seed: {
        ...getState().contextFilter.seed,
        [type]: seed,
      },
    },
  });

  setTraceList();
}

function togglePersistence(type) {
  emit(events.TOGGLE_PERSISTENCE, {
    contextFilter: {
      ...getState().contextFilter,
      persist: {
        ...getState().contextFilter.persist,
        [type]: !getState().contextFilter.persist[type],
      },
    },
  });

  setTraceList();
}

function setColorPalette(paletteIndex) {
  emit(events.SET_COLOR_PALETTE, {
    colorPalette: paletteIndex,
  });

  setTraceList();

  if (getState().viewKey === null) {
    setItem(EXPLORE_PANEL_COLOR_PALETTE, paletteIndex);
  }
}

function setScreenState(screenOptions) {
  emit(events.SET_SCREEN_STATE, {
    screen: {
      ...getState().screen,
      ...screenOptions,
    },
  });

  if (getState().viewKey === null) {
    if (screenOptions.hasOwnProperty('panelFlex')) {
      setItem(EXPLORE_PANEL_FLEX_STYLE, screenOptions.panelFlex);
    }

    if (screenOptions.hasOwnProperty('viewMode')) {
      setItem(EXPLORE_PANEL_VIEW_MODE, screenOptions.viewMode);
    }
  }
}

function setRowHeightMode(mode) {
  emit(events.SET_TABLE_ROW_HEIGHT_MODE, {
    table: {
      ...getState().table,
      rowHeightMode: mode,
    },
  });

  if (getState().viewKey === null) {
    const storageKey = CONTEXT_TABLE_CONFIG.replace('{name}', 'context');
    setItem(
      storageKey,
      JSON.stringify({
        rowHeightMode: mode,
        excludedFields: getState().table.excludedFields,
      }),
    );
  }
}

function setExcludedFields(fields) {
  emit(events.SET_TABLE_EXCLUDED_FIELDS, {
    table: {
      ...getState().table,
      excludedFields: fields,
    },
  });

  if (getState().viewKey === null) {
    const storageKey = CONTEXT_TABLE_CONFIG.replace('{name}', 'context');
    setItem(
      storageKey,
      JSON.stringify({
        rowHeightMode: getState().table.rowHeightMode,
        excludedFields: fields,
      }),
    );
  }
}

function setColumnsOrder(columnsOrder) {
  emit(events.SET_TABLE_COLUMNS_ORDER, {
    table: {
      ...getState().table,
      columnsOrder,
    },
  });

  if (getState().viewKey === null) {
    const tableColumns = JSON.parse(getItem(TABLE_COLUMNS)) ?? {};
    tableColumns.context = columnsOrder;
    setItem(TABLE_COLUMNS, JSON.stringify(tableColumns));
  }
}

function setColumnsWidths(columnsWidths) {
  emit(events.SET_TABLE_COLUMNS_WIDTHS, {
    table: {
      ...getState().table,
      columnsWidths,
    },
  });

  if (getState().viewKey === null) {
    const tableColumnsWidths = JSON.parse(getItem(TABLE_COLUMNS_WIDTHS)) ?? {};
    tableColumnsWidths.context = columnsWidths;
    setItem(TABLE_COLUMNS_WIDTHS, JSON.stringify(tableColumnsWidths));
  }
}

function setViewKey(key) {
  emit(events.SET_VIEW_KEY, {
    viewKey: key,
  });
}

function createApp() {
  emit(events.CREATE_APP, {});
}

function updateApp() {
  emit(events.UPDATE_APP, {});
}

// helpers

function isExploreMetricsModeEnabled() {
  return getState().runs?.meta?.params_selected !== true;
}

function isExploreParamsModeEnabled() {
  return getState().runs?.meta?.params_selected === true;
}

function getCountOfSelectedParams(includeMetrics = true) {
  const countOfParams = getState().runs?.params?.length;
  const countOfMetrics = Object.keys(getState().runs?.aggMetrics ?? {}).map(
    (k) => getState().runs.aggMetrics[k].length,
  );

  return includeMetrics
    ? countOfParams + countOfMetrics.reduce((a, b) => a + b, 0)
    : countOfParams;
}

function getAllParamsPaths(deep = true, nested = false) {
  const paramPaths = {};

  getState().traceList?.traces.forEach((trace) => {
    trace.series.forEach((series) => {
      Object.keys(series?.run.params).forEach((paramKey) => {
        if (paramKey === '__METRICS__') {
          return;
        }

        if (!paramPaths.hasOwnProperty(paramKey)) {
          if (deep && nested) {
            paramPaths[paramKey] = {};
          } else {
            paramPaths[paramKey] = [];
          }
        }

        if (deep) {
          if (nested) {
            for (let key in series?.run.params[paramKey]) {
              if (
                typeof series?.run.params[paramKey][key] === 'object' &&
                series?.run.params[paramKey][key] !== null &&
                !Array.isArray(series?.run.params[paramKey][key])
              ) {
                if (
                  typeof paramPaths[paramKey][key] !== 'object' ||
                  paramPaths[paramKey][key] === null
                ) {
                  paramPaths[paramKey][key] = {};
                }
                paramPaths[paramKey][key] = _.merge(
                  paramPaths[paramKey][key],
                  series?.run.params[paramKey][key],
                );
              } else {
                paramPaths[paramKey][key] = series?.run.params[paramKey][key];
              }
            }
          } else {
            paramPaths[paramKey].push(
              ...Object.keys(flattenObject(series?.run.params[paramKey])),
            );
            paramPaths[paramKey] = _.uniq(paramPaths[paramKey]).sort();
          }
        } else {
          Object.keys(series?.run.params[paramKey]).forEach((key) => {
            if (!paramPaths[paramKey].includes(key)) {
              paramPaths[paramKey].push(key);
              paramPaths[paramKey].sort();
            }
          });
        }
      });
    });
  });

  return sortOnKeys(paramPaths);
}

function getAllMetrics() {
  const metrics = {};
  const paramKey = '__METRICS__';
  getState().traceList?.traces.forEach((trace) => {
    trace.series.forEach((series) => {
      for (let key in series?.run.params?.[paramKey]) {
        if (!metrics.hasOwnProperty(key)) {
          metrics[key] = {};
        }
        for (let i = 0; i < series.run.params[paramKey][key].length; i++) {
          const value = series.run.params[paramKey][key][i].context
            .map((metric) => `${metric[0]}="${metric[1]}"`)
            .join(', ');
          const context = value === '' ? 'No context' : `${value}`;
          metrics[key][context] = true;
        }
      }
    });
  });

  return sortOnKeys(metrics);
}

function getAllContextKeys() {
  const contextKeys = [];

  getState().traceList?.traces.forEach((trace) => {
    trace.series.forEach((series) => {
      series.metric?.traces?.forEach((metricTrace) => {
        if (!!metricTrace?.context) {
          contextKeys.push(...Object.keys(metricTrace?.context ?? {}));
        }
      });
    });
  });

  return _.uniq(contextKeys).sort();
}

function areControlsChanged() {
  return !_.isEqual(
    {
      chart: {
        settings: getState().chart.settings,
      },
      contextFilter: getState().contextFilter,
    },
    initialControls,
  );
}

function getTFSummaryScalars() {
  return getState().runs.data.filter(
    (m) => m.source !== undefined && m.source === 'tf_summary',
  );
}

function isAimRun(run) {
  return run['source'] === undefined;
}

function isTFSummaryScalar(run) {
  return run['source'] === 'tf_summary';
}

function getMetricByHash(hash) {
  for (let i in getState().runs.data) {
    if (getState().runs.data[i].hash === hash) {
      return getState().runs.data[i];
    }
  }
  return null;
}

function getMetricStepValueByStepIdx(data, step) {
  const item = getMetricStepDataByStepIdx(data, step);
  return item ? item[0] : null;
}

function getMetricStepDataByStepIdx(data, step) {
  if (data === null || !data) {
    return null;
  }

  for (let i = 0; i < data.length; i++) {
    if (data[i][1] === step) {
      return data[i];
    } else if (data[i][1] > step) {
      return null;
    }
  }

  return null;
}

function getTraceData(runHash, metricName, context) {
  let matchedRun = null,
    matchedMetric = null,
    matchedTrace = null,
    data = null,
    axisValues = null;

  const isParamMode = isExploreParamsModeEnabled();
  getState().traceList?.traces.forEach((traceModel) => {
    traceModel.series.forEach((series) => {
      const { run, metric, trace } = series;
      if (matchedTrace !== null) return;
      if (
        (isParamMode && run.run_hash === runHash) ||
        (run.run_hash === runHash &&
          metric?.name === metricName &&
          contextToHash(trace?.context) === context)
      ) {
        if (matchedTrace === null) {
          matchedRun = run;
          matchedMetric = metric;
          matchedTrace = trace;
          data = trace?.data ?? [];
          axisValues = trace?.axisValues ?? [];
        }
      }
    });
  });

  return {
    data,
    axisValues,
    run: matchedRun,
    metric: isParamMode ? null : matchedMetric,
    trace: isParamMode ? null : matchedTrace,
  };
}

function contextToHash(context) {
  // FIXME: Change encoding algorithm to base58
  return btoa(JSON.stringify(context)).replace(/[\=\+\/]/g, '');
}

function traceToHash(runHash, metricName, traceContext) {
  if (typeof traceContext !== 'string') {
    traceContext = contextToHash(traceContext);
  }
  // FIXME: Change encoding algorithm to base58
  return btoa(`${runHash}/${metricName}/${traceContext}`).replace(
    /[\=\+\/]/g,
    '',
  );
}

function hashToColor(hash, alpha = 1) {
  const colors = COLORS[getState().colorPalette];
  const index = hash
    .split('')
    .map((c, i) => hash.charCodeAt(i))
    .reduce((a, b) => a + b);
  const color = Color(colors[index % colors.length]).alpha(alpha);
  return color.toString();
}

function getMetricColor(run, metric, trace, index, alpha = 1) {
  // TODO: Add conditional coloring

  if (index === undefined || getState().contextFilter.persist.color) {
    const hash = traceToHash(run?.run_hash, metric?.name, trace?.context);
    return hashToColor(hash, alpha);
  } else {
    const color = Color(
      COLORS[getState().colorPalette][
        index % COLORS[getState().colorPalette].length
      ],
    ).alpha(alpha);
    return color.toString();
  }
}

function getClosestStepData(step, data, axisValues) {
  let stepData;
  let closestStepIndex = null;
  let closestStep = null;

  if (step === null || step === undefined) {
    stepData = null;
  } else {
    let lastStepIndex = axisValues?.length - 1;
    if (data && step > axisValues?.[lastStepIndex]) {
      stepData = data?.[lastStepIndex] ?? null;
      closestStep = axisValues?.[lastStepIndex];
      closestStepIndex = lastStepIndex;
    } else {
      const index = axisValues?.indexOf(step);
      if (index > -1) {
        stepData = data?.[index] ?? null;
        closestStep = step;
        closestStepIndex = index;
      } else {
        closestStep = axisValues?.[0];
        closestStepIndex = 0;
        for (let i = 1; i < axisValues?.length; i++) {
          let current = axisValues[i];
          if (Math.abs(step - current) < Math.abs(step - closestStep)) {
            closestStep = current;
            closestStepIndex = i;
          }
        }

        stepData = data?.[closestStepIndex] ?? null;
      }
    }
  }
  return {
    stepData,
    closestStep,
    closestStepIndex,
  };
}

// custom hook

function useHubMainScreenState(events) {
  const [componentState, setComponentState] = useState(getState());

  useEffect(() => {
    const subscription = subscribe(events, () => {
      setComponentState({
        ...getState(),
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return componentState;
}

export const HubMainScreenModel = {
  events,
  getState,
  resetState,
  subscribe,
  emit,
  useHubMainScreenState,
  emitters: {
    setRecoveredState,
    setRunsState,
    setTraceList,
    setChartSettingsState,
    setHiddenMetrics,
    setChartTooltipOptions,
    setChartPointsCount,
    setChartXAxisAlignment,
    setChartFocusedState,
    setChartFocusedActiveState,
    setContextFilter,
    resetControls,
    setSearchState,
    setSearchInputState,
    setSortFields,
    setSeed,
    togglePersistence,
    setColorPalette,
    setScreenState,
    setRowHeightMode,
    setExcludedFields,
    setColumnsOrder,
    setColumnsWidths,
    setViewKey,
    createApp,
    updateApp,
  },
  helpers: {
    isExploreMetricsModeEnabled,
    isExploreParamsModeEnabled,
    getCountOfSelectedParams,
    getAllParamsPaths,
    getAllContextKeys,
    getAllMetrics,
    areControlsChanged,
    getTFSummaryScalars,
    isAimRun,
    isTFSummaryScalar,
    getMetricByHash,
    getMetricStepValueByStepIdx,
    getMetricStepDataByStepIdx,
    getTraceData,
    contextToHash,
    traceToHash,
    hashToColor,
    getMetricColor,
    getClosestStepData,
  },
};
