import React, { memo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as moment from 'moment';

import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';
import PopUp from './PopUp';
import * as classes from '../../../../../../../constants/classes';
import * as storeUtils from '../../../../../../../storeUtils';
import {
  HUB_PROJECT_EXPERIMENT,
  HUB_PROJECT_EXECUTABLE_PROCESS_DETAIL,
  HUB_PROJECT_CREATE_TAG,
} from '../../../../../../../constants/screens';
import UI from '../../../../../../../ui';
import {
  classNames,
  buildUrl,
  getObjectValueByPath,
  formatValue,
} from '../../../../../../../utils';
import * as analytics from '../../../../../../../services/analytics';
import { getGroupingOptions } from '../../../ControlsSidebar/helpers';

const popUpDefaultWidth = 250;
const popUpDefaultHeight = 250;
const margin = 10;

function PanelPopUps(props) {
  let [chartPopUp, setChartPopUp] = useState({
    display: false,
    left: 0,
    top: 0,
    bottom: null,
    width: popUpDefaultWidth,
    height: popUpDefaultHeight,
    selectedTags: [],
    selectedTagsLoading: false,
    run: null,
    metric: null,
    trace: null,
    point: null,
    groupConfig: null,
    focused: false,
  });
  let [tagPopUp, setTagPopUp] = useState({
    display: false,
    isLoading: false,
    left: 0,
    top: 0,
    bottom: null,
    tags: [],
  });
  let [configPopUp, setConfigPopUp] = useState({
    display: false,
    left: 0,
    top: 0,
    bottom: null,
  });
  let [commitPopUp, setCommitPopUp] = useState({
    display: false,
    isLoading: false,
    left: 0,
    top: 0,
    bottom: null,
    data: null,
    processKillBtn: {
      loading: false,
      disabled: false,
    },
  });
  let tagsWrapper = useRef();
  let configIcon = useRef();

  const { chart, contextFilter } = HubMainScreenModel.useHubMainScreenState([
    HubMainScreenModel.events.SET_CHART_FOCUSED_STATE,
    HubMainScreenModel.events.SET_CHART_FOCUSED_ACTIVE_STATE,
    HubMainScreenModel.events.SET_CONTEXT_FILTER,
    HubMainScreenModel.events.SET_CHART_TOOLTIP_OPTIONS,
  ]);

  let {
    isAimRun,
    isTFSummaryScalar,
    getTraceData,
    isExploreParamsModeEnabled,
    getClosestStepData,
    getAllParamsPaths,
  } = HubMainScreenModel.helpers;

  let { setChartTooltipOptions } = HubMainScreenModel.emitters;

  function positionPopUp(
    x,
    y,
    chained = null,
    popupType,
    popUpWidth = popUpDefaultWidth,
    popUpHeight = popUpDefaultHeight,
  ) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const leftOverflow = (x) => popUpWidth + x > width;
    const topOverflow = (y) => popUpHeight + y > height;

    let left = 0;
    let top = 0;
    let bottom = null;
    let chainArrow = null;

    if (chained !== null) {
      if (chained.left + 2 * popUpWidth > width) {
        left = chained.left - popUpWidth;
        chainArrow = 'right';
      } else {
        left = x;
        chainArrow = 'left';
      }
      if (popupType === 'tags') {
        const tagsWrapperRect = tagsWrapper.current.getBoundingClientRect();
        if (tagsWrapperRect.top > height - 100) {
          const chartPopUpRect =
            tagsWrapper.current.parentNode.parentNode.getBoundingClientRect();
          top = null;
          bottom = height - chartPopUpRect.bottom;
        } else {
          top = tagsWrapperRect.top;
          bottom = null;
        }
      } else if (popupType === 'config') {
        const configIconRect = configIcon.current.getBoundingClientRect();
        top = configIconRect.top;
        bottom = null;
      }
    } else {
      if (leftOverflow(x)) {
        left = x - popUpWidth + margin;
      } else {
        left = x + margin;
      }

      top = y; // + margin - Math.floor(popUpHeight / 2);

      if (topOverflow(top)) {
        top = height - popUpHeight;
      } else if (top < 0) {
        top = margin;
      }
    }

    return {
      left,
      top,
      bottom,
      width: popUpWidth,
      height: popUpHeight,
      chainArrow,
    };
  }

  function hideActionPopUps(onlySecondary = false) {
    setTagPopUp((tp) => ({
      ...tp,
      display: false,
    }));
    setConfigPopUp((cp) => ({
      ...cp,
      display: false,
    }));
    setCommitPopUp((cp) => ({
      ...cp,
      display: false,
    }));
    if (!onlySecondary) {
      setChartPopUp((cp) => ({
        ...cp,
        display: false,
      }));
    }
  }

  function getCommitTags(runHash) {
    props
      .getCommitTags(runHash)
      .then((data) => {
        setChartPopUp((cp) => ({
          ...cp,
          selectedTags: data,
        }));
      })
      .catch(() => {
        setChartPopUp((cp) => ({
          ...cp,
          selectedTags: [],
        }));
      })
      .finally(() => {
        setChartPopUp((cp) => ({
          ...cp,
          selectedTagsLoading: false,
        }));
      });
  }

  function handleTagItemClick(runHash, experimentName, tag) {
    setChartPopUp((cp) => ({
      ...cp,
      selectedTagsLoading: true,
    }));

    props
      .updateCommitTag({
        commit_hash: runHash,
        tag_id: tag.id,
        experiment_name: experimentName,
      })
      .then((tagsIds) => {
        getCommitTags(runHash);
        analytics.trackEvent('[Explore] Tag a run');
      });
  }

  function handleAttachTagClick() {
    const pos = positionPopUp(
      chartPopUp.left + popUpDefaultWidth,
      chartPopUp.top,
      chartPopUp,
      'tags',
    );

    setTagPopUp((tp) => ({
      ...tp,
      ...pos,
      display: true,
      isLoading: true,
    }));

    hideActionPopUps(true);
    props.getTags().then((data) => {
      setTagPopUp((tp) => ({
        ...tp,
        display: true,
        tags: data,
        isLoading: false,
      }));
    });
  }

  function handleConfigIconClick() {
    hideActionPopUps(true);
    if (configPopUp.display) {
      setConfigPopUp((cp) => ({
        ...cp,
        display: false,
      }));
    } else {
      const pos = positionPopUp(
        chartPopUp.left + popUpDefaultWidth,
        chartPopUp.top,
        chartPopUp,
        'config',
        300,
        300,
      );

      setConfigPopUp((cp) => ({
        ...cp,
        ...pos,
        display: true,
      }));
    }
  }

  function handleProcessKill(pid, runHash, experimentName) {
    setCommitPopUp((cp) => ({
      ...cp,
      processKillBtn: {
        loading: true,
        disabled: true,
      },
    }));

    props.killRunningExecutable(pid).then((data) => {
      handleCommitInfoClick(runHash, experimentName);
    });
  }

  function handleCommitInfoClick(runHash, experimentName) {
    const pos = positionPopUp(
      chartPopUp.left + popUpDefaultWidth,
      chartPopUp.top,
      chartPopUp,
    );

    hideActionPopUps(true, () => {
      setCommitPopUp((cp) => ({
        ...cp,
        display: true,
        left: pos.left,
        top: pos.top,
        bottom: pos.bottom,
        width: pos.width,
        height: pos.height,
        chainArrow: pos.chainArrow,
        processKillBtn: {
          loading: false,
          disabled: false,
        },
        isLoading: true,
      }));

      props.getCommitInfo(experimentName, runHash).then((data) => {
        setCommitPopUp((cp) => ({
          ...cp,
          isLoading: false,
          data,
        }));
      });
    });
  }

  function getPositionBasedOnOverflow(rect, clipPathRect) {
    let left;
    let top;

    if (rect.left < clipPathRect.left) {
      left = clipPathRect.left;
    } else if (rect.left > clipPathRect.left + clipPathRect.width) {
      left = clipPathRect.left + clipPathRect.width;
    } else {
      left = rect.left;
    }

    if (rect.top < clipPathRect.top) {
      top = clipPathRect.top;
    } else if (rect.top > clipPathRect.top + clipPathRect.height) {
      top = clipPathRect.top + clipPathRect.height;
    } else {
      top = rect.top;
    }

    return {
      left,
      top,
    };
  }

  function updatePopUpPosition() {
    const focusedCircle = chart.focused.circle;
    const focusedMetric = chart.focused.metric;
    const focusedLineAttr = focusedCircle.active
      ? focusedCircle
      : chart.tooltipOptions.display
        ? {
          ...focusedMetric,
          step: chart.focused.step,
        }
        : {};
    if (focusedLineAttr.runHash !== null) {
      const isParamMode = isExploreParamsModeEnabled();
      const line = getTraceData(
        focusedLineAttr.runHash,
        focusedLineAttr.metricName,
        focusedLineAttr.traceContext,
      );
      hideActionPopUps(true);
      if (isParamMode || (line !== null && line.data !== null)) {
        setTimeout(() => {
          const activeCircle = document.querySelector(
            `circle.${focusedLineAttr.active ? 'focus' : 'active'}`,
          );
          if (activeCircle) {
            const circleRect = activeCircle.getBoundingClientRect();
            const topContainer = activeCircle.closest('svg');
            const clipPathElement = topContainer.querySelector('rect');
            const clipPathRect = clipPathElement.getBoundingClientRect();
            const { left, top } = getPositionBasedOnOverflow(
              circleRect,
              clipPathRect,
            );
            const pos = positionPopUp(left, top);
            setChartPopUp((cp) => ({
              ...cp,
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: pos.width,
              height: pos.height,
            }));
          } else {
            hideActionPopUps(false);
          }
        }, 100);
      }
    } else {
      hideActionPopUps(false);
    }
  }

  function formatParamName(type, name) {
    if (type === 'param') {
      return <strong>{name}</strong>;
    }

    let metric = name.split('-{');
    return (
      <>
        <strong>{metric[0].replace('metric-', '')}</strong>{' '}
        <em>{metric[1].slice(0, -1).replaceAll(':', '=')}</em>
      </>
    );
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    const focusedCircle = chart.focused.circle;
    const focusedMetric = chart.focused.metric;
    const focusedLineAttr = focusedCircle.active
      ? focusedCircle
      : chart.tooltipOptions.display
        ? {
          ...focusedMetric,
          step: chart.focused.step,
        }
        : {};
    if (focusedLineAttr.runHash !== null) {
      const isParamMode = isExploreParamsModeEnabled();
      const line = getTraceData(
        focusedLineAttr.runHash,
        focusedLineAttr.metricName,
        focusedLineAttr.traceContext,
      );
      hideActionPopUps(true);
      if (isParamMode || (line !== null && line.data !== null)) {
        const { stepData } = getClosestStepData(
          focusedLineAttr.step,
          line?.data,
          line?.axisValues,
        );
        let point = isParamMode
          ? [focusedLineAttr.contentType, focusedLineAttr.param]
          : stepData ?? [];

        let groupConfig =
          HubMainScreenModel.getState().traceList?.traces.length > 1
            ? {}
            : null;
        let groupFields = HubMainScreenModel.getState().traceList.grouping;
        HubMainScreenModel.getState().traceList?.traces.forEach(
          (traceModel) => {
            if (
              groupConfig !== null &&
              traceModel.hasRun(
                focusedLineAttr.runHash,
                focusedLineAttr.metricName,
                focusedLineAttr.traceContext,
              )
            ) {
              groupConfig = {};
              for (let key in groupFields) {
                if (groupFields[key].length > 0) {
                  groupConfig[key] = groupFields[key].map((param) => ({
                    key: param.startsWith('params.')
                      ? param.substring(7)
                      : param,
                    value: formatValue(traceModel.config[param]),
                  }));
                }
              }
            }
            if (isParamMode) {
              _.uniqBy(traceModel.series, 'run.run_hash').forEach((series) => {
                if (series.run.run_hash !== focusedLineAttr.runHash) {
                  return;
                }
                if (focusedLineAttr.contentType === 'metric') {
                  if (focusedLineAttr.param) {
                    const metric = focusedLineAttr.param.replace('metric-', '');
                    const dashIndex = metric.indexOf('-');
                    const metricKey = metric.slice(0, dashIndex);
                    const metricContext = JSON.parse(
                      metric.slice(dashIndex + 1),
                    );
                    point.push(
                      series.getAggregatedMetricValue(metricKey, metricContext),
                    );
                  }
                } else {
                  if (focusedLineAttr.param) {
                    point.push(
                      getObjectValueByPath(
                        series.run.params,
                        focusedLineAttr.param,
                      ),
                    );
                  }
                }
              });
            }
          },
        );
        setTimeout(() => {
          const focusedCircle = chart.focused.circle;
          const focusedMetric = chart.focused.metric;
          const focusedLineAttr = focusedCircle.active
            ? focusedCircle
            : focusedMetric;
          if (focusedLineAttr.runHash !== null) {
            const activeCircle = document.querySelector(
              `circle.${focusedLineAttr.active ? 'focus' : 'active'}`,
            );
            if (activeCircle) {
              const circleRect = activeCircle.getBoundingClientRect();
              const topContainer = activeCircle.closest('svg');
              const clipPathElement = topContainer.querySelector('rect');
              const clipPathRect = clipPathElement.getBoundingClientRect();
              const { left, top } = getPositionBasedOnOverflow(
                circleRect,
                clipPathRect,
              );
              const pos = positionPopUp(left, top);
              setChartPopUp((cp) => ({
                ...cp,
                left: pos.left,
                top: pos.top,
                bottom: pos.bottom,
                width: pos.width,
                height: pos.height,
                display: !chart.settings.zoomMode,
                run: line.run,
                metric: line.metric,
                trace: line.trace,
                point: point,
                groupConfig: groupConfig,
                focused: focusedLineAttr.active,
              }));
            } else {
              hideActionPopUps(false);
            }
          } else {
            hideActionPopUps(false);
          }
        }, 100);
        if (focusedLineAttr.active && isAimRun(line.run ?? {})) {
          setChartPopUp((cp) => ({
            ...cp,
            selectedTags: [],
            selectedTagsLoading: true,
          }));
          getCommitTags(focusedLineAttr.runHash);
        }
      } else {
        hideActionPopUps(false);
      }
    } else {
      hideActionPopUps(false);
    }
  }, [
    chart.focused.circle,
    chart.focused.metric,
    chart.focused.step,
    contextFilter.groupByColor,
    contextFilter.groupByStyle,
    contextFilter.groupByChart,
    contextFilter.groupAgainst,
  ]);

  useEffect(() => {
    updatePopUpPosition();
  }, [props.panelWidth, props.panelHeight]);

  useEffect(() => {
    const subscription = HubMainScreenModel.subscribe(
      [
        HubMainScreenModel.events.SET_TRACE_LIST,
        HubMainScreenModel.events.SET_CHART_SETTINGS_STATE,
      ],
      updatePopUpPosition,
    );

    return () => {
      subscription.unsubscribe();
    };
  });

  return (
    <div className='PanelChart__body'>
      {chartPopUp.display && (
        <PopUp
          className={classNames({
            ChartPopUp: true,
            tooltip: !chartPopUp.focused,
          })}
          left={chartPopUp.left}
          top={chartPopUp.top}
          width={chartPopUp.width}
          height={chartPopUp.height}
          xGap={true}
        >
          <div>
            {chartPopUp.focused && (
              <div
                className={classNames({
                  ChartPopUp__config: true,
                  active: configPopUp.display,
                })}
                onClick={handleConfigIconClick}
                ref={configIcon}
              >
                <UI.Icon i='settings' />
              </div>
            )}
            {isAimRun(chartPopUp.run ?? {}) && (
              <>
                {isExploreParamsModeEnabled() && chartPopUp.point[0] ? (
                  <div>
                    <UI.Text type='grey-darker' small>
                      <span>
                        Value:{' '}
                        {typeof chartPopUp.point[2] === 'number'
                          ? Math.round(chartPopUp.point[2] * 10e9) / 10e9
                          : formatValue(chartPopUp.point[2])}
                      </span>
                    </UI.Text>
                    <UI.Text type='grey' small>
                      {capitalize(chartPopUp.point[0])}:{' '}
                      {formatParamName(
                        chartPopUp.point[0],
                        chartPopUp.point[1],
                      )}
                    </UI.Text>
                    <UI.Text type='grey' small>
                      Experiment: {chartPopUp.run.experiment_name}
                    </UI.Text>
                    <UI.Text type='grey' small>
                      Run Date:{' '}
                      {moment
                        .unix(chartPopUp.run.date)
                        .format('HH:mm · D MMM, YY')}
                    </UI.Text>
                  </div>
                ) : (
                  <div>
                    <UI.Text type='grey-darker' small>
                      {chartPopUp.metric?.name}:{' '}
                      {Math.round(chartPopUp.point[0] * 10e9) / 10e9}
                    </UI.Text>
                    {Array.isArray(
                      HubMainScreenModel.getState().chart.settings.persistent
                        .xAlignment,
                    ) && (
                      <UI.Text type='grey-darker' small>
                        {
                          HubMainScreenModel.getState().chart.settings
                            .persistent.xAlignment[0]
                        }
                        : {Math.round(chartPopUp.point[4] * 10e9) / 10e9}
                      </UI.Text>
                    )}
                    <UI.Text type='grey' small>
                      Step: {chartPopUp.point[1]}
                      {isTFSummaryScalar(chartPopUp.run) && (
                        <> (local step: {chartPopUp.point[4]}) </>
                      )}
                    </UI.Text>
                    <UI.Text type='grey' small>
                      Experiment: {chartPopUp.run.experiment_name}
                    </UI.Text>
                    <UI.Text type='grey' small>
                      Run Date:{' '}
                      {moment
                        .unix(chartPopUp.run.date)
                        .format('HH:mm · D MMM, YY')}
                    </UI.Text>
                  </div>
                )}
              </>
            )}
            {chartPopUp.groupConfig !== null && (
              <div className='ChartPopUp__groupConfig'>
                <UI.Line />
                <UI.Text type='black'>Group Config</UI.Text>
                {Object.keys(chartPopUp.groupConfig).map((key) => (
                  <div key={key} className='ChartPopUp__groupConfig__type'>
                    <UI.Text type='black' small>
                      {key === 'color'
                        ? 'Color params'
                        : key === 'stroke'
                          ? 'Stroke style params'
                          : 'Chart params'}
                    </UI.Text>
                    {chartPopUp.groupConfig[key].map((param) => (
                      <UI.Text key={param.key} type='grey' small>
                        {param.key}: {param.value}
                      </UI.Text>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {chart.tooltipOptions.fields.length > 0 && (
              <div className='ChartPopUp__groupConfig'>
                <UI.Line />
                <UI.Text type='black'>Params</UI.Text>
                {chart.tooltipOptions.fields.map((field) => (
                  <UI.Text key={field} type='grey' small>
                    {field.startsWith('params.') ? field.slice(7) : field}:{' '}
                    {formatValue(_.get(chartPopUp.run, field))}
                  </UI.Text>
                ))}
              </div>
            )}
            {chartPopUp.focused && isAimRun(chartPopUp.run ?? {}) && (
              <>
                <UI.Line />
                <Link
                  to={buildUrl(HUB_PROJECT_EXPERIMENT, {
                    experiment_name: chartPopUp.run.experiment_name,
                    commit_id: chartPopUp.run.run_hash,
                  })}
                >
                  <UI.Text type='primary'>Run Details</UI.Text>
                </Link>
              </>
            )}
            {chartPopUp.focused && (
              <>
                <UI.Line />
                {!chartPopUp.selectedTagsLoading ? (
                  <div
                    className='PanelChart__popup__tags__wrapper'
                    ref={tagsWrapper}
                  >
                    <UI.Text overline type='grey-darker'>
                      tag
                    </UI.Text>
                    <div className='PanelChart__popup__tags'>
                      {chartPopUp.selectedTags.length ? (
                        <>
                          {chartPopUp.selectedTags.map((tagItem, i) => (
                            <UI.Label key={i} color={tagItem.color}>
                              {tagItem.name}
                            </UI.Label>
                          ))}
                        </>
                      ) : (
                        <UI.Label>No attached tag</UI.Label>
                      )}
                      <div
                        className='PanelChart__popup__tags__update'
                        onClick={handleAttachTagClick}
                      >
                        <UI.Icon i='edit' />
                      </div>
                    </div>
                  </div>
                ) : (
                  <UI.Text type='grey' center spacingTop spacing>
                    Loading..
                  </UI.Text>
                )}
              </>
            )}
            {isTFSummaryScalar(chartPopUp.run) && (
              <>
                <div className='PanelChart__popup__tags__wrapper'>
                  <UI.Text overline type='grey-darker'>
                    tag
                  </UI.Text>
                  <div className='PanelChart__popup__tags'>
                    <UI.Label>{chartPopUp.metric.tag.name}</UI.Label>
                  </div>
                </div>
                <UI.Line />
                <UI.Text overline type='grey-darker'>
                  tf.summary scalar
                </UI.Text>
                <UI.Text type='grey-dark'>{chartPopUp.run.name}</UI.Text>
                {/*<UI.Text type='grey' small>{moment.unix(run.date).format('HH:mm · D MMM, YY')}</UI.Text>*/}
                <UI.Line />
              </>
            )}
          </div>
        </PopUp>
      )}
      {tagPopUp.display && (
        <PopUp
          className='TagPopUp'
          left={tagPopUp.left}
          top={tagPopUp.top}
          bottom={tagPopUp.bottom}
          chainArrow={tagPopUp.chainArrow}
          xGap={true}
        >
          {tagPopUp.isLoading ? (
            <UI.Text type='grey' center>
              Loading..
            </UI.Text>
          ) : (
            <div className='TagPopUp__tags'>
              <div className='TagPopUp__tags__title'>
                <UI.Text type='grey' inline>
                  Select a tag
                </UI.Text>
                <Link to={HUB_PROJECT_CREATE_TAG}>
                  <UI.Button type='positive' size='tiny'>
                    Create
                  </UI.Button>
                </Link>
              </div>
              <UI.Line spacing={false} />
              <div className='TagPopUp__tags__box'>
                {!tagPopUp.tags.length && (
                  <UI.Text type='grey' center spacingTop spacing>
                    Empty
                  </UI.Text>
                )}
                {tagPopUp.tags.map((tag, tagKey) => (
                  <UI.Label
                    className={classNames({
                      TagPopUp__tags__item: true,
                      active: chartPopUp.selectedTags
                        .map((i) => i.id)
                        .includes(tag.id),
                    })}
                    key={tagKey}
                    color={tag.color}
                    onClick={() =>
                      handleTagItemClick(
                        chartPopUp.run.run_hash,
                        chartPopUp.run.experiment_name,
                        tag,
                      )
                    }
                  >
                    {tag.name}
                  </UI.Label>
                ))}
              </div>
            </div>
          )}
        </PopUp>
      )}
      {configPopUp.display && (
        <PopUp
          className='ConfigPopUp'
          width={configPopUp.width}
          height={configPopUp.height}
          left={configPopUp.left}
          top={configPopUp.top}
          bottom={configPopUp.bottom}
          chainArrow={configPopUp.chainArrow}
          xGap={true}
        >
          <div>
            <div className='ConfigPopUp__params'>
              <UI.Text overline bold type='primary' spacing>
                Select fields to display in tooltip
              </UI.Text>
              <UI.Dropdown
                className='ConfigPopUp__groupingDropdown'
                options={getGroupingOptions(
                  getAllParamsPaths(),
                  [],
                  false,
                  false,
                )}
                inline={false}
                formatGroupLabel={(data) => (
                  <div>
                    <span>{data.label}</span>
                    <span>{data.options.length}</span>
                  </div>
                )}
                defaultValue={chart.tooltipOptions.fields.map((field) => ({
                  value: field,
                  label: field.startsWith('params.')
                    ? field.substring(7)
                    : field,
                }))}
                onChange={(data) => {
                  const selectedItems = !!data ? data : [];
                  const values = selectedItems
                    .filter((i) => !!i.value)
                    .map((i) => i.value.trim());
                  setChartTooltipOptions({
                    fields: values,
                  });
                  analytics.trackEvent(
                    '[Explore] Change chart popover params content',
                  );
                }}
                isOpen
                multi
              />
            </div>
            <UI.Line />
            <div className='ConfigPopUp__toggle'>
              <UI.Text overline bold center type='primary'>
                Toggle chart tooltip visibility
              </UI.Text>
              <div
                className='ConfigPopUp__toggle__switch'
                onClick={() => {
                  setChartTooltipOptions({
                    display: !chart.tooltipOptions.display,
                  });
                  analytics.trackEvent(
                    `[Explore] ${
                      chart.tooltipOptions.display ? 'Hide' : 'Show'
                    } chart tooltip on hover`,
                  );
                }}
              >
                <UI.Text
                  type={!chart.tooltipOptions.display ? 'primary' : 'grey-dark'}
                  small
                >
                  Hide
                </UI.Text>
                <span
                  className={classNames({
                    ConfigPopUp__toggle__switch__icon: true,
                    on: chart.tooltipOptions.display,
                  })}
                >
                  <UI.Icon
                    i={`toggle_${chart.tooltipOptions.display ? 'on' : 'off'}`}
                    scale={1.5}
                  />
                </span>
                <UI.Text
                  type={chart.tooltipOptions.display ? 'primary' : 'grey-dark'}
                  small
                >
                  Show
                </UI.Text>
              </div>
            </div>
          </div>
        </PopUp>
      )}
      {commitPopUp.display && (
        <PopUp
          className='CommitPopUp'
          left={commitPopUp.left}
          top={commitPopUp.top}
          chainArrow={commitPopUp.chainArrow}
          xGap={true}
        >
          {commitPopUp.isLoading ? (
            <UI.Text type='grey' center>
              Loading..
            </UI.Text>
          ) : (
            <>
              {/*<UI.Text type='grey' small>*/}
              {/*  {moment.unix(lineData.date).format('HH:mm · D MMM, YY')}*/}
              {/*</UI.Text>*/}
              <Link
                to={buildUrl(HUB_PROJECT_EXPERIMENT, {
                  experiment_name: chartPopUp.run.experiment_name,
                  commit_id: chartPopUp.run.run_hash,
                })}
              >
                <UI.Text type='primary'>Detailed View</UI.Text>
              </Link>
              <UI.Line />
              <UI.Text type='grey' small>
                Experiment: {chartPopUp.run.experiment_name}
              </UI.Text>
              <UI.Text type='grey' small>
                Hash: {chartPopUp.run.run_hash}
              </UI.Text>
              {!!commitPopUp.data.process && (
                <>
                  <UI.Line />
                  {!!commitPopUp.data.process.uuid && (
                    <Link
                      to={buildUrl(HUB_PROJECT_EXECUTABLE_PROCESS_DETAIL, {
                        process_id: commitPopUp.data.process.uuid,
                      })}
                    >
                      <UI.Text>Process</UI.Text>
                    </Link>
                  )}
                  <UI.Text type='grey' small>
                    Process status:{' '}
                    {commitPopUp.data.process.finish ? 'finished' : 'running'}
                  </UI.Text>
                  {!!commitPopUp.data.process.start_date && (
                    <UI.Text type='grey' small>
                      Time:{' '}
                      {Math.round(
                        commitPopUp.data.process.finish
                          ? commitPopUp.data.date -
                              commitPopUp.data.process.start_date
                          : commitPopUp.data.process.time || '-',
                      )}
                    </UI.Text>
                  )}
                  {!!commitPopUp.data.process.pid && (
                    <div className='CommitPopUp__process'>
                      <UI.Text type='grey' small inline>
                        PID: {commitPopUp.data.process.pid}{' '}
                      </UI.Text>
                      <UI.Button
                        onClick={() =>
                          handleProcessKill(
                            commitPopUp.data.process.pid,
                            chartPoUp.run.run_hash,
                            chartPoUp.run.experiment_name,
                          )
                        }
                        type='negative'
                        size='tiny'
                        inline
                        {...commitPopUp.processKillBtn}
                      >
                        Kill
                      </UI.Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </PopUp>
      )}
    </div>
  );
}

PanelPopUps.propTypes = {
  panelWidth: PropTypes.number,
  panelHeight: PropTypes.number,
};

export default memo(storeUtils.getWithState(classes.PANEL_POPUPS, PanelPopUps));
