import './ContextBox.less';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Color from 'color';
import moment from 'moment';
import * as _ from 'lodash';
import ContentLoader from 'react-content-loader';
import { saveAs } from 'file-saver';

import {
  buildUrl,
  classNames,
  sortOnKeys,
  formatValue,
  roundValue,
  getCSSSelectorFromString,
  getObjectValueByPath,
  JSONToCSV,
} from '../../../../../utils';
import UI from '../../../../../ui';
import ContextTable from '../../../../../components/hub/ContextTable/ContextTable';
import { HUB_PROJECT_EXPERIMENT } from '../../../../../constants/screens';
import ColumnGroupPopup from './components/ColumnGroupPopup/ColumnGroupPopup';
import GroupConfigPopup from './components/GroupConfigPopup/GroupConfigPopup';
import { HubMainScreenModel } from '../../models/HubMainScreenModel';
import * as analytics from '../../../../../services/analytics';

function ContextBox(props) {
  let [searchFields, setSearchFields] = useState({
    metrics: {},
    params: {},
  });
  let paramKeys = useRef();
  let tableElemRef = useRef();
  let tableWindowOptions = useRef({
    startIndex: 0,
    endIndex: 100,
  });
  let tableResizeObserver = useRef();
  let tableContainerResizeObserver = useRef();
  let columns = useRef();

  let { runs, traceList, chart, contextFilter, sortFields, table } =
    HubMainScreenModel.useHubMainScreenState([
      HubMainScreenModel.events.SET_RUNS_STATE,
      HubMainScreenModel.events.SET_TRACE_LIST,
      HubMainScreenModel.events.SET_CHART_FOCUSED_ACTIVE_STATE,
      HubMainScreenModel.events.SET_SORT_FIELDS,
      HubMainScreenModel.events.SET_CHART_HIDDEN_METRICS,
      HubMainScreenModel.events.SET_TABLE_ROW_HEIGHT_MODE,
      HubMainScreenModel.events.SET_TABLE_EXCLUDED_FIELDS,
      HubMainScreenModel.events.SET_TABLE_COLUMNS_ORDER,
      HubMainScreenModel.events.SET_TABLE_COLUMNS_WIDTHS,
    ]);

  let {
    setChartFocusedState,
    setChartFocusedActiveState,
    setContextFilter,
    setSortFields,
    setHiddenMetrics,
    setRowHeightMode,
    setExcludedFields,
    setColumnsOrder,
    setColumnsWidths,
  } = HubMainScreenModel.emitters;

  let {
    getTraceData,
    getMetricStepDataByStepIdx,
    contextToHash,
    traceToHash,
    getMetricColor,
    isExploreParamsModeEnabled,
    isExploreMetricsModeEnabled,
    getAllParamsPaths,
    getClosestStepData,
    getAllMetrics,
  } = HubMainScreenModel.helpers;

  function shortenConfigKeys(config) {
    const newConfig = {};
    for (let key in config) {
      newConfig[key.startsWith('params.') ? key.substring(7) : key] =
        config[key];
    }

    return newConfig;
  }

  function calculateWindowOptions(elem) {
    let windowHeight = elem.offsetHeight;
    let scrollTop = elem.scrollTop;

    let runColumn = elem.querySelectorAll('.Table__cell.runColumn');
    let start = null;
    let end = null;
    let startIsSet = false;
    let endIsSet = false;

    if (runColumn.length === 0) {
      start = 0;
      end = 0;
      startIsSet = true;
      endIsSet = true;
    } else {
      runColumn.forEach((runCell) => {
        let cellTop = runCell.offsetTop;
        let rowIndex = +runCell.className
          .match(/rowIndex-\d*/)[0]
          .replace('rowIndex-', '');
        if (cellTop > scrollTop - 30 && !startIsSet) {
          start = rowIndex;
          startIsSet = true;
        }
        if (cellTop < scrollTop + windowHeight) {
          end = rowIndex + 1;
          endIsSet = true;
        }
      });
    }
    if (!startIsSet) {
      start = 0;
    }
    if (!endIsSet) {
      end = 0;
    }
    tableWindowOptions.current = {
      startIndex: start,
      endIndex: end,
    };
  }

  function virtualizedUpdate() {
    calculateWindowOptions(tableElemRef.current);
    window.requestAnimationFrame(updateDynamicColumns);
  }

  function getTableContainerElement(elem) {
    tableElemRef.current = elem;
    calculateWindowOptions(elem);

    tableElemRef.current.addEventListener('scroll', virtualizedUpdate);

    tableResizeObserver.current = new ResizeObserver(virtualizedUpdate);
    tableContainerResizeObserver.current = new ResizeObserver(
      virtualizedUpdate,
    );

    tableContainerResizeObserver.current.observe(elem.querySelector('.Table'));
  }

  function handleRowMove(runHash, metricName, traceContext) {
    const focusedCircle = HubMainScreenModel.getState().chart.focused.circle;
    const focusedMetric = HubMainScreenModel.getState().chart.focused.metric;

    if (focusedCircle.active) {
      return;
    }

    if (
      focusedMetric.runHash === runHash &&
      focusedMetric.metricName === metricName &&
      focusedMetric.traceContext === traceContext
    ) {
      return;
    }
    if (isExploreParamsModeEnabled()) {
      const { runs, traceList } = HubMainScreenModel.getState();
      let param;
      let value;
      let contentType;
      for (let metricKey in runs?.aggMetrics) {
        runs?.aggMetrics[metricKey].forEach((metricContext) => {
          if (value !== undefined) {
            return;
          }
          traceList?.traces.forEach((traceModel) => {
            if (value !== undefined) {
              return;
            }
            _.uniqBy(traceModel.series, 'run.run_hash').forEach((series) => {
              if (series.run.run_hash !== runHash) {
                return;
              }
              let metricValue = series.getAggregatedMetricValue(
                metricKey,
                metricContext,
              );
              if (metricValue !== undefined) {
                value = metricValue;
                param = `metric-${metricKey}-${JSON.stringify(metricContext)}`;
                contentType = 'metric';
                return;
              }
            });
          });
        });
        if (value !== undefined) {
          break;
        }
      }
      if (value === undefined) {
        runs.params.forEach((paramKey) => {
          traceList?.traces.forEach((traceModel) => {
            if (value !== undefined) {
              return;
            }
            _.uniqBy(traceModel.series, 'run.run_hash').forEach((series) => {
              if (series.run.run_hash !== runHash) {
                return;
              }
              let paramValue = getObjectValueByPath(
                series.run.params,
                paramKey,
              );
              if (paramValue !== undefined) {
                value = paramValue;
                param = paramKey;
                contentType = 'param';
                return;
              }
            });
          });
        });
      }

      setChartFocusedState({
        metric: {
          runHash,
          metricName,
          traceContext,
          param,
          contentType,
        },
      });
    } else {
      setChartFocusedState({
        metric: {
          runHash,
          metricName,
          traceContext,
        },
      });
    }
  }

  function handleRowClick(runHash, metricName, traceContext) {
    const focusedCircle = HubMainScreenModel.getState().chart.focused.circle;
    let step = HubMainScreenModel.getState().chart.focused.step;

    if (
      (isExploreParamsModeEnabled() && focusedCircle.runHash === runHash) ||
      (focusedCircle.runHash === runHash &&
        focusedCircle.metricName === metricName &&
        focusedCircle.traceContext === traceContext)
    ) {
      setChartFocusedActiveState({
        step: step || 0,
        circle: {
          active: false,
          runHash: null,
          metricName: null,
          traceContext: null,
          step: null,
        },
      });
      return;
    }

    if (isExploreParamsModeEnabled()) {
      const { runs, traceList } = HubMainScreenModel.getState();
      let param;
      let value;
      let contentType;
      for (let metricKey in runs?.aggMetrics) {
        runs?.aggMetrics[metricKey].forEach((metricContext) => {
          if (value !== undefined) {
            return;
          }
          traceList?.traces.forEach((traceModel) => {
            if (value !== undefined) {
              return;
            }
            _.uniqBy(traceModel.series, 'run.run_hash').forEach((series) => {
              if (series.run.run_hash !== runHash) {
                return;
              }
              let metricValue = series.getAggregatedMetricValue(
                metricKey,
                metricContext,
              );
              if (metricValue !== undefined) {
                value = metricValue;
                param = `metric-${metricKey}-${JSON.stringify(metricContext)}`;
                contentType = 'metric';
                return;
              }
            });
          });
        });
        if (value !== undefined) {
          break;
        }
      }
      if (value === undefined) {
        runs.params.forEach((paramKey) => {
          traceList?.traces.forEach((traceModel) => {
            if (value !== undefined) {
              return;
            }
            _.uniqBy(traceModel.series, 'run.run_hash').forEach((series) => {
              if (series.run.run_hash !== runHash) {
                return;
              }
              let paramValue = getObjectValueByPath(
                series.run.params,
                paramKey,
              );
              if (paramValue !== undefined) {
                value = paramValue;
                param = paramKey;
                contentType = 'param';
                return;
              }
            });
          });
        });
      }
      setChartFocusedActiveState({
        step: step,
        circle: {
          active: true,
          runHash: runHash,
          metricName: null,
          traceContext: null,
          param,
          contentType,
        },
        metric: {
          runHash: null,
          metricName: null,
          traceContext: null,
        },
      });
    } else {
      const line = getTraceData(runHash, metricName, traceContext);
      if (line === null || line.data === null || !line.data.length) {
        return;
      }

      if (step === null) {
        step = line?.axisValues?.[line?.axisValues?.length - 1];
      } else {
        step = getClosestStepData(
          step,
          line?.data,
          line?.axisValues,
        ).closestStep;
      }

      setChartFocusedActiveState({
        step: step,
        circle: {
          active: true,
          runHash: runHash,
          metricName: metricName,
          traceContext: traceContext,
          step: step,
        },
        metric: {
          runHash: null,
          metricName: null,
          traceContext: null,
        },
      });
    }
  }

  function getParamsWithSameValue(columns) {
    const columnValues = {};
    traceList?.traces.forEach((trace) => {
      trace.series.forEach((series) => {
        const { run } = series;
        Object.keys(paramKeys.current).forEach((paramKey) =>
          paramKeys.current[paramKey].forEach((key) => {
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
  }

  function getRowData({ series, chart, runs, paramKeys }) {
    const { run, metric, trace } = series;
    const contextHash = contextToHash(trace?.context);

    const line = getTraceData(run.run_hash, metric?.name, contextHash);

    const step = chart.focused.circle.active
      ? chart.focused.circle.step
      : chart.focused.step;

    let { stepData } = getClosestStepData(step, line?.data, line?.axisValues);

    let row = {
      experiment: run.experiment_name ?? '-',
      run: run.date ? moment.unix(run.date).format('HH:mm · D MMM, YY') : '-',
    };

    if (isExploreMetricsModeEnabled()) {
      Object.assign(row, {
        metric: metric?.name ?? '-',
        context: (() => {
          const [key, value] =
            trace?.context && Object.keys(trace.context).length
              ? Object.entries(trace.context)[0]
              : [];
          return trace?.context && key && value ? `"${key}"="${value}"` : '-';
        })(),
        value:
          stepData !== null && stepData[0] !== null
            ? roundValue(stepData[0])
            : '-',
        step: stepData !== null && stepData[1] !== null ? stepData[1] : '-',
        epoch: stepData !== null && stepData[2] !== null ? stepData[2] : '-',
        time:
          stepData !== null && stepData[3] !== null
            ? moment.unix(stepData[3]).format('HH:mm:ss · D MMM, YY')
            : '-',
      });
    }

    for (let metricKey in runs?.aggMetrics) {
      runs?.aggMetrics[metricKey].forEach((metricContext) => {
        row[`${metricKey}-${JSON.stringify(metricContext)}`] = formatValue(
          series.getAggregatedMetricValue(metricKey, metricContext),
          true,
        );
      });
    }

    Object.keys(paramKeys).forEach((paramKey) =>
      paramKeys[paramKey].forEach((key) => {
        row[`params.${paramKey}.${key}`] = formatValue(
          run.params?.[paramKey]?.[key],
        );
      }),
    );

    return row;
  }

  const exportData =
    ({ columns, excludedFields, columnsOrder }) =>
      () => {
        const filteredHeader = columns.reduce(
          (acc, column) =>
            acc.concat(
              excludedFields.indexOf(column.key) === -1 ? column.key : [],
            ),
          [],
        );

        const flattenOrders = Object.keys(columnsOrder).reduce(
          (acc, key) => acc.concat(columnsOrder[key]),
          [],
        );

        filteredHeader.sort(
          (a, b) => flattenOrders.indexOf(a) - flattenOrders.indexOf(b),
        );

        const traceDataToExport = traceList?.traces.reduce(
          (accArray, traceModel, traceModelIndex) => {
            (isExploreParamsModeEnabled()
              ? _.uniqBy(traceModel.series, 'run.run_hash')
              : traceModel.series
            ).forEach((series) => {
              const row = getRowData({
                series,
                chart,
                runs,
                paramKeys: paramKeys.current,
              });
              const filteredRow = filteredHeader.reduce((acc, column) => {
                if (column.startsWith('params.')) {
                  acc[column.replace('params.', '')] = row[column];
                } else {
                  const [metricName, metricContext] = column.split('-');
                  if (metricContext) {
                    const entries = Object.entries(
                      JSON.parse(metricContext) || {},
                    );
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
            });

            if (traceList?.traces.length - 1 !== traceModelIndex) {
              let emptyRow = {};
              filteredHeader.forEach((column) => {
                emptyRow[column] = '--';
              });
              accArray.push(emptyRow);
            }
            return accArray;
          },
          [],
        );

        const blob = new Blob([JSONToCSV(traceDataToExport)], {
          type: 'text/csv;charset=utf-8;',
        });

        saveAs(blob, `explore-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
        analytics.trackEvent('[Explore] Export to CSV');
      };

  function _renderContentLoader() {
    const cellHeight = 25,
      cellWidth = 35,
      marginX = 25,
      marginY = 20;
    const colsTemplates = [
      [1, 3, 1, 1, 1],
      [3, 3, 5, 1, 1, 7, 2, 2, 1, 1],
    ];

    return (
      <div className='ContextBox__loader__wrapper'>
        <ContentLoader
          width={1200}
          height={250}
          backgroundColor='#F3F3F3'
          foregroundColor='#ECEBEB'
        >
          {[
            [-1, 0],
            [-1, 1],
            [-3, 1],
            [-1, 1],
            [-3, 1],
          ].map((rowMeta, rowIdx) => (
            <Fragment key={rowIdx}>
              {colsTemplates[rowMeta[1]]
                .slice(0, rowMeta[0])
                .map((colSize, colIdx) => (
                  <rect
                    key={`${rowIdx}-${colIdx}`}
                    x={
                      colIdx
                        ? colsTemplates[rowMeta[1]]
                          .slice(0, colIdx)
                          .reduce((a, b) => a + b) *
                            cellWidth +
                          (colIdx + 1) * marginX
                        : marginX
                    }
                    y={rowIdx * (cellHeight + marginY) + marginY}
                    rx={5}
                    ry={5}
                    width={colSize * cellWidth}
                    height={cellHeight}
                  />
                ))}
            </Fragment>
          ))}
        </ContentLoader>
      </div>
    );
  }

  function _renderContent() {
    if (runs.isEmpty || !runs.data.length) {
      return <div className='ContextBox__empty__wrapper' />;
    }

    paramKeys.current = {};

    traceList?.traces.forEach((trace) => {
      trace.series.forEach((series) => {
        Object.keys(series?.run.params).forEach((paramKey) => {
          if (paramKey !== '__METRICS__') {
            if (!paramKeys.current.hasOwnProperty(paramKey)) {
              paramKeys.current[paramKey] = [];
            }
            Object.keys(series?.run.params[paramKey]).forEach((key) => {
              if (!paramKeys.current[paramKey].includes(key)) {
                paramKeys.current[paramKey].push(key);
              }
            });
          }
        });
      });
    });

    paramKeys.current = sortOnKeys(paramKeys.current);

    columns.current = [
      {
        key: 'experiment',
        content: (
          <>
            <UI.Text overline>Experiment</UI.Text>
            <ColumnGroupPopup
              param='experiment'
              contextFilter={contextFilter}
              setContextFilter={setContextFilter}
            />
          </>
        ),
        topHeader: 'Metrics',
        pin: 'left',
      },
      {
        key: 'run',
        content: (
          <>
            <UI.Text overline>Run</UI.Text>
            <ColumnGroupPopup
              param='run.hash'
              contextFilter={contextFilter}
              setContextFilter={setContextFilter}
            />
          </>
        ),
        topHeader: 'Metrics',
      },
    ];

    if (isExploreMetricsModeEnabled()) {
      columns.current = columns.current.concat([
        {
          key: 'metric',
          content: (
            <>
              <UI.Text overline>Metric</UI.Text>
              <ColumnGroupPopup
                param='metric'
                contextFilter={contextFilter}
                setContextFilter={setContextFilter}
              />
            </>
          ),
          topHeader: 'Metrics',
        },
        {
          key: 'context',
          content: <UI.Text overline>Context</UI.Text>,
          topHeader: 'Metrics',
        },
        {
          key: 'value',
          content: <UI.Text overline>Value</UI.Text>,
          topHeader: 'Metrics',
        },
        {
          key: 'step',
          content: <UI.Text overline>Step</UI.Text>,
          topHeader: 'Metrics',
        },
        {
          key: 'epoch',
          content: <UI.Text overline>Epoch</UI.Text>,
          topHeader: 'Metrics',
        },
        {
          key: 'time',
          content: <UI.Text overline>Time</UI.Text>,
          topHeader: 'Metrics',
        },
      ]);
    }

    for (let metricKey in runs?.aggMetrics) {
      runs?.aggMetrics[metricKey].forEach((metricContext) => {
        columns.current.push({
          key: `${metricKey}-${JSON.stringify(metricContext)}`,
          content: (
            <div className='ContextBox__table__agg-metrics__labels'>
              {metricContext === null ||
              Object.keys(metricContext).length === 0 ? (
                  <UI.Label
                    key={0}
                    size='small'
                    className='ContextBox__table__agg-metrics__label'
                  >
                  No context
                  </UI.Label>
                ) : (
                  Object.keys(metricContext).map((metricContextKey) => (
                    <UI.Label
                      key={metricContextKey}
                      size='small'
                      className='ContextBox__table__agg-metrics__label'
                    >
                      {metricContextKey}:{' '}
                      {formatValue(metricContext[metricContextKey])}
                    </UI.Label>
                  ))
                )}
            </div>
          ),
          topHeader: metricKey,
          sortableKey: `${metricKey} ${
            Object.entries(metricContext ?? {})
              .map((metric) => `${metric[0]}="${metric[1]}"`)
              .join(', ') || 'No context'
          }`,
        });
      });
    }

    Object.keys(paramKeys.current).forEach((paramKey) =>
      paramKeys.current[paramKey].sort().forEach((key) => {
        const param = `params.${paramKey}.${key}`;
        columns.current.push({
          key: param,
          content: (
            <>
              <UI.Text small>{key}</UI.Text>
              <ColumnGroupPopup
                param={param}
                contextFilter={contextFilter}
                setContextFilter={setContextFilter}
              />
            </>
          ),
          topHeader: paramKey,
          sortableKey: `${paramKey}.${key}`,
        });
      }),
    );

    const data = traceList?.traces.length > 1 ? {} : [];
    const expanded = {};
    const step = chart.focused.circle.active
      ? chart.focused.circle.step
      : chart.focused.step;
    const focusedCircle = chart.focused.circle;
    const focusedMetric = chart.focused.metric;
    let runIndex = 0;

    traceList?.traces.forEach((traceModel, traceModelIndex) => {
      (isExploreParamsModeEnabled()
        ? _.uniqBy(traceModel.series, 'run.run_hash')
        : traceModel.series
      ).forEach((series) => {
        const { run, metric, trace } = series;
        const contextHash = contextToHash(trace?.context);

        const line = getTraceData(run.run_hash, metric?.name, contextHash);

        let { stepData } = getClosestStepData(
          step,
          line?.data,
          line?.axisValues,
        );

        const color =
          traceList?.grouping?.color?.length > 0
            ? traceModel.color
            : getMetricColor(
              run,
              isExploreParamsModeEnabled() ? null : line?.metric,
              isExploreParamsModeEnabled() ? null : line?.trace,
              runIndex,
            );
        const colorObj = Color(color);

        runIndex++;

        let active = false;

        if (
          (isExploreParamsModeEnabled() &&
            (focusedCircle.runHash === run.run_hash ||
              focusedMetric.runHash === run.run_hash)) ||
          (focusedCircle.runHash === run.run_hash &&
            focusedCircle.metricName === metric?.name &&
            focusedCircle.traceContext === contextHash) ||
          (focusedMetric.runHash === run.run_hash &&
            focusedMetric.metricName === metric?.name &&
            focusedMetric.traceContext === contextHash)
        ) {
          active = true;
        }

        if (
          (isExploreParamsModeEnabled() &&
            focusedCircle.runHash === run.run_hash) ||
          (focusedCircle.runHash === run.run_hash &&
            focusedCircle.metricName === metric?.name &&
            focusedCircle.traceContext === contextHash)
        ) {
          expanded[JSON.stringify(traceModel.config)] = true;
        }

        const metricKey = `${run.run_hash}/${metric?.name}/${contextHash}`;

        const cellClassName = classNames({
          ContextBox__table__cell: true,
          active: active,
          metricIsHidden: run.metricIsHidden,
          [`rowIndex-${runIndex - 1}`]: true,
          [`cell-${traceToHash(
            run.run_hash,
            isExploreParamsModeEnabled() ? null : metric?.name,
            isExploreParamsModeEnabled() ? null : contextHash,
          )}`]: true,
        });

        const row = {
          rowMeta: (
            <>
              <div
                className={classNames({
                  'ContextBox__table__visibility-indicator': true,
                  metricIsHidden: run.metricIsHidden,
                })}
                onClick={(evt) => {
                  evt.stopPropagation();
                  setHiddenMetrics(metricKey);
                }}
              >
                <UI.Icon
                  i={`visibility${run.metricIsHidden ? '_off' : ''}`}
                  scale={1.4}
                />
              </div>
              <UI.Tooltip tooltip='Metric Color'>
                <div
                  className='ContextBox__table__metric-indicator__color'
                  style={{
                    backgroundColor: colorObj.hsl().string(),
                    borderColor: colorObj.hsl().string(),
                  }}
                />
              </UI.Tooltip>
            </>
          ),
          experiment: {
            content: run.experiment_name,
            className: `metric ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: () =>
                  handleRowClick(run.run_hash, metric?.name, contextHash),
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
          run: {
            content: (
              <Link
                className='ContextBox__table__item__name'
                to={buildUrl(HUB_PROJECT_EXPERIMENT, {
                  experiment_name: run.experiment_name,
                  commit_id: run.run_hash,
                })}
              >
                {moment.unix(run.date).format('HH:mm · D MMM, YY')}
              </Link>
            ),
            className: `metric runColumn ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: (evt) => {
                  if (evt.target === evt.currentTarget) {
                    handleRowClick(run.run_hash, metric?.name, contextHash);
                  }
                },
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
          metric: {
            content: metric?.name ?? '-',
            className: `metric ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: () =>
                  handleRowClick(run.run_hash, metric?.name, contextHash),
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
          context: {
            content: !!trace?.context ? (
              <div className='ContextBox__table__item-context__wrapper'>
                {Object.keys(trace.context).map((contextCat, contextCatKey) => (
                  <ColumnGroupPopup
                    key={contextCatKey}
                    param={`context.${contextCat}`}
                    triggerer={
                      <UI.Button
                        className='ContextBox__table__item-context__item'
                        size='small'
                        type='primary'
                        ghost={true}
                      >
                        <UI.Text inline>
                          {contextCat}=
                          {formatValue(trace.context?.[contextCat])}
                        </UI.Text>
                      </UI.Button>
                    }
                    contextFilter={contextFilter}
                    setContextFilter={setContextFilter}
                  />
                ))}
              </div>
            ) : (
              '-'
            ),
            className: `metric ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: () =>
                  handleRowClick(run.run_hash, metric?.name, contextHash),
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
          value: {
            content:
              stepData !== null && stepData[0] !== null
                ? roundValue(stepData[0])
                : '-',
            className: `value-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: () =>
                  handleRowClick(run.run_hash, metric?.name, contextHash),
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
          step: {
            content:
              stepData !== null && stepData[1] !== null ? stepData[1] : '-',
            className: `step-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: () =>
                  handleRowClick(run.run_hash, metric?.name, contextHash),
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
          epoch: {
            content:
              stepData !== null && stepData[2] !== null ? stepData[2] : '-',
            className: `epoch-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: () =>
                  handleRowClick(run.run_hash, metric?.name, contextHash),
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
          time: {
            content:
              stepData !== null && stepData[3] !== null
                ? moment.unix(stepData[3]).format('HH:mm:ss · D MMM, YY')
                : '-',
            className: `time-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} ${cellClassName}`,
            props: run.metricIsHidden
              ? {}
              : {
                onClick: () =>
                  handleRowClick(run.run_hash, metric?.name, contextHash),
                onMouseMove: () =>
                  handleRowMove(run.run_hash, metric?.name, contextHash),
              },
          },
        };

        for (let metricKey in runs?.aggMetrics) {
          runs?.aggMetrics[metricKey].forEach((metricContext) => {
            row[`${metricKey}-${JSON.stringify(metricContext)}`] = {
              content: formatValue(
                series.getAggregatedMetricValue(metricKey, metricContext),
                true,
              ),
              className: cellClassName,
              props: run.metricIsHidden
                ? {}
                : {
                  onClick: () =>
                    handleRowClick(run.run_hash, metric?.name, contextHash),
                  onMouseMove: () =>
                    handleRowMove(run.run_hash, metric?.name, contextHash),
                },
            };
          });
        }

        Object.keys(paramKeys.current).forEach((paramKey) =>
          paramKeys.current[paramKey].forEach((key) => {
            row[`params.${paramKey}.${key}`] = {
              content: formatValue(run.params?.[paramKey]?.[key]),
              className: cellClassName,
              props: run.metricIsHidden
                ? {}
                : {
                  onClick: () =>
                    handleRowClick(run.run_hash, metric?.name, contextHash),
                  onMouseMove: () =>
                    handleRowMove(run.run_hash, metric?.name, contextHash),
                },
            };
          }),
        );

        if (traceList?.traces.length > 1) {
          if (!data[JSON.stringify(traceModel.config)]) {
            const aggregatedArea = contextFilter.aggregatedArea;
            const aggregatedLine = contextFilter.aggregatedLine;
            let aggAreaMin;
            let aggAreaMax;
            let aggLine;
            let aggLineLabel;

            if (isExploreMetricsModeEnabled()) {
              switch (aggregatedArea) {
                case 'std_dev':
                  aggAreaMin = getMetricStepDataByStepIdx(
                    traceModel.aggregation.stdDevMin?.trace.data,
                    step,
                  )?.[0];
                  aggAreaMax = getMetricStepDataByStepIdx(
                    traceModel.aggregation.stdDevMax?.trace.data,
                    step,
                  )?.[0];
                  break;
                case 'std_err':
                  aggAreaMin = getMetricStepDataByStepIdx(
                    traceModel.aggregation.stdErrMin?.trace.data,
                    step,
                  )?.[0];
                case 'conf_int':
                  aggAreaMin = getMetricStepDataByStepIdx(
                    traceModel.aggregation.confIntMin?.trace.data,
                    step,
                  )?.[0];
                  aggAreaMax = getMetricStepDataByStepIdx(
                    traceModel.aggregation.confIntMax?.trace.data,
                    step,
                  )?.[0];
                  break;
                default:
                  aggAreaMin = getMetricStepDataByStepIdx(
                    traceModel.aggregation.min?.trace.data,
                    step,
                  )?.[0];
                  aggAreaMax = getMetricStepDataByStepIdx(
                    traceModel.aggregation.max?.trace.data,
                    step,
                  )?.[0];
              }

              switch (aggregatedLine) {
                case 'min':
                  aggLine = getMetricStepDataByStepIdx(
                    traceModel.aggregation.min?.trace.data,
                    step,
                  )?.[0];
                  aggLineLabel = 'min';
                  break;
                case 'max':
                  aggLine = getMetricStepDataByStepIdx(
                    traceModel.aggregation.max?.trace.data,
                    step,
                  )?.[0];
                  aggLineLabel = 'max';
                  break;
                case 'avg':
                  aggLine = getMetricStepDataByStepIdx(
                    traceModel.aggregation.avg?.trace.data,
                    step,
                  )?.[0];
                  aggLineLabel = 'mean';
                  break;
                case 'median':
                  aggLine = getMetricStepDataByStepIdx(
                    traceModel.aggregation.med?.trace.data,
                    step,
                  )?.[0];
                  aggLineLabel = 'median';
                  break;
              }
            }

            const runsCount = _.uniqBy(
              traceModel.series,
              'run.run_hash',
            ).length;
            data[JSON.stringify(traceModel.config)] = {
              items: [],
              data: {
                experiment: {
                  content:
                    traceModel.experiments.length === 1 ? (
                      <UI.Text>{traceModel.experiments[0]}</UI.Text>
                    ) : (
                      <UI.Tooltip tooltip={traceModel.experiments.join(', ')}>
                        <UI.Label
                          className='ContextBox__table__item-aggregated_label'
                          outline
                        >
                          {traceModel.experiments.length} experiments
                        </UI.Label>
                      </UI.Tooltip>
                    ),
                },
                run: {
                  content: (
                    <UI.Label
                      className='ContextBox__table__item-aggregated_label'
                      outline
                    >
                      {runsCount} run{runsCount > 1 ? 's' : ''}
                    </UI.Label>
                  ),
                },
                metric: {
                  content:
                    traceModel.metrics.length === 1 ? (
                      <UI.Text>{traceModel.metrics[0]}</UI.Text>
                    ) : (
                      <UI.Tooltip tooltip={traceModel.metrics.join(', ')}>
                        <UI.Label
                          className='ContextBox__table__item-aggregated_label'
                          outline
                        >
                          {traceModel.metrics.length} metrics
                        </UI.Label>
                      </UI.Tooltip>
                    ),
                },
                context: {
                  content: (
                    <div className='ContextBox__table__item-aggregated_labels'>
                      {!!traceModel.contexts?.length ? (
                        <UI.Label
                          className='ContextBox__table__item-aggregated_label'
                          outline
                        >
                          {traceModel.contexts[0]}
                        </UI.Label>
                      ) : (
                        '-'
                      )}
                      {traceModel.contexts?.length > 1 && (
                        <UI.Label
                          className='ContextBox__table__item-aggregated_label'
                          outline
                          rounded
                        >
                          <UI.Tooltip
                            tooltip={traceModel.contexts.slice(1).join(', ')}
                          >
                            +{traceModel.contexts.length - 1}
                          </UI.Tooltip>
                        </UI.Label>
                      )}
                    </div>
                  ),
                },
                value: {
                  content: (
                    <div className='ContextBox__table__item-aggregated_labels'>
                      <UI.Label
                        className='ContextBox__table__item-aggregated_label'
                        iconLeft={<div>area</div>}
                        outline
                        rounded
                      >
                        <span className='ContextBox__table__item-aggregated_label_item min'>
                          {aggAreaMin !== null && aggAreaMin !== undefined
                            ? roundValue(aggAreaMin)
                            : '-'}
                        </span>
                        {':'}
                        <span className='ContextBox__table__item-aggregated_label_item max'>
                          {aggAreaMax !== null && aggAreaMax !== undefined
                            ? roundValue(aggAreaMax)
                            : '-'}
                        </span>
                      </UI.Label>
                      <UI.Label
                        className='ContextBox__table__item-aggregated_label aggLine'
                        iconLeft={aggLineLabel}
                        outline
                        rounded
                      >
                        {aggLine !== null && aggLine !== undefined
                          ? roundValue(aggLine)
                          : '-'}
                      </UI.Label>
                    </div>
                  ),
                  className: `value-${getCSSSelectorFromString(
                    `${JSON.stringify(traceModel.config)}_${traceModelIndex}`,
                  )}`,
                },
              },
              config: (
                <>
                  <GroupConfigPopup
                    config={shortenConfigKeys(traceModel.config)}
                    rowsCount={traceModel.series.length}
                  />
                  {traceList?.grouping?.chart?.length > 0 && (
                    <UI.Tooltip tooltip='Group Chart ID'>
                      <div className='ContextBox__table__group-indicator__chart'>
                        {traceModel.chart + 1}
                      </div>
                    </UI.Tooltip>
                  )}
                  {traceList?.grouping?.color?.length > 0 && (
                    <UI.Tooltip tooltip='Group Color'>
                      <div
                        className='ContextBox__table__group-indicator__color'
                        style={{
                          backgroundColor: traceModel.color,
                          borderColor: traceModel.color,
                        }}
                      />
                    </UI.Tooltip>
                  )}
                  {traceList?.grouping?.stroke?.length > 0 && (
                    <UI.Tooltip tooltip='Group Stroke Style'>
                      <svg
                        className='ContextBox__table__group-indicator__stroke'
                        style={{
                          borderColor:
                            traceList?.grouping?.color?.length > 0
                              ? traceModel.color
                              : '#3b5896',
                        }}
                      >
                        <line
                          x1='0'
                          y1='50%'
                          x2='100%'
                          y2='50%'
                          style={{
                            strokeDasharray: traceModel.stroke
                              .split(' ')
                              .map((elem) => (elem / 5) * 3)
                              .join(' '),
                          }}
                        />
                      </svg>
                    </UI.Tooltip>
                  )}
                </>
              ),
              meta: shortenConfigKeys(traceModel.config),
            };

            let stepValue;
            let epochValue;
            for (let i = 0; i < traceModel.series.length; i++) {
              const series = traceModel.series[i];
              let { stepData } = getClosestStepData(
                step,
                series?.trace?.data,
                series?.trace?.axisValues,
              );
              if (i === 0) {
                stepValue = stepData?.[1];
                epochValue = stepData?.[2];
              } else {
                if (stepValue !== stepData?.[1]) {
                  stepValue = undefined;
                }
                if (epochValue !== stepData?.[2]) {
                  epochValue = undefined;
                }
              }
            }

            const groupConfigKey = getCSSSelectorFromString(
              `${JSON.stringify(traceModel.config)}_${traceModelIndex}`,
            );

            data[JSON.stringify(traceModel.config)].data.step = {
              content: stepValue ?? '-',
              className: `step-${groupConfigKey}`,
            };

            data[JSON.stringify(traceModel.config)].data.epoch = {
              content: epochValue ?? '-',
              className: `epoch-${groupConfigKey}`,
            };

            for (let metricKey in runs?.aggMetrics) {
              runs?.aggMetrics[metricKey].forEach((metricContext) => {
                const { min, avg, med, max } =
                  traceModel.getAggregatedMetricMinMax(
                    metricKey,
                    metricContext,
                  );
                data[JSON.stringify(traceModel.config)].data[
                  `${metricKey}-${JSON.stringify(metricContext)}`
                ] = {
                  content: (
                    <div className='ContextBox__table__item-aggregated_labels'>
                      <UI.Label
                        className='ContextBox__table__item-aggregated_label min'
                        iconLeft='min'
                        outline
                        rounded
                      >
                        {min !== null && min !== undefined
                          ? roundValue(min)
                          : '-'}
                      </UI.Label>
                      {aggregatedLine === 'avg' && (
                        <UI.Label
                          className='ContextBox__table__item-aggregated_label avg'
                          iconLeft='mean'
                          outline
                          rounded
                        >
                          {avg !== null && avg !== undefined
                            ? roundValue(avg)
                            : '-'}
                        </UI.Label>
                      )}
                      {aggregatedLine === 'median' && (
                        <UI.Label
                          className='ContextBox__table__item-aggregated_label avg'
                          iconLeft='median'
                          outline
                          rounded
                        >
                          {med !== null && med !== undefined
                            ? roundValue(med)
                            : '-'}
                        </UI.Label>
                      )}
                      <UI.Label
                        className='ContextBox__table__item-aggregated_label max'
                        iconLeft='max'
                        outline
                        rounded
                      >
                        {max !== null && max !== undefined
                          ? roundValue(max)
                          : '-'}
                      </UI.Label>
                    </div>
                  ),
                };
              });
            }

            Object.keys(paramKeys.current).forEach((paramKey) =>
              paramKeys.current[paramKey].forEach((key) => {
                const param = `params.${paramKey}.${key}`;
                if (traceModel.config.hasOwnProperty(param)) {
                  data[JSON.stringify(traceModel.config)].data[param] =
                    formatValue(traceModel.config[param]);
                } else {
                  let values = [];
                  for (let i = 0; i < traceModel.series.length; i++) {
                    const series = traceModel.series[i];
                    const value = formatValue(_.get(series, param));
                    if (!values.includes(value)) {
                      values.push(value);
                    }
                  }
                  data[JSON.stringify(traceModel.config)].data[param] = {
                    content:
                      values.length === 1 ? (
                        values[0]
                      ) : (
                        <UI.Tooltip tooltip={values.join(', ')}>
                          <UI.Label
                            className='ContextBox__table__item-aggregated_label'
                            outline
                          >
                            {values.length} values
                          </UI.Label>
                        </UI.Tooltip>
                      ),
                  };
                }
              }),
            );
          }
          data[JSON.stringify(traceModel.config)].items.push(row);
        } else {
          data.push(row);
        }
      });
    });

    return (
      <div
        className={classNames({
          ContextBox__content: true,
          resizing: props.resizing,
        })}
      >
        <div className='ContextBox__table__wrapper'>
          <ContextTable
            name='context'
            topHeader
            columns={columns.current}
            data={data}
            groups={traceList?.traces.length > 1}
            expanded={expanded}
            searchFields={searchFields}
            displayViewModes
            viewMode={props.viewMode}
            setViewMode={props.setViewMode}
            displaySort
            sortFields={sortFields}
            setSortFields={setSortFields}
            setHiddenMetrics={setHiddenMetrics}
            hiddenMetrics={chart.hiddenMetrics}
            rowHeightMode={table.rowHeightMode}
            setRowHeightMode={setRowHeightMode}
            excludedFields={table.excludedFields}
            setExcludedFields={setExcludedFields}
            columnsOrder={table.columnsOrder}
            setColumnsOrder={setColumnsOrder}
            columnsWidths={table.columnsWidths}
            setColumnsWidths={setColumnsWidths}
            exportData={exportData({
              columns: columns.current,
              excludedFields: table.excludedFields,
              columnsOrder: table.columnsOrder,
            })}
            getParamsWithSameValue={getParamsWithSameValue}
            alwaysVisibleColumns={[
              'experiment',
              'run',
              'metric',
              'context',
              'value',
              'step',
              'epoch',
              'time',
            ]}
            getTableContainerElement={getTableContainerElement}
          />
        </div>
      </div>
    );
  }

  function updateDynamicColumns() {
    const { traceList, chart, contextFilter } = HubMainScreenModel.getState();
    const { startIndex, endIndex } = tableWindowOptions.current;

    const step = chart.focused.step;
    const focusedCircle = chart.focused.circle;
    const focusedMetric = chart.focused.metric;

    let groupStepData = {};
    let groupEpochData = {};

    const currentActiveRow = document.querySelectorAll(
      '.ContextBox__table__cell.active',
    );
    currentActiveRow?.forEach((cell) => {
      cell.classList.remove('active');
    });
    let runIndex = 0;
    traceList?.traces.forEach((traceModel, traceModelIndex) => {
      const groupSelector = getCSSSelectorFromString(
        `${JSON.stringify(traceModel.config)}_${traceModelIndex}`,
      );
      (isExploreParamsModeEnabled()
        ? _.uniqBy(traceModel.series, 'run.run_hash')
        : traceModel.series
      ).forEach((series) => {
        if (runIndex < startIndex || runIndex > endIndex) {
          runIndex++;
          return;
        }

        const { run, metric, trace } = series;
        const contextHash = contextToHash(trace?.context);

        const line = getTraceData(run.run_hash, metric?.name, contextHash);

        let { stepData } = getClosestStepData(
          step,
          line?.data,
          line?.axisValues,
        );

        if (stepData !== null && stepData[1] !== null) {
          if (!groupStepData.hasOwnProperty(groupSelector)) {
            groupStepData[groupSelector] = stepData[1];
            groupEpochData[groupSelector] = stepData[2];
          } else {
            if (groupStepData[groupSelector] !== stepData[1]) {
              groupStepData[groupSelector] = undefined;
              groupEpochData[groupSelector] = undefined;
            }
          }
        }

        let active = false;

        if (
          (isExploreParamsModeEnabled() &&
            (focusedCircle.runHash === run.run_hash ||
              focusedMetric.runHash === run.run_hash)) ||
          (focusedCircle.runHash === run.run_hash &&
            focusedCircle.metricName === metric?.name &&
            focusedCircle.traceContext === contextHash) ||
          (focusedMetric.runHash === run.run_hash &&
            focusedMetric.metricName === metric?.name &&
            focusedMetric.traceContext === contextHash)
        ) {
          active = true;
        }

        if (active) {
          const activeRow = document.querySelectorAll(
            `.cell-${traceToHash(
              run.run_hash,
              isExploreParamsModeEnabled() ? null : metric?.name,
              isExploreParamsModeEnabled() ? null : contextHash,
            )}`,
          );
          activeRow.forEach((cell) => {
            cell.classList.add('active');
          });
        }

        runIndex++;

        if (isExploreMetricsModeEnabled()) {
          const valueCell = document.querySelector(
            `.value-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} .Table__cell__value`,
          );
          if (!!valueCell) {
            valueCell.textContent =
              stepData !== null && stepData[0] !== null
                ? roundValue(stepData[0])
                : '-';
          }
          const stepCell = document.querySelector(
            `.step-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} .Table__cell__value`,
          );
          if (!!stepCell) {
            stepCell.textContent =
              stepData !== null && stepData[1] !== null ? stepData[1] : '-';
          }

          const epochCell = document.querySelector(
            `.epoch-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} .Table__cell__value`,
          );
          if (!!epochCell) {
            epochCell.textContent =
              stepData !== null && stepData[2] !== null ? stepData[2] : '-';
          }

          const timeCell = document.querySelector(
            `.time-${traceToHash(
              run.run_hash,
              metric?.name,
              contextHash,
            )} .Table__cell__value`,
          );
          if (!!timeCell) {
            timeCell.textContent =
              stepData !== null && stepData[3] !== null
                ? moment.unix(stepData[3]).format('HH:mm:ss · D MMM, YY')
                : '-';
          }
        }
      });

      if (isExploreMetricsModeEnabled() && traceList?.traces.length > 1) {
        const groupSetpCell = document.querySelector(`.step-${groupSelector}`);
        const groupEpochCell = document.querySelector(
          `.epoch-${groupSelector}`,
        );
        if (!!groupSetpCell) {
          groupSetpCell.textContent = groupStepData[groupSelector] ?? '-';
        }
        if (!!groupEpochCell) {
          groupEpochCell.textContent = groupEpochData[groupSelector] ?? '-';
        }

        const aggregatedArea = contextFilter.aggregatedArea;
        const aggregatedLine = contextFilter.aggregatedLine;

        const groupValueCellMin = document.querySelector(
          `.value-${groupSelector} .min`,
        );
        if (!!groupValueCellMin) {
          switch (aggregatedArea) {
            case 'std_dev':
              const stdDevMin = getMetricStepDataByStepIdx(
                traceModel.aggregation.stdDevMin?.trace.data,
                step,
              )?.[0];
              groupValueCellMin.textContent =
                stdDevMin !== null && stdDevMin !== undefined
                  ? roundValue(stdDevMin)
                  : '-';
              break;
            case 'std_err':
              const stdErrMin = getMetricStepDataByStepIdx(
                traceModel.aggregation.stdErrMin?.trace.data,
                step,
              )?.[0];
              groupValueCellMin.textContent =
                stdErrMin !== null && stdErrMin !== undefined
                  ? roundValue(stdErrMin)
                  : '-';
              break;
            case 'conf_int':
              const confIntMin = getMetricStepDataByStepIdx(
                traceModel.aggregation.confIntMin?.trace.data,
                step,
              )?.[0];
              groupValueCellMin.textContent =
                confIntMin !== null && confIntMin !== undefined
                  ? roundValue(confIntMin)
                  : '-';
              break;
            default:
              const min = getMetricStepDataByStepIdx(
                traceModel.aggregation.min?.trace.data,
                step,
              )?.[0];
              groupValueCellMin.textContent =
                min !== null && min !== undefined ? roundValue(min) : '-';
          }
        }

        const groupValueCellMax = document.querySelector(
          `.value-${groupSelector} .max`,
        );
        if (!!groupValueCellMax) {
          switch (aggregatedArea) {
            case 'std_dev':
              const stdDevMax = getMetricStepDataByStepIdx(
                traceModel.aggregation.stdDevMax?.trace.data,
                step,
              )?.[0];
              groupValueCellMax.textContent =
                stdDevMax !== null && stdDevMax !== undefined
                  ? roundValue(stdDevMax)
                  : '-';
              break;
            case 'std_err':
              const stdErrMax = getMetricStepDataByStepIdx(
                traceModel.aggregation.stdErrMax?.trace.data,
                step,
              )?.[0];
              groupValueCellMax.textContent =
                stdErrMax !== null && stdErrMax !== undefined
                  ? roundValue(stdErrMax)
                  : '-';
              break;
            case 'conf_int':
              const confIntMax = getMetricStepDataByStepIdx(
                traceModel.aggregation.confIntMax?.trace.data,
                step,
              )?.[0];
              groupValueCellMax.textContent =
                confIntMax !== null && confIntMax !== undefined
                  ? roundValue(confIntMax)
                  : '-';
              break;
            default:
              const max = getMetricStepDataByStepIdx(
                traceModel.aggregation.max?.trace.data,
                step,
              )?.[0];
              groupValueCellMax.textContent =
                max !== null && max !== undefined ? roundValue(max) : '-';
          }
        }
        const groupValueCellAggLine = document.querySelector(
          `.value-${groupSelector} .aggLine .Label__content`,
        );
        if (!!groupValueCellAggLine) {
          switch (aggregatedLine) {
            case 'avg':
              const avg = getMetricStepDataByStepIdx(
                traceModel.aggregation.avg?.trace.data,
                step,
              )?.[0];
              groupValueCellAggLine.textContent =
                avg !== null && avg !== undefined ? roundValue(avg) : '-';
              break;
            case 'median':
              const med = getMetricStepDataByStepIdx(
                traceModel.aggregation.med?.trace.data,
                step,
              )?.[0];
              groupValueCellAggLine.textContent =
                med !== null && med !== undefined ? roundValue(med) : '-';
              break;
            case 'min':
              const min = getMetricStepDataByStepIdx(
                traceModel.aggregation.min?.trace.data,
                step,
              )?.[0];
              groupValueCellAggLine.textContent =
                min !== null && min !== undefined ? roundValue(min) : '-';
              break;
            case 'max':
              const max = getMetricStepDataByStepIdx(
                traceModel.aggregation.max?.trace.data,
                step,
              )?.[0];
              groupValueCellAggLine.textContent =
                max !== null && max !== undefined ? roundValue(max) : '-';
              break;
          }
        }
      }
    });
  }

  useEffect(() => {
    const paramFields = getAllParamsPaths(false);
    const deepParamFields = getAllParamsPaths(true, true);
    const metrics = isExploreParamsModeEnabled() ? getAllMetrics() : null;
    if (
      !_.isEqual(deepParamFields, searchFields.params.deepParamFields) ||
      !_.isEqual(metrics, searchFields.metrics)
    ) {
      setSearchFields({
        params: {
          paramFields,
          deepParamFields,
        },
        metrics,
      });
    }
  });

  useEffect(() => {
    const focusedStateChangeSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.SET_CHART_FOCUSED_STATE,
      () => {
        window.requestAnimationFrame(updateDynamicColumns);
      },
    );

    const runsStateUpdateSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.SET_TRACE_LIST,
      () => {
        if (columns.current) {
          const tableColumns = table.columnsOrder;
          const order = {
            left: [],
            middle: [],
            right: [],
          };
          columns.current.forEach((col) => {
            if (!!tableColumns && tableColumns.left.includes(col.key)) {
              order.left.push(col.key);
            } else if (
              !!tableColumns &&
              tableColumns.middle.includes(col.key)
            ) {
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
              return (
                tableColumns.left.indexOf(a) - tableColumns.left.indexOf(b)
              );
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
              return (
                tableColumns.middle.indexOf(a) - tableColumns.middle.indexOf(b)
              );
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
              return (
                tableColumns.right.indexOf(a) - tableColumns.right.indexOf(b)
              );
            }
            return 0;
          });
          setColumnsOrder(order);
        }
      },
    );

    return () => {
      focusedStateChangeSubscription.unsubscribe();
      runsStateUpdateSubscription.unsubscribe();
      tableElemRef.current?.removeEventListener('scroll', virtualizedUpdate);
      tableResizeObserver.current?.disconnect();
      tableContainerResizeObserver.current?.disconnect();
    };
  }, []);

  return (
    <div
      className={classNames({
        ContextBox: true,
        spacing: props.spacing,
      })}
      style={{
        width: `${props.width}px`,
      }}
      onMouseLeave={(evt) => {
        if (
          HubMainScreenModel.getState().chart.focused.metric.runHash !== null
        ) {
          setChartFocusedState({
            metric: {
              runHash: null,
              metricName: null,
              traceContext: null,
            },
          });
        }
      }}
    >
      {runs.isLoading ? _renderContentLoader() : _renderContent()}
    </div>
  );
}

ContextBox.propTypes = {};

export default React.memo(ContextBox);
