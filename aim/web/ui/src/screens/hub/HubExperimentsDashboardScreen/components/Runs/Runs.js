import './Runs.less';

import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import _ from 'lodash';
import Color from 'color';
import moment from 'moment';

import * as storeUtils from '../../../../../storeUtils';
import * as classes from '../../../../../constants/classes';
import UI from '../../../../../ui';
import SearchBar from '../../../../../components/hub/SearchBar/SearchBar';
import {
  HUB_PROJECT_EXPERIMENT,
  EXPLORE,
} from '../../../../../constants/screens';
import { getItem, setItem } from '../../../../../services/storage';
import {
  USER_LAST_SEARCH_QUERY,
  DASHBOARD_SORT_FIELDS,
  TABLE_COLUMNS_WIDTHS,
  TABLE_COLUMNS,
  CONTEXT_TABLE_CONFIG,
} from '../../../../../config';
import ContextTable from '../../../../../components/hub/ContextTable/ContextTable';
import { saveAs } from 'file-saver';

import {
  buildUrl,
  deepEqual,
  interpolateColors,
  formatValue,
  classNames,
  roundValue,
  sortOnKeys,
  flattenObject,
  JSONToCSV,
} from '../../../../../utils';
import QueryParseErrorAlert from '../../../../../components/hub/QueryParseErrorAlert/QueryParseErrorAlert';
import * as analytics from '../../../../../services/analytics';

class Runs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      redirectToPanel: false,
      searchError: null,
      runs: [],
      experiments: [],
      selectedExperiments: [],
      selectedRuns: [],
      coloredCols: {},
      searchFields: {
        metrics: {},
        params: {},
      },
      sortFields: JSON.parse(getItem(DASHBOARD_SORT_FIELDS)) ?? [],
      rowHeightMode:
        JSON.parse(getItem(CONTEXT_TABLE_CONFIG.replace('{name}', 'runs')))
          ?.rowHeightMode ?? 'medium',
      excludedFields:
        JSON.parse(getItem(CONTEXT_TABLE_CONFIG.replace('{name}', 'runs')))
          ?.excludedFields ?? [],
      columnsOrder: JSON.parse(getItem(TABLE_COLUMNS))?.runs ?? {
        left: [],
        middle: [],
        right: [],
      },
      columnsWidths: JSON.parse(getItem(TABLE_COLUMNS_WIDTHS))?.runs ?? {},
    };

    this.paramKeys = {};
    this.metricKeys = {};
    this.firstMetricName = null;
    this.defaultMetricName = 'loss';

    this.searchBarRef = React.createRef();
    this.columns = React.createRef();
  }

  componentDidMount() {
    this.getRuns(this.props.searchQuery, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.searchQuery !== this.props.searchQuery) {
      this.getRuns(this.props.searchQuery, false);
    }

    const deepParamFields = this.getAllParamsPaths(this.state.runs, true, true);
    const paramFields = this.getAllParamsPaths(this.state.runs, false, false);
    let metrics = this.getAllMetrics(this.state.runs);

    if (
      !_.isEqual(
        deepParamFields,
        this.state.searchFields.params.deepParamFields,
      ) ||
      !_.isEqual(metrics, this.state.searchFields.metrics)
    ) {
      this.setState({
        searchFields: {
          params: {
            paramFields,
            deepParamFields,
          },
          metrics,
        },
      });
    }
  }

  setRowHeightMode = (mode) => {
    this.setState({
      rowHeightMode: mode,
    });

    const storageKey = CONTEXT_TABLE_CONFIG.replace('{name}', 'runs');
    setItem(
      storageKey,
      JSON.stringify({
        rowHeightMode: mode,
        excludedFields: this.state.excludedFields,
      }),
    );
  };

  setExcludedFields = (fields) => {
    this.setState({
      excludedFields: fields,
    });

    const storageKey = CONTEXT_TABLE_CONFIG.replace('{name}', 'runs');
    setItem(
      storageKey,
      JSON.stringify({
        rowHeightMode: this.state.rowHeightMode,
        excludedFields: fields,
      }),
    );
  };

  setColumnsOrder = (columnsOrder) => {
    this.setState({ columnsOrder });
    const tableColumns = JSON.parse(getItem(TABLE_COLUMNS)) ?? {};
    tableColumns.runs = columnsOrder;
    setItem(TABLE_COLUMNS, JSON.stringify(tableColumns));
  };

  setColumnsWidths = (columnsWidths) => {
    this.setState({ columnsWidths });
    const tableColumnsWidths = JSON.parse(getItem(TABLE_COLUMNS_WIDTHS)) ?? {};
    tableColumnsWidths.runs = columnsWidths;
    setItem(TABLE_COLUMNS_WIDTHS, JSON.stringify(tableColumnsWidths));
  };

  getRuns = (query, updateURL = true) => {
    analytics.trackEvent('[Dashboard] [Runs] Search runs');
    // window.scrollTo(0, 0);

    this.setState({
      isLoading: true,
    });

    this.props
      .getRunsByQuery(query)
      .then((data) => {
        this.paramKeys = {};
        this.metricKeys = {};
        const experiments = data?.runs.map((run) => run.experiment_name);
        data?.runs.forEach((run) => {
          Object.keys(run.params).forEach((paramKey) => {
            if (paramKey !== '__METRICS__') {
              if (!this.paramKeys.hasOwnProperty(paramKey)) {
                this.paramKeys[paramKey] = [];
              }
              Object.keys(run.params[paramKey]).forEach((key) => {
                if (!this.paramKeys[paramKey].includes(key)) {
                  this.paramKeys[paramKey].push(key);
                }
              });
            } else {
              Object.keys(run.params[paramKey]).forEach((metricName) => {
                if (this.firstMetricName === null) {
                  this.firstMetricName = metricName;
                }
                if (!this.metricKeys.hasOwnProperty(metricName)) {
                  this.metricKeys[metricName] = [];
                }
                run.params[paramKey][metricName].forEach((metricContext) => {
                  const contextDict = {};
                  if (metricContext.context !== null) {
                    metricContext.context.forEach((contextItem) => {
                      contextDict[contextItem[0]] = contextItem[1];
                    });
                  }
                  let contextExists = false;
                  this.metricKeys[metricName].forEach(
                    (existingMetricContext) => {
                      if (deepEqual(existingMetricContext, contextDict)) {
                        contextExists = true;
                      }
                    },
                  );
                  if (!contextExists) {
                    this.metricKeys[metricName].push(contextDict);
                  }
                });
              });
            }
          });
        });

        this.setState((prevState) => {
          let coloredCols = {};
          Object.keys(prevState.coloredCols)
            .filter((key) => !!prevState.coloredCols[key])
            .forEach((prop) => {
              coloredCols[prop] = interpolateColors(
                data.runs.map((run) => _.get(run, JSON.parse(prop))),
              );
            });
          const paramsPaths = this.getAllParamsPaths(data?.runs);
          let possibleSortFields = Object.keys(paramsPaths)
            .map((paramKey) => {
              return paramsPaths[paramKey].map((key) => `${paramKey}.${key}`);
            })
            .flat();
          const metrics = this.getAllMetrics(data?.runs);
          possibleSortFields = possibleSortFields.concat(
            Object.keys(metrics)
              .map((metricKey) => {
                return Object.keys(metrics[metricKey]).map(
                  (key) => `${metricKey} ${key}`,
                );
              })
              .flat(),
          );

          const sortFields = prevState.sortFields.filter((field) => {
            return possibleSortFields.includes(field[0]);
          });

          return {
            runs: data?.runs ? this.orderRuns(data?.runs, sortFields) : [],
            sortFields,
            experiments: _.uniq(experiments),
            selectedRuns: [],
            coloredCols: coloredCols,
            searchError: null,
          };
        });
      })
      .catch((err) => {
        const errorBody = err?.response?.body;
        this.setState({
          runs: [],
          experiments: [],
          searchError: errorBody?.type === 'parse_error' ? errorBody : null,
        });
      })
      .finally(() => {
        this.setState(
          {
            isLoading: false,
          },
          () => {
            this.updateColumnsOrder();
            if (updateURL) {
              this.props.updateURL();
            }
          },
        );
      });
  };

  updateColumnsOrder = () => {
    const tableColumns = this.state.columnsOrder;
    const order = {
      left: [],
      middle: [],
      right: [],
    };
    this.columns.current?.forEach((col) => {
      if (!!tableColumns && tableColumns.left.includes(col.key)) {
        order.left.push(col.key);
      } else if (!!tableColumns && tableColumns.middle.includes(col.key)) {
        order.middle.push(col.key);
      } else if (!!tableColumns && tableColumns.right.includes(col.key)) {
        order.right.push(col.key);
      } else {
        if (col.pin === 'left') {
          order.left.push(col.key);
        } else if (col.pin === 'right') {
          order.right.push(col.key);
        } else {
          order.middle.push(col.key);
        }
      }
    });
    order.left.sort((a, b) => {
      if (!!tableColumns) {
        if (tableColumns.left.indexOf(b) === -1) {
          return -1;
        }
        if (tableColumns.left.indexOf(a) === -1) {
          return 1;
        }
        return tableColumns.left.indexOf(a) - tableColumns.left.indexOf(b);
      }
      return 0;
    });
    order.middle.sort((a, b) => {
      if (!!tableColumns) {
        if (tableColumns.middle.indexOf(b) === -1) {
          return -1;
        }
        if (tableColumns.middle.indexOf(a) === -1) {
          return 1;
        }
        return tableColumns.middle.indexOf(a) - tableColumns.middle.indexOf(b);
      }
      return 0;
    });
    order.right.sort((a, b) => {
      if (!!tableColumns) {
        if (tableColumns.right.indexOf(b) === -1) {
          return -1;
        }
        if (tableColumns.right.indexOf(a) === -1) {
          return 1;
        }
        return tableColumns.right.indexOf(a) - tableColumns.right.indexOf(b);
      }
      return 0;
    });

    this.setColumnsOrder(order);
  };

  handleSearchBarSubmit = (value) => {
    this.getRuns(value);
  };

  searchByExperiment = (experimentName) => {
    this.searchBarRef?.current?.setValue(`experiment == ${experimentName}`);
  };

  searchExperiments = () => {
    const experiments = this.state.selectedExperiments;
    const experimentsRow = experiments.map((e) => `"${e}"`).join(', ');
    const query = `experiment in (${experimentsRow})`;
    this.searchBarRef?.current?.setValue(query);
  };

  exploreExperiments = () => {
    const experiments = this.state.selectedExperiments;
    const experimentsRow = experiments.map((e) => `"${e}"`).join(', ');
    const metricName = this.firstMetricName ?? this.defaultMetricName;
    const query = `${metricName} if experiment in (${experimentsRow})`;
    setItem(USER_LAST_SEARCH_QUERY, query);
    this.setState({
      redirectToPanel: true,
    });
  };

  exploreRuns = () => {
    const runs = this.state.selectedRuns;
    const runsRow = runs.map((e) => `"${e}"`).join(', ');
    const metricName = this.firstMetricName ?? this.defaultMetricName;
    const query = `${metricName} if run.hash in (${runsRow})`;
    setItem(USER_LAST_SEARCH_QUERY, query);
    this.setState({
      redirectToPanel: true,
    });
  };

  exploreMetric = (metricName, context) => {
    const contextQuery = [];
    if (!!context) {
      Object.keys(context).forEach((contextKey) => {
        if (typeof context[contextKey] === 'boolean') {
          contextQuery.push(
            `context.${contextKey} is ${formatValue(
              context[contextKey],
              false,
            )}`,
          );
        } else if (typeof context[contextKey] === 'number') {
          contextQuery.push(`context.${contextKey} == ${context[contextKey]}`);
        } else {
          contextQuery.push(
            `context.${contextKey} == "${context[contextKey]}"`,
          );
        }
      });
    }

    const queryPrefix = this.searchBarRef?.current?.getValue() || null;

    let condition = contextQuery.join(' and ');
    if (!!queryPrefix) {
      if (!!condition) {
        condition = `(${queryPrefix}) and ${condition}`;
      } else {
        condition = queryPrefix;
      }
    }

    const query = !!condition ? `${metricName} if ${condition}` : metricName;
    setItem(USER_LAST_SEARCH_QUERY, query);
    this.setState({
      redirectToPanel: true,
    });
  };

  resetExperiments = () => {
    this.setState({
      selectedExperiments: [],
    });
  };

  resetRuns = () => {
    this.setState({
      selectedRuns: [],
    });
  };

  toggleExperiment = (experimentName) => {
    this.setState((prevState) => {
      let { selectedExperiments } = prevState;

      if (selectedExperiments.indexOf(experimentName) === -1) {
        selectedExperiments.push(experimentName);
      } else {
        selectedExperiments = _.remove(
          selectedExperiments,
          (v) => v !== experimentName,
        );
      }

      return {
        ...prevState,
        selectedExperiments,
      };
    });
  };

  toggleRun = (experimentName, runHash) => {
    this.setState((prevState) => {
      let { selectedRuns } = prevState;

      if (selectedRuns.indexOf(runHash) === -1) {
        selectedRuns.push(runHash);
      } else {
        selectedRuns = _.remove(selectedRuns, (v) => v !== runHash);
      }

      return {
        ...prevState,
        selectedRuns,
      };
    });
  };

  checkAbilityForColoring = (prop) => {
    return (
      this.state.runs
        .map((run) => _.get(run, prop))
        .filter((elem) => typeof elem === 'number').length > 0
    );
  };

  toggleColoring = (prop) => {
    let key = JSON.stringify(prop);
    this.setState((prevState) => ({
      coloredCols: {
        ...prevState.coloredCols,
        [key]: !!prevState.coloredCols[key]
          ? undefined
          : interpolateColors(this.state.runs.map((run) => _.get(run, prop))),
      },
    }));
  };

  getMetricValue = (run, metricName, metricContext) => {
    const metric = run.params?.['__METRICS__']?.[metricName];

    if (metric === undefined || metric === null) {
      return metric;
    }

    let value = null;
    metric.forEach((metricContextItem) => {
      const contextDict = {};
      if (metricContextItem.context !== null) {
        metricContextItem.context.forEach((contextItem) => {
          contextDict[contextItem[0]] = contextItem[1];
        });
      }
      if (deepEqual(contextDict, metricContext)) {
        value = metricContextItem.values.last;
      }
    });

    return value;
  };

  getAllParamsPaths = (runs, deep = true, nested = false) => {
    const paramPaths = {};

    runs.forEach((run) => {
      Object.keys(run.params).forEach((paramKey) => {
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
            for (let key in run.params[paramKey]) {
              if (
                typeof run.params[paramKey][key] === 'object' &&
                run.params[paramKey][key] !== null &&
                !Array.isArray(run.params[paramKey][key])
              ) {
                if (
                  typeof paramPaths[paramKey][key] !== 'object' ||
                  paramPaths[paramKey][key] === null
                ) {
                  paramPaths[paramKey][key] = {};
                }
                paramPaths[paramKey][key] = _.merge(
                  paramPaths[paramKey][key],
                  run.params[paramKey][key],
                );
              } else {
                paramPaths[paramKey][key] = run.params[paramKey][key];
              }
            }
          } else {
            paramPaths[paramKey].push(
              ...Object.keys(flattenObject(run.params[paramKey])),
            );
            paramPaths[paramKey] = _.uniq(paramPaths[paramKey]).sort();
          }
        } else {
          Object.keys(run.params[paramKey]).forEach((key) => {
            if (!paramPaths[paramKey].includes(key)) {
              paramPaths[paramKey].push(key);
              paramPaths[paramKey].sort();
            }
          });
        }
      });
    });

    return sortOnKeys(paramPaths);
  };

  getAllMetrics = (runs) => {
    const metrics = {};
    const paramKey = '__METRICS__';
    runs.forEach((run) => {
      for (let key in run.params?.[paramKey]) {
        if (!metrics.hasOwnProperty(key)) {
          metrics[key] = {};
        }
        for (let i = 0; i < run.params[paramKey][key].length; i++) {
          const value = run.params[paramKey][key][i].context
            .map((metric) => `${metric[0]}="${metric[1]}"`)
            .join(', ');
          const context = value === '' ? 'No context' : `${value}`;
          metrics[key][context] = true;
        }
      }
    });

    return sortOnKeys(metrics);
  };

  setSortFields = (sortFields) => {
    setItem(DASHBOARD_SORT_FIELDS, JSON.stringify(sortFields));
    this.setState((state) => ({
      sortFields,
      runs: this.orderRuns(state.runs, sortFields),
    }));
  };

  orderRuns = (runs, fields) => {
    return _.orderBy(
      runs,
      fields.length === 0
        ? ['date']
        : fields.map(
          (field) =>
            function (run) {
              if (
                field[0].includes('="') ||
                  field[0].includes('No context')
              ) {
                const paramKey = '__METRICS__';
                for (let key in run.params?.[paramKey]) {
                  for (let i = 0; i < run.params[paramKey][key].length; i++) {
                    const value = run.params[paramKey][key][i].context
                      .map((metric) => `${metric[0]}="${metric[1]}"`)
                      .join(', ');
                    const context = value === '' ? 'No context' : `${value}`;
                    if (field[0] === `${key} ${context}`) {
                      let val =
                          run.params[paramKey][key][i].values?.last ??
                          -Infinity;
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
      fields.length === 0 ? ['desc'] : fields.map((field) => field[1]),
    );
  };

  getParamsWithSameValue = (columns) => {
    const columnValues = {};
    this.state.runs.forEach((run) => {
      Object.keys(run.params).forEach((paramKey) => {
        if (paramKey === '__METRICS__') {
          return;
        }
        Object.keys(this.paramKeys).forEach((paramKey) =>
          this.paramKeys[paramKey].forEach((key) => {
            const columnKey = `params.${paramKey}.${key}`;
            if (columns.includes(columnKey)) {
              const value = formatValue(run.params?.[paramKey]?.[key]);
              if (columnValues.hasOwnProperty(columnKey)) {
                if (columnValues[columnKey] !== value) {
                  columnValues[columnKey] = 'aim_values_differ';
                }
              } else {
                columnValues[columnKey] = value;
              }
            }
          }),
        );
      });
    });
    return Object.keys(columnValues).filter(
      (colKey) => columnValues[colKey] !== 'aim_values_differ',
    );
  };

  getRowData = ({ run, paramKeys, metricKeys }) => {
    let row = {
      run: `${run.experiment_name ?? '-'} | ${
        run.date ? moment(run.date * 1000).format('HH:mm · D MMM, YY') : '-'
      }`,
    };

    Object.keys(paramKeys).forEach((paramKey) =>
      paramKeys[paramKey].forEach((key, index) => {
        row[`params.${paramKey}.${key}`] =
          formatValue(run.params?.[paramKey]?.[key]) ?? '-';
      }),
    );

    Object.keys(metricKeys).forEach((metricName) =>
      metricKeys[metricName].forEach((metricContext) => {
        let metricValue = this.getMetricValue(run, metricName, metricContext);

        row[`${metricName}-${JSON.stringify(metricContext)}`] =
          formatValue(
            typeof metricValue === 'number'
              ? roundValue(metricValue)
              : metricValue,
          ) ?? '-';
      }),
    );

    return row;
  };

  exportData = (columns) => () => {
    const { columnsOrder, excludedFields, runs } = this.state;

    const filteredHeader = columns.reduce(
      (acc, column) =>
        acc.concat(excludedFields.indexOf(column.key) === -1 ? column.key : []),
      [],
    );

    const flattenOrders = Object.keys(columnsOrder).reduce(
      (acc, key) => acc.concat(columnsOrder[key]),
      [],
    );

    filteredHeader.sort(
      (a, b) => flattenOrders.indexOf(a) - flattenOrders.indexOf(b),
    );

    const runsDataToExport = runs?.reduce((accArray, run) => {
      const row = this.getRowData({
        run,
        paramKeys: this.paramKeys,
        metricKeys: this.metricKeys,
      });
      const filteredRow = filteredHeader.reduce((acc, column) => {
        if (column.startsWith('params.')) {
          acc[column.replace('params.', '')] = row[column];
        } else {
          const [metricName, metricContext] = column.split('-');
          if (metricContext) {
            const entries = Object.entries(JSON.parse(metricContext) || {});
            if (entries?.length) {
              const [metricContextKey, metricContextValue] = entries[0];
              acc[
                `${metricName} "${metricContextKey}"="${metricContextValue}"`
              ] = row[column];
            } else if (metricName) {
              acc[metricName] = row[column];
            }
          } else {
            acc[column] = row[column];
          }
        }
        return acc;
      }, {});
      accArray.push(filteredRow);
      return accArray;
    }, []);

    const blob = new Blob([JSONToCSV(runsDataToExport)], {
      type: 'text/csv;charset=utf-8;',
    });
    saveAs(blob, `dashboard-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);

    analytics.trackEvent('[Dashboard] [Runs] Export to CSV');
  };

  _renderExperiments = () => {
    if (this.props.isLoading) {
      return (
        <UI.Text className='' type='grey' left>
          Loading..
        </UI.Text>
      );
    }

    const experiments = this.props.project?.branches ?? [];

    if (!experiments || experiments.length === 0) {
      return (
        <UI.Text className='' type='grey' left>
          No experiments
        </UI.Text>
      );
    }

    return (
      <div className='HubExperimentsDashboardScreen__experiments__items'>
        <UI.Menu
          bordered
          outline
          headerElem={
            !!this.state.selectedExperiments?.length ? (
              <div className='HubExperimentsDashboardScreen__experiments__header'>
                <UI.Buttons className='HubExperimentsDashboardScreen__experiments__actions'>
                  <UI.Button
                    type='primary'
                    size='small'
                    onClick={() => this.searchExperiments()}
                    iconLeft={<UI.Icon i='search' />}
                  >
                    Search
                  </UI.Button>
                  <UI.Button
                    type='positive'
                    size='small'
                    onClick={() => this.exploreExperiments()}
                    iconLeft={<UI.Icon i='timeline' />}
                  >
                    Explore
                  </UI.Button>
                  <UI.Button
                    type='secondary'
                    size='small'
                    onClick={() => this.resetExperiments()}
                  >
                    Reset
                  </UI.Button>
                </UI.Buttons>
              </div>
            ) : null
          }
        >
          {experiments.map((exp, i) => (
            <UI.MenuItem
              className='HubExperimentsDashboardScreen__experiments__item'
              key={i}
              onClick={() => this.toggleExperiment(exp)}
              active={this.state.selectedExperiments.indexOf(exp) !== -1}
              activeClass='activeCheck'
            >
              {exp}
            </UI.MenuItem>
          ))}
        </UI.Menu>
      </div>
    );
  };

  _renderRuns = () => {
    if (!this.state.runs || this.state.runs.length === 0) {
      return null;
    }

    this.columns.current = [
      {
        key: 'run',
        content: !!this.state.selectedRuns?.length ? (
          <UI.Buttons className='HubExperimentsDashboardScreen__runs__actions'>
            <UI.Button
              type='positive'
              size='tiny'
              onClick={this.exploreRuns}
              iconLeft={<UI.Icon i='timeline' />}
            >
              Explore
            </UI.Button>
            <UI.Button
              type='secondary'
              size='tiny'
              onClick={() => this.resetRuns()}
            >
              Reset
            </UI.Button>
          </UI.Buttons>
        ) : (
          <UI.Text overline>Runs</UI.Text>
        ),
        pin: 'left',
      },
    ];

    Object.keys(this.metricKeys).forEach((metricName, metricKey) =>
      this.metricKeys[metricName].forEach((metricContext, contextKey) => {
        this.columns.current.push({
          key: `${metricName}-${JSON.stringify(metricContext)}`,
          content: (
            <>
              <div className='HubExperimentsDashboardScreen__runs__context__cell'>
                {!!metricContext &&
                  Object.keys(metricContext).map((metricContextKey) => (
                    <UI.Label
                      key={metricContextKey}
                      size='small'
                      className='HubExperimentsDashboardScreen__runs__context__item'
                    >
                      {metricContextKey}:{' '}
                      {formatValue(metricContext[metricContextKey])}
                    </UI.Label>
                  ))}
                {(metricContext === null ||
                  Object.keys(metricContext).length === 0) && (
                  <UI.Label
                    key={0}
                    size='small'
                    className='HubExperimentsDashboardScreen__runs__context__item'
                  >
                    No context
                  </UI.Label>
                )}
              </div>
              <div className='Table__header__action__container'>
                <UI.Tooltip tooltip='Explore metric'>
                  <div
                    className='Table__header__action'
                    onClick={() =>
                      this.exploreMetric(metricName, metricContext)
                    }
                  >
                    <UI.Icon
                      i='timeline'
                      scale={1.2}
                      className='HubExperimentsDashboardScreen__runs__context__icon'
                    />
                  </div>
                </UI.Tooltip>
                <UI.Tooltip
                  tooltip={
                    !this.checkAbilityForColoring([
                      'params',
                      '__METRICS__',
                      metricName,
                      contextKey,
                      'values',
                      'last',
                    ])
                      ? 'Unable to apply coloring to this column'
                      : !!this.state.coloredCols[
                        JSON.stringify([
                          'params',
                          '__METRICS__',
                          metricName,
                          contextKey,
                          'values',
                          'last',
                        ])
                      ]
                        ? 'Remove coloring'
                        : 'Apply coloring'
                  }
                >
                  <div
                    className={classNames({
                      Table__header__action: true,
                      active:
                        !!this.state.coloredCols[
                          JSON.stringify([
                            'params',
                            '__METRICS__',
                            metricName,
                            contextKey,
                            'values',
                            'last',
                          ])
                        ],
                      disabled: !this.checkAbilityForColoring([
                        'params',
                        '__METRICS__',
                        metricName,
                        contextKey,
                        'values',
                        'last',
                      ]),
                    })}
                    onClick={(evt) =>
                      this.toggleColoring([
                        'params',
                        '__METRICS__',
                        metricName,
                        contextKey,
                        'values',
                        'last',
                      ])
                    }
                  >
                    <UI.Icon
                      i='filter_list'
                      className='Table__header__action__icon'
                    />
                  </div>
                </UI.Tooltip>
              </div>
            </>
          ),
          topHeader: metricName,
          sortableKey: `${metricName} ${
            Object.entries(metricContext ?? {})
              .map((metric) => `${metric[0]}="${metric[1]}"`)
              .join(', ') || 'No context'
          }`,
        });
      }),
    );

    Object.keys(this.paramKeys).forEach((paramKey) =>
      this.paramKeys[paramKey].forEach((key, index) => {
        this.columns.current.push({
          key: `params.${paramKey}.${key}`,
          content: (
            <>
              <UI.Text small>{key}</UI.Text>
              <UI.Tooltip
                tooltip={
                  !this.checkAbilityForColoring(['params', paramKey, key])
                    ? 'Unable to apply coloring to this column'
                    : !!this.state.coloredCols[
                      JSON.stringify(['params', paramKey, key])
                    ]
                      ? 'Remove coloring'
                      : 'Apply coloring'
                }
              >
                <div
                  className={classNames({
                    Table__header__action: true,
                    active:
                      !!this.state.coloredCols[
                        JSON.stringify(['params', paramKey, key])
                      ],
                    disabled: !this.checkAbilityForColoring([
                      'params',
                      paramKey,
                      key,
                    ]),
                  })}
                  onClick={(evt) =>
                    this.toggleColoring(['params', paramKey, key])
                  }
                >
                  <UI.Icon
                    i='filter_list'
                    className='Table__header__action__icon'
                  />
                </div>
              </UI.Tooltip>
            </>
          ),
          topHeader: paramKey,
          sortableKey: `${paramKey}.${key}`,
        });
      }),
    );

    let data = this.state.runs.map((run) => {
      let item = {
        run: {
          content: (
            <Link
              to={buildUrl(HUB_PROJECT_EXPERIMENT, {
                experiment_name: run.experiment_name,
                commit_id: run.run_hash,
              })}
            >
              <UI.Text className='HubExperimentsDashboardScreen__runs__item__name'>
                {run.experiment_name} |{' '}
                {moment(run.date * 1000).format('HH:mm · D MMM, YY')}
              </UI.Text>
            </Link>
          ),
          className: classNames({
            HubExperimentsDashboardScreen__runs__item__cell: true,
            active: this.state.selectedRuns.includes(run.run_hash),
          }),
          props: {
            onClick: () => this.toggleRun(run.experiment_name, run.run_hash),
          },
        },
      };

      Object.keys(this.metricKeys).forEach((metricName, metricKey) =>
        this.metricKeys[metricName].forEach((metricContext, contextKey) => {
          let metricValue = this.getMetricValue(run, metricName, metricContext);
          let color =
            this.state.coloredCols[
              JSON.stringify([
                'params',
                '__METRICS__',
                metricName,
                contextKey,
                'values',
                'last',
              ])
            ]?.[metricValue];
          item[`${metricName}-${JSON.stringify(metricContext)}`] = {
            content: formatValue(
              typeof metricValue === 'number'
                ? roundValue(metricValue)
                : metricValue,
            ),
            style: {
              backgroundColor: color,
              color: !!color && Color(color).isDark() ? '#FFF' : 'var(--grey)',
            },
          };
        }),
      );

      Object.keys(this.paramKeys).forEach((paramKey) =>
        this.paramKeys[paramKey].forEach((key) => {
          let color =
            this.state.coloredCols[JSON.stringify(['params', paramKey, key])]?.[
              run.params?.[paramKey]?.[key]
            ];
          item[`params.${paramKey}.${key}`] = {
            content: formatValue(run.params?.[paramKey]?.[key]),
            style: {
              backgroundColor: color,
              color: !!color && Color(color).isDark() ? '#FFF' : 'var(--grey)',
            },
          };
        }),
      );

      return item;
    });

    return (
      <div className='HubExperimentsDashboardScreen__runs__table__wrapper'>
        <ContextTable
          name='runs'
          topHeader
          columns={this.columns.current}
          data={data}
          searchFields={this.state.searchFields}
          displaySort
          sortFields={this.state.sortFields}
          setSortFields={this.setSortFields}
          rowHeightMode={this.state.rowHeightMode}
          setRowHeightMode={this.setRowHeightMode}
          excludedFields={this.state.excludedFields}
          setExcludedFields={this.setExcludedFields}
          columnsOrder={this.state.columnsOrder}
          setColumnsOrder={this.setColumnsOrder}
          columnsWidths={this.state.columnsWidths}
          setColumnsWidths={this.setColumnsWidths}
          exportData={this.exportData(this.columns.current)}
          getParamsWithSameValue={this.getParamsWithSameValue}
          alwaysVisibleColumns={['run']}
        />
      </div>
    );
  };

  _renderParseErrorAlert = () => {
    return (
      <div className='HubExperimentsDashboardScreen__runs__alert'>
        <QueryParseErrorAlert
          key={this.state.searchError.statement}
          query={this.state.searchError.statement}
          errorOffset={this.state.searchError.location - 1}
        />
      </div>
    );
  };

  _renderNoExperimentsAlert = () => {
    return (
      <div className='HubExperimentsDashboardScreen__runs__alert HubExperimentsDashboardScreen__runs__alert--segment'>
        {!!this.searchBarRef?.current?.getValue() ? (
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
      </div>
    );
  };

  render = () => {
    if (this.state.redirectToPanel) {
      return <Redirect to={EXPLORE} push />;
    }

    return (
      <div className='HubExperimentsDashboardScreen__runs'>
        <div className='HubExperimentsDashboardScreen__runs__body'>
          <div>
            <UI.Text
              className='HubExperimentsDashboardScreen__content__block__title'
              type='primary'
              overline
              bold
            >
              Experiments
            </UI.Text>
          </div>
          <div>
            <UI.Text
              className='HubExperimentsDashboardScreen__content__block__title'
              type='primary'
              overline
              bold
            >
              Runs
            </UI.Text>
          </div>
          <div className='HubExperimentsDashboardScreen__runs__experiments'>
            {this._renderExperiments()}
          </div>
          <div className='HubExperimentsDashboardScreen__runs__content'>
            <div className='HubExperimentsDashboardScreen__runs__content__nav'>
              <SearchBar
                ref={this.searchBarRef}
                initValue={this.props.initSearchQuery}
                placeholder={
                  'e.g. `experiment in (nmt_syntok_dynamic, nmt_syntok_greedy) and hparams.lr >= 0.0001`'
                }
                onSubmit={(value) => this.handleSearchBarSubmit(value)}
                onClear={(value) => this.handleSearchBarSubmit(value)}
              />
            </div>
            {this.state.isLoading ? (
              <UI.Text className='' type='grey' center spacingTop>
                Loading..
              </UI.Text>
            ) : this.state.runs.length ? (
              this._renderRuns()
            ) : (
              <div className=''>
                {!!this.state.searchError && this._renderParseErrorAlert()}
                {this.state.searchError === null &&
                  this._renderNoExperimentsAlert()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
}

export default storeUtils.getWithState(
  classes.HUB_PROJECT_EXPERIMENTS_DASHBOARD_SCREEN,
  Runs,
);
