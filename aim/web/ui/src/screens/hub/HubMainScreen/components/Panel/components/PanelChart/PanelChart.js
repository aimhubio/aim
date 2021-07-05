import './PanelChart.less';

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Color from 'color';
import * as _ from 'lodash';
import * as moment from 'moment';
import humanizeDuration from 'humanize-duration';

import {
  removeOutliers,
  formatValue,
  findClosestIndex,
} from '../../../../../../../utils';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';
import * as analytics from '../../../../../../../services/analytics';

const d3 = require('d3');

const circleRadius = 3;
const circleActiveRadius = 5;

const curveOptions = [
  'curveLinear',
  'curveBasis',
  'curveBundle',
  'curveCardinal',
  'curveCatmullRom',
  'curveMonotoneX',
  'curveMonotoneY',
  'curveNatural',
  'curveStep',
  'curveStepAfter',
  'curveStepBefore',
  'curveBasisClosed',
];

const scaleOptions = ['linear', 'log'];

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
  units: ['d', 'h', 'm', 's'],
  spacer: '',
  delimiter: ' ',
  largest: 1,
});

function PanelChart(props) {
  let visBox = useRef({
    margin: {
      top: 24,
      right: 20,
      bottom: 30,
      left: 60,
    },
    height: null,
    width: null,
  });
  let plotBox = useRef({
    height: null,
    width: null,
  });
  let chartOptions = useRef({
    xNum: 0,
    xMax: 0,
    xSteps: [],
    xScale: null,
    yScale: null,
  });

  let {
    setChartFocusedState,
    setChartFocusedActiveState,
    setChartSettingsState,
  } = HubMainScreenModel.emitters;

  let {
    contextToHash,
    traceToHash,
    getTraceData,
    getMetricColor,
    getClosestStepData,
  } = HubMainScreenModel.helpers;

  const parentRef = useRef();
  const visRef = useRef();
  const svg = useRef(null);
  const plot = useRef(null);
  const bgRect = useRef(null);
  const axes = useRef(null);
  const lines = useRef(null);
  const attributes = useRef(null);
  const brush = useRef(null);
  const idleTimeout = useRef(null);
  const xAxisValue = useRef();
  const yAxisValue = useRef();
  const humanizerConfig = useRef();
  const traces = useRef({});

  function getValueInLine({ x1, x2, y1, y2, x, y, scale }) {
    if (x === undefined) {
      let value;
      let dx1;
      let dx2;
      let dy1;
      let dy2;
      if (x1 === x2) {
        value = x1;
      } else {
        if (scale.xScale === 0) {
          dx1 = x1;
          dx2 = x2;
        } else {
          dx1 = Math.log(x1);
          dx2 = Math.log(x2);
        }
        if (scale.yScale === 0) {
          dy1 = y - y1;
          dy2 = y2 - y1;
        } else {
          dy1 = Math.log(y) - Math.log(y1);
          dy2 = Math.log(y2) - Math.log(y1);
        }
        if (dx1 > dx2) {
          value = dx1 - ((dx1 - dx2) * dy1) / dy2;
        } else {
          value = ((dx2 - dx1) * dy1) / dy2 + dx1;
        }
        if (scale.xScale === 1) {
          value = Math.exp(value);
        }
      }
      return value;
    } else {
      let value;
      let dx1;
      let dx2;
      let dy1;
      let dy2;
      if (x1 === x2 || x === x1) {
        value = y1;
      } else if (x === x2) {
        value = y2;
      } else {
        if (scale.xScale === 0) {
          dx1 = x - x1;
          dx2 = x2 - x1;
        } else {
          dx1 = Math.log(x) - Math.log(x1);
          dx2 = Math.log(x2) - Math.log(x1);
        }
        if (scale.yScale === 0) {
          dy1 = y1;
          dy2 = y2;
        } else {
          dy1 = Math.log(y1);
          dy2 = Math.log(y2);
        }
        if (dy1 > dy2) {
          value = dy1 - ((dy1 - dy2) * dx1) / dx2;
        } else {
          value = ((dy2 - dy1) * dx1) / dx2 + dy1;
        }
        if (scale.yScale === 1) {
          value = Math.exp(value);
        }
      }
      return value;
    }
  }

  function calculateLineValues({
    axisValues,
    traceData,
    xMin,
    xMax,
    yMin,
    yMax,
    scale,
  }) {
    let prevValue = {};
    const xMinScaled = chartOptions.current.xScale(xMin);
    const xMaxScaled = chartOptions.current.xScale(xMax);
    const yMinScaled = chartOptions.current.yScale(yMin);
    const yMaxScaled = chartOptions.current.yScale(yMax);
    const offsetScaled = 50;
    const minEdge = chartOptions.current.yScale.invert(
      yMinScaled + offsetScaled,
    );
    const maxEdge = chartOptions.current.yScale.invert(
      yMaxScaled - offsetScaled,
    );
    let leftEdge = _.findLastIndex(axisValues, (v) => v <= xMin);
    let rightEdge = _.findIndex(axisValues, (v) => v >= xMax) + 1;
    if (leftEdge === -1) {
      leftEdge = 0;
    }
    if (rightEdge === 0) {
      rightEdge = axisValues.length;
    }
    let visibleAxisValues = axisValues.slice(leftEdge, rightEdge);
    let visibleTraceData = traceData.slice(leftEdge, rightEdge);

    let lineData = visibleAxisValues.map((xValue, i) => {
      let yValue = visibleTraceData[i][0];
      let x;
      let y = yValue < minEdge ? minEdge : yValue > maxEdge ? maxEdge : yValue;
      let value;
      if (y === yValue) {
        x = xValue;
        prevValue = { x, y };
        value = { x, y };
      } else {
        const nextX = visibleAxisValues[i + 1];
        const nextYValue = visibleTraceData[i + 1]?.[0];
        let nextY =
          nextYValue < minEdge
            ? minEdge
            : nextYValue > maxEdge
              ? maxEdge
              : nextYValue;
        if (i === 0) {
          x = xValue;
          if (visibleAxisValues.length > 1) {
            let x2 = getValueInLine({
              x1: x,
              x2: nextX,
              y1: yValue,
              y2: nextY,
              y: y,
              scale,
            });
            value = [
              { x, y },
              { x: x2, y },
            ];
            prevValue = {
              x: x2,
              y,
            };
          } else {
            prevValue = { x, y };
            value = { x, y };
          }
        } else {
          x = getValueInLine({
            x1: prevValue.x,
            x2: xValue,
            y1: prevValue.y,
            y2: yValue,
            y: y,
            scale,
          });
          if (i !== visibleAxisValues.length - 1) {
            let x2 = getValueInLine({
              x1: xValue,
              x2: nextX,
              y1: yValue,
              y2: nextY,
              y: y,
              scale,
            });
            value = [
              { x, y },
              { x: x2, y },
            ];
            prevValue = {
              x: x2,
              y,
            };
          } else {
            value = { x, y };
          }
        }
      }

      return Array.isArray(value)
        ? value.map((v) => ({
          x: chartOptions.current.xScale(v.x),
          y: chartOptions.current.yScale(v.y),
        }))
        : {
          x: chartOptions.current.xScale(value.x),
          y: chartOptions.current.yScale(value.y),
        };
    });
    let result = lineData.flat().sort((a, b) => a.x - b.x);
    let minIndex = -1;
    let maxIndex = result.length;

    for (let i = 0; i < result.length; i++) {
      const d = result[i];
      if (d.x < xMinScaled && i > minIndex) {
        minIndex = i;
      }
      if (d.x > xMaxScaled && i < maxIndex) {
        maxIndex = i;
      }
    }

    if (minIndex >= maxIndex) {
      result = [];
    } else {
      if (minIndex > -1 && minIndex < result.length - 1) {
        result[minIndex] = {
          x: xMinScaled,
          y: chartOptions.current.yScale(
            getValueInLine({
              x1: chartOptions.current.xScale.invert(result[minIndex].x),
              x2: chartOptions.current.xScale.invert(result[minIndex + 1].x),
              y1: chartOptions.current.yScale.invert(result[minIndex].y),
              y2: chartOptions.current.yScale.invert(result[minIndex + 1].y),
              x: xMin,
              scale,
            }),
          ),
        };
      }
      if (maxIndex < result.length && maxIndex > 0) {
        result[maxIndex] = {
          x: xMaxScaled,
          y: chartOptions.current.yScale(
            getValueInLine({
              x1: chartOptions.current.xScale.invert(result[maxIndex - 1].x),
              x2: chartOptions.current.xScale.invert(result[maxIndex].x),
              y1: chartOptions.current.yScale.invert(result[maxIndex - 1].y),
              y2: chartOptions.current.yScale.invert(result[maxIndex].y),
              x: xMax,
              scale,
            }),
          ),
        };
      }
    }

    return result.slice(minIndex > -1 ? minIndex : 0, maxIndex + 1);
  }

  function initD3() {
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
  }

  function renderChart() {
    clear();
    draw();
  }

  function clear() {
    if (!visRef.current) {
      return;
    }

    const visArea = d3.select(visRef.current);
    visArea.selectAll('*').remove();
    visArea.attr('style', null);
  }

  function draw() {
    if (!visRef.current) {
      return;
    }

    drawArea();
    processData();
    drawAxes();
    drawChart();
    bindInteractions();
  }

  function processData() {
    const { traceList, chart } = HubMainScreenModel.getState();
    const { width, height, margin } = visBox.current;
    const isXLogScale =
      scaleOptions[chart.settings.persistent.xScale] === 'log';
    const isYLogScale =
      scaleOptions[chart.settings.persistent.yScale] === 'log';

    let xSteps = [];
    let yValues = [];
    let minData = [];
    let maxData = [];

    traceList?.traces.forEach((traceModel) => {
      traceModel.series.forEach((series) => {
        if (traceModel.chart !== props.index) {
          return;
        }
        const { trace } = series;
        if (trace?.data) {
          let axisValues = isXLogScale
            ? trace.axisValues.filter((v) => v > 0)
            : trace.axisValues;
          xSteps = _.uniq(xSteps.concat(axisValues).sort((a, b) => a - b));

          if (chart.settings.persistent.displayOutliers) {
            let traceValues = trace.data.map((elem) => elem[0]);
            traceValues = isYLogScale
              ? traceValues.filter((v) => v > 0)
              : traceValues;

            yValues = _.uniq(yValues.concat(traceValues).sort((a, b) => a - b));
          } else {
            trace.data.forEach((elem, elemIdx) => {
              if (!isYLogScale || elem[0] > 0) {
                if (minData.length > elemIdx) {
                  minData[elemIdx].push(elem[0]);
                } else {
                  minData.push([elem[0]]);
                }
                if (maxData.length > elemIdx) {
                  maxData[elemIdx].push(elem[0]);
                } else {
                  maxData.push([elem[0]]);
                }
              }
            });
          }
        }
      });
    });

    let xNum = xSteps.length;
    let xMin = xSteps[0];
    let xMax = xSteps[xNum - 1];
    let yMin;
    let yMax;

    if (chart.settings.persistent.displayOutliers) {
      yMin = yValues[0];
      yMax = yValues[yValues.length - 1];
    } else {
      minData = minData.map((e) => Math.min(...e));
      minData = removeOutliers(minData, 4);

      maxData = maxData.map((e) => Math.max(...e));
      maxData = removeOutliers(maxData, 4);

      yMin = minData[0];
      yMax = maxData[maxData.length - 1];
    }

    let xScaleBase;
    if (isXLogScale) {
      xScaleBase = d3.scaleLog();
    } else {
      xScaleBase = d3.scaleLinear();
    }

    const xScale = xScaleBase
      .domain(chart.settings.persistent.zoom?.[props.index]?.x ?? [xMin, xMax])
      .range([0, width - margin.left - margin.right]);

    let yScaleBase;
    if (isYLogScale) {
      yScaleBase = d3.scaleLog();
    } else {
      if (yMax === yMin) {
        yMax += 1;
        yMin -= 1;
      } else {
        const diff = yMax - yMin;
        yMax += diff * 0.1;
        yMin -= diff * 0.05;
      }
      yScaleBase = d3.scaleLinear();
    }

    const yScale = yScaleBase
      .domain(chart.settings.persistent.zoom?.[props.index]?.y ?? [yMin, yMax])
      .range([
        height - margin.top - (margin.bottom + (isXLogScale ? 5 : 0)),
        0,
      ]);

    chartOptions.current = {
      ...chartOptions.current,
      xNum,
      xMax,
      xSteps,
      xScale,
      yScale,
    };

    traces.current = {};

    let runIndex = 0;

    traceList?.traces.forEach((traceModel) =>
      traceModel.series.forEach((series) => {
        if (traceModel.chart !== props.index) {
          runIndex++;
          return;
        }
        const { run, metric, trace } = series;

        if (run.metricIsHidden) {
          runIndex++;
          return;
        }
        const traceData = [];
        const axisValues = trace.axisValues.filter((xVal, i) => {
          if (
            (isXLogScale && xVal <= 0) ||
            (isYLogScale && trace?.data[i]?.[0] <= 0)
          ) {
            return false;
          }
          if (!!trace?.data) {
            traceData.push(trace?.data[i]);
          }
          return true;
        });

        const lineData = calculateLineValues({
          axisValues: axisValues,
          traceData: traceData,
          xMin: chartOptions.current.xScale.domain()[0],
          xMax: chartOptions.current.xScale.domain()[1],
          yMin: chartOptions.current.yScale.domain()[0],
          yMax: chartOptions.current.yScale.domain()[1],
          scale: {
            xScale: chart.settings.persistent.xScale ?? 0,
            yScale: chart.settings.persistent.yScale ?? 0,
          },
        });

        const traceContext = contextToHash(trace?.context);

        const traceKey = traceToHash(run.run_hash, metric?.name, traceContext);

        traces.current[traceKey] = {
          axisValues: axisValues,
          data: lineData,
          key: traceKey,
          color:
            traceList?.grouping?.color?.length > 0
              ? traceModel.color
              : getMetricColor(run, metric, trace, runIndex),
          stroke:
            traceList?.grouping?.stroke?.length > 0 ? traceModel.stroke : '0',
          runHash: run.run_hash,
          metricName: metric?.name,
          traceContext: traceContext,
        };

        runIndex++;
      }),
    );
  }

  function updateChart() {
    const { chart } = HubMainScreenModel.getState();
    if (chart.focused.circle.active) {
      return;
    }

    const highlightMode = chart.settings.highlightMode;
    const focusedMetric = chart.focused.metric;

    attributes.current?.selectAll('circle').remove();
    attributes.current?.selectAll('line').remove();
    if (yAxisValue.current) {
      yAxisValue.current.remove();
      yAxisValue.current = null;
    }
    drawHoverAttributes();

    if (chart.settings.persistent.aggregated) {
      lines.current?.selectAll('path').remove();
      drawAggregatedLines();
    } else {
      const noSelectedRun =
        highlightMode === 'default' || !focusedMetric.runHash;

      lines.current.classed('highlight', !noSelectedRun);

      lines.current?.selectAll('.PlotLine.active').classed('active', false);
      lines.current?.selectAll('.PlotLine.current').classed('current', false);

      if (highlightMode === 'run') {
        lines.current
          ?.selectAll(
            `.PlotLine-${btoa(focusedMetric.runHash).replace(/[\=\+\/]/g, '')}`,
          )
          .classed('active', true)
          .moveToFront();
      }

      lines.current
        ?.selectAll(
          `.PlotLine-${traceToHash(
            focusedMetric.runHash,
            focusedMetric.metricName,
            focusedMetric.traceContext,
          )}`,
        )
        .classed('current', true)
        .moveToFront();
    }
  }

  function drawChart() {
    const { chart } = HubMainScreenModel.getState();
    if (chart.settings.persistent.aggregated) {
      drawAggregatedLines();
    } else {
      drawLines();
    }
    drawHoverAttributes();
  }

  function drawArea() {
    const { traceList, chart, runs } = HubMainScreenModel.getState();
    const parent = d3.select(parentRef.current);
    const visArea = d3.select(visRef.current);
    const parentRect = parent.node().getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;

    const { margin } = visBox.current;
    const width = parentWidth;
    const height = parentHeight;

    const isXLogScale =
      scaleOptions[chart.settings.persistent.xScale] === 'log';

    visBox.current = {
      ...visBox.current,
      width,
      height,
    };
    plotBox.current = {
      ...plotBox.current,
      width: width - margin.left - margin.right,
      height: height - margin.top - (margin.bottom + (isXLogScale ? 5 : 0)),
    };

    visArea.style('width', `${width}px`).style('height', `${height}px`);

    svg.current = visArea
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('xmlns', 'http://www.w3.org/2000/svg'); // .attr('id', 'panel_svg');

    const titleMarginTop = 5;
    const titleMarginBottom = 2;
    const titleHeight = margin.top - titleMarginTop - titleMarginBottom;
    const isZoomed = !!chart.settings.persistent.zoom?.[props.index];

    if (traceList?.grouping.chart) {
      svg.current
        .append('foreignObject')
        .attr('x', 0)
        .attr('y', titleMarginTop)
        .attr('height', titleHeight)
        .attr('width', width - (isZoomed ? titleHeight : 0))
        .html((d) => {
          const title =
            traceList?.grouping.chart.length > 0
              ? `${traceList?.grouping.chart
                .map((key) => {
                  return (
                    key +
                      '=' +
                      formatValue(
                        traceList.traces.find(
                          (elem) => elem.chart === props.index,
                        )?.config[key],
                        false,
                      )
                  );
                })
                .join(', ')}`
              : '';
          const index = props.index + 1;

          if (!traceList?.grouping.chart.length) {
            return '';
          }

          return `
            <div class='ChartTitle' title='#${index} ${title}'>
              <div style='width: ${titleHeight}px; height: ${titleHeight}px;' class='ChartTitle__index'>${index}</div>
              <div class='ChartTitle__text'>${title}</div>
            </div>`;
        })
        .moveToFront();
    }

    if (isZoomed) {
      function zoomOut() {
        let historyIndex = _.findIndex(
          chart.settings.zoomHistory,
          (item) => item[0] === +props.index,
        );
        setChartSettingsState({
          ...chart.settings,
          zoomMode: false,
          zoomHistory: chart.settings.zoomHistory.filter(
            (item, index) => index !== historyIndex,
          ),
          persistent: {
            ...chart.settings.persistent,
            zoom: {
              ...(chart.settings.persistent.zoom ?? {}),
              [props.index]:
                chart.settings.zoomHistory[historyIndex]?.[1] ?? null,
            },
          },
        });
        analytics.trackEvent('[Explore] [LineChart] Line chart zoom out');
      }
      svg.current
        .append('foreignObject')
        .attr('x', width - 30)
        .attr('y', titleMarginTop)
        .attr('height', titleHeight)
        .attr('width', titleHeight)
        .html((d) => {
          return `
            <div 
              class='ChartTitle ChartTitle--zoom' 
              style='width: ${titleHeight}px; height: ${titleHeight}px;' 
              title='Click to zoom out'
            >
              <span class='Icon zoom_out material-icons-outlined no_spacing_right'>
                zoom_out
              </span>
            </div>`;
        })
        .on('click', zoomOut)
        .moveToFront();
    }

    bgRect.current = svg.current
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr(
        'height',
        height - margin.top - (margin.bottom + (isXLogScale ? 5 : 0)),
      )
      .style('fill', 'transparent');

    plot.current = svg.current
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    axes.current = plot.current.append('g').attr('class', 'Axes');

    lines.current = plot.current.append('g').attr('class', 'Lines');
    lines.current
      .append('clipPath')
      .attr('id', 'lines-rect-clip-' + props.index)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width - margin.left - margin.right)
      .attr(
        'height',
        height - margin.top - (margin.bottom + (isXLogScale ? 5 : 0)),
      );

    attributes.current = plot.current.append('g');
    attributes.current
      .append('clipPath')
      .attr('id', 'circles-rect-clip-' + props.index)
      .append('rect')
      .attr('x', -7)
      .attr('y', 0)
      .attr(
        'width',
        width - margin.left - margin.right + 2 * circleActiveRadius,
      )
      .attr(
        'height',
        height - margin.top - (margin.bottom + (isXLogScale ? 5 : 0)),
      );

    if (chart.settings.zoomMode) {
      brush.current = d3
        .brush()
        .extent([
          [0, 0],
          [
            width - margin.left - margin.right,
            height - (margin.top + margin.bottom + (isXLogScale ? 5 : 0)),
          ],
        ])
        .on('end', handleZoomChange);

      plot.current.append('g').attr('class', 'brush').call(brush.current);
    }
  }

  function drawAxes() {
    const { traceList, chart } = HubMainScreenModel.getState();
    let xAlignment = chart.settings.persistent.xAlignment;
    if (Array.isArray(xAlignment)) {
      xAlignment = xAlignment[0];
    }
    const isXLogScale =
      scaleOptions[chart.settings.persistent.xScale] === 'log';
    let xTicks = [];

    if (xAlignment === 'epoch' && traceList.epochSteps[props.index]) {
      xTicks = Object.keys(traceList.epochSteps[props.index]).map((epoch) => {
        return [
          traceList.epochSteps[props.index][epoch][0],
          epoch === 'null' ? null : epoch,
        ];
      });
    }

    let xAxisTicks = d3.axisBottom(chartOptions.current.xScale);

    if (xAlignment === 'epoch') {
      const ticksCount = Math.floor(plotBox.current.width / 50);
      const delta = Math.floor(xTicks.length / ticksCount);
      const ticks =
        delta > 1 ? xTicks.filter((_, i) => i % delta === 0) : xTicks;
      xAxisTicks
        .tickValues(ticks.map((tick) => tick[0]))
        .tickFormat((d, i) => ticks[i][1]);
    } else if (xAlignment === 'relative_time') {
      let ticksCount = Math.floor(plotBox.current.width / 85);
      ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;
      const [first, last] = chartOptions.current.xScale.domain();
      const diff = Math.ceil(last - first);
      let unit;
      let formatUnit;
      if (diff / week > 4) {
        unit = week;
        formatUnit = 'w';
      } else if (diff / day > 3) {
        unit = day;
        formatUnit = 'd';
      } else if (diff / hour > 3) {
        unit = hour;
        formatUnit = 'h';
      } else if (diff / minute > 4) {
        unit = minute;
        formatUnit = 'm';
      } else {
        unit = null;
        formatUnit = 's';
      }
      let tickValues =
        unit === null
          ? null
          : _.range(Math.ceil(first), Math.ceil(last) + 1).filter(
            (t) => t % unit === 0,
          );
      if (unit !== null && ticksCount < tickValues.length) {
        tickValues = tickValues.filter((v, i) => {
          if (i === 0 || i === tickValues.length - 1) {
            return true;
          }
          const interval = Math.floor(
            (tickValues.length - 2) / (ticksCount - 2),
          );
          return i % interval === 0 && tickValues.length - interval > i;
        });
      }

      humanizerConfig.current = {
        units: [formatUnit],
      };

      xAxisTicks
        .ticks(ticksCount)
        .tickValues(tickValues)
        .tickFormat((d, i) =>
          shortEnglishHumanizer(Math.round(+d * 1000), humanizerConfig.current),
        );
    } else if (xAlignment === 'absolute_time') {
      let ticksCount = Math.floor(plotBox.current.width / 120);
      ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
      const tickValues = _.range(...chartOptions.current.xScale.domain());

      xAxisTicks
        .ticks(ticksCount > 1 ? ticksCount - 1 : 1)
        .tickValues(
          tickValues.filter((v, i) => {
            if (i === 0 || i === tickValues.length - 1) {
              return true;
            }
            const interval = Math.floor(
              (tickValues.length - 2) / (ticksCount - 2),
            );
            return i % interval === 0 && tickValues.length - interval > i;
          }),
        )
        .tickFormat((d, i) => moment.unix(d).format('HH:mm:ss D MMM, YY'));
    } else {
      const ticksCount = Math.floor(plotBox.current.width / 50);
      xAxisTicks.ticks(ticksCount > 1 ? ticksCount - 1 : 1);
    }

    const xAxis = axes.current
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${plotBox.current.height})`)
      .call(xAxisTicks);

    const initialTicks = axes.current.selectAll('.tick');
    const ticksPositions = [];
    initialTicks.each((data) => {
      ticksPositions.push(chartOptions.current.xScale(data));
    });

    for (let i = ticksPositions.length - 1; i > 0; i--) {
      let currentTickPos = ticksPositions[i];
      let prevTickPos = ticksPositions[i - 1];
      if (currentTickPos - prevTickPos < 10) {
        xAxis.select(`.tick:nth-of-type(${i})`).attr('hidden', true);
      }
    }

    if (isXLogScale) {
      xAxis
        .selectAll('text')
        .style('text-anchor', 'middle')
        .attr('dx', '-0.7em')
        .attr('dy', '0.7em')
        .attr(
          'transform',
          `rotate(${xAlignment === 'absolute_time' ? -10 : -40})`,
        );
    }

    svg.current
      .append('text')
      .attr(
        'transform',
        `translate(
        ${visBox.current.width - 20},
        ${
          visBox.current.height -
          (visBox.current.margin.bottom + (isXLogScale ? 5 : 0)) -
          5
        }
      )`,
      )
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'ideographic')
      .style('font-size', '0.7em')
      .style('text-transform', 'capitalize')
      .style('fill', 'var(--grey)')
      .text(
        xAlignment
          ? `${xAlignment.replace('_', ' ')}${
              xAlignment === 'step' || xAlignment === 'epoch' ? 's' : ''
            }`
          : 'steps',
      );

    plot.current.moveToFront();

    const yAxisTicks = d3.axisLeft(chartOptions.current.yScale);
    const ticksCount = Math.floor(plotBox.current.height / 20);
    yAxisTicks.ticks(ticksCount > 3 ? (ticksCount < 20 ? ticksCount : 20) : 3);

    axes.current
      .append('g')
      .attr('class', 'yAxis')
      .each(function (d, i) {
        d3.select(this)
          .call(yAxisTicks)
          .selectAll('.tick')
          .append('foreignObject')
          .attr('x', -50)
          .attr('y', -6)
          .attr('height', 12)
          .attr('width', 40)
          .html((d) => `<div class='yAxis__text' title='${d}'>${d}</div>`);
      });
  }

  function drawLines() {
    const { chart } = HubMainScreenModel.getState();
    const highlightMode = chart.settings.highlightMode;

    const focusedMetric = chart.focused.metric;
    const focusedCircle = chart.focused.circle;
    const focusedLineAttr =
      focusedCircle.runHash !== null ? focusedCircle : focusedMetric;

    const noSelectedRun =
      highlightMode === 'default' || !focusedLineAttr.runHash;

    lines.current.classed('highlight', !noSelectedRun);

    const line = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(
        d3[
          curveOptions[
            chart.settings.persistent.interpolate &&
            !chart.settings.persistent.aggregated
              ? 5
              : 0
          ]
        ],
      );

    for (let traceKey in traces.current) {
      let trace = traces.current[traceKey];

      const active =
        highlightMode === 'run' && focusedLineAttr.runHash === trace.runHash;
      const current =
        focusedLineAttr.runHash === trace.runHash &&
        focusedLineAttr.metricName === trace.metricName &&
        focusedLineAttr.traceContext === trace.traceContext;

      lines.current
        .append('path')
        .attr(
          'class',
          `PlotLine PlotLine-${btoa(trace.runHash).replace(
            /[\=\+\/]/g,
            '',
          )} PlotLine-${traceKey} ${active ? 'active' : ''} ${
            current ? 'current' : ''
          }`,
        )
        .datum(trace.data)
        .attr('d', line)
        .attr('clip-path', 'url(#lines-rect-clip-' + props.index + ')')
        .style('fill', 'none')
        .style('stroke', trace.color)
        .style('stroke-dasharray', trace.stroke)
        .attr('data-run-hash', trace.runHash)
        .attr('data-metric-name', trace.metricName)
        .attr('data-trace-context-hash', trace.traceContext)
        .on('click', function () {
          handleLineClick(d3.mouse(this));
        });
    }
  }

  function drawAggregatedLines() {
    const { traceList, chart, contextFilter } = HubMainScreenModel.getState();
    const focusedMetric = chart.focused.metric;
    const focusedCircle = chart.focused.circle;
    const highlightMode = chart.settings.highlightMode;
    const focusedLineAttr =
      focusedCircle?.runHash !== null
        ? focusedCircle
        : focusedMetric.runHash !== null
          ? focusedMetric
          : null;

    const noSelectedRun =
      highlightMode === 'default' || !focusedLineAttr?.runHash;
    traceList?.traces.forEach((traceModel) => {
      if (traceModel.chart !== props.index) {
        return;
      }

      let areaTraceMin;
      let areaTraceMax;
      let lineTrace;

      switch (contextFilter.aggregatedArea) {
        case 'min_max':
          areaTraceMin = traceModel.aggregation.min;
          areaTraceMax = traceModel.aggregation.max;
          break;
        case 'std_dev':
          areaTraceMin = traceModel.aggregation.stdDevMin;
          areaTraceMax = traceModel.aggregation.stdDevMax;
          break;
        case 'std_err':
          areaTraceMin = traceModel.aggregation.stdErrMin;
          areaTraceMax = traceModel.aggregation.stdErrMax;
          break;
        case 'conf_int':
          areaTraceMin = traceModel.aggregation.confIntMin;
          areaTraceMax = traceModel.aggregation.confIntMax;
          break;
      }

      switch (contextFilter.aggregatedLine) {
        case 'avg':
          lineTrace = traceModel.aggregation.avg;
          break;
        case 'median':
          lineTrace = traceModel.aggregation.med;
          break;
        case 'min':
          lineTrace = traceModel.aggregation.min;
          break;
        case 'max':
          lineTrace = traceModel.aggregation.max;
          break;
      }

      const active =
        highlightMode === 'run'
          ? traceModel.hasRunWithRunHash(focusedLineAttr?.runHash)
          : traceModel.hasRun(
              focusedLineAttr?.runHash,
              focusedLineAttr?.metricName,
              focusedLineAttr?.traceContext,
          );

      if (
        contextFilter.aggregatedArea !== 'none' &&
        !!areaTraceMin &&
        !!areaTraceMax
      ) {
        let traceMinData;
        let traceMaxData;
        traceMinData = areaTraceMin?.trace.data.filter(
          (point) =>
            !Number.isNaN(chartOptions.current.xScale(point[1])) &&
            !Number.isNaN(chartOptions.current.yScale(point[0])),
        );
        traceMaxData = areaTraceMax?.trace.data.filter(
          (point) =>
            !Number.isNaN(chartOptions.current.xScale(point[1])) &&
            !Number.isNaN(chartOptions.current.yScale(point[0])),
        );

        const minLineData = calculateLineValues({
          axisValues: traceMinData.map((d) => d[1]),
          traceData: traceMinData,
          xMin: chartOptions.current.xScale.domain()[0],
          xMax: chartOptions.current.xScale.domain()[1],
          yMin: chartOptions.current.yScale.domain()[0],
          yMax: chartOptions.current.yScale.domain()[1],
          scale: {
            xScale: chart.settings.persistent.xScale ?? 0,
            yScale: chart.settings.persistent.yScale ?? 0,
          },
        });

        const maxLineData = calculateLineValues({
          axisValues: traceMaxData.map((d) => d[1]),
          traceData: traceMaxData,
          xMin: chartOptions.current.xScale.domain()[0],
          xMax: chartOptions.current.xScale.domain()[1],
          yMin: chartOptions.current.yScale.domain()[0],
          yMax: chartOptions.current.yScale.domain()[1],
          scale: {
            xScale: chart.settings.persistent.xScale ?? 0,
            yScale: chart.settings.persistent.yScale ?? 0,
          },
        });

        const areaMinMax = [];
        const len = Math.max(minLineData.length, maxLineData.length);

        for (let i = 0; i < len; i++) {
          areaMinMax.push({
            min: minLineData[i] ?? minLineData[minLineData.length - 1],
            max: maxLineData[i] ?? maxLineData[maxLineData.length - 1],
          });
        }

        const area = d3
          .area()
          .x0((d) => d.max.x)
          .x1((d) => d.min.x)
          .y0((d) => d.max.y)
          .y1((d) => d.min.y)
          .curve(d3[curveOptions[0]]);

        lines.current
          .append('path')
          .attr(
            'class',
            `PlotArea ${noSelectedRun ? '' : 'inactive'} ${
              active ? 'active' : ''
            }`,
          )
          .datum(areaMinMax)
          .attr('d', area)
          .attr('clip-path', 'url(#lines-rect-clip-' + props.index + ')')
          .attr(
            'fill',
            Color(
              traceList?.grouping?.color?.length > 0
                ? traceModel.color
                : getMetricColor(
                  lineTrace.run,
                  lineTrace.metric,
                    lineTrace?.trace,
                ),
            )
              .alpha(0.3)
              .hsl()
              .string(),
          )
          .on('click', function () {
            handleLineClick(d3.mouse(this));
          });
      }

      const lineTraceData = lineTrace?.trace?.data.filter(
        (point) => !Number.isNaN(chartOptions.current.xScale(point[1])),
      );

      if (!!lineTraceData) {
        const aggLineTraceData = calculateLineValues({
          axisValues: lineTraceData.map((d) => d[1]),
          traceData: lineTraceData,
          xMin: chartOptions.current.xScale.domain()[0],
          xMax: chartOptions.current.xScale.domain()[1],
          yMin: chartOptions.current.yScale.domain()[0],
          yMax: chartOptions.current.yScale.domain()[1],
          scale: {
            xScale: chart.settings.persistent.xScale ?? 0,
            yScale: chart.settings.persistent.yScale ?? 0,
          },
        });
        const aggLineFunc = d3
          .line()
          .x((d) => d.x)
          .y((d) => d.y)
          .curve(d3[curveOptions[0]]);
        lines.current
          .append('path')
          .attr(
            'class',
            `PlotLine PlotLine-${traceToHash(
              lineTrace.run.run_hash,
              lineTrace.metric.name,
              lineTrace.trace.context,
            )} active`,
          )
          .datum(aggLineTraceData)
          .attr('d', aggLineFunc)
          .attr('clip-path', 'url(#lines-rect-clip-' + props.index + ')')
          .style('fill', 'none')
          .style(
            'stroke',
            traceList?.grouping?.color?.length > 0
              ? traceModel.color
              : getMetricColor(
                lineTrace.run,
                lineTrace.metric,
                lineTrace.trace,
              ),
          )
          .style(
            'stroke-dasharray',
            traceList?.grouping?.stroke?.length > 0 ? traceModel.stroke : '0',
          )
          .attr('data-run-hash', lineTrace.run.run_hash)
          .attr('data-metric-name', lineTrace.metric.name)
          .attr(
            'data-trace-context-hash',
            contextToHash(lineTrace.trace.context),
          )
          .on('click', function () {
            handleLineClick(d3.mouse(this));
          });
      }

      if (!noSelectedRun) {
        let runIndex = 0;
        traceList?.traces.forEach((traceModel) => {
          traceModel.series.forEach((series) => {
            if (traceModel.chart !== props.index) {
              runIndex++;
              return;
            }
            const { run, metric, trace } = series;

            if (run.metricIsHidden) {
              runIndex++;
              return;
            }

            const traceContext = contextToHash(trace?.context);
            let activeRun =
              highlightMode === 'run'
                ? focusedLineAttr.runHash === run.run_hash
                : false;
            const current =
              focusedLineAttr.runHash === run.run_hash &&
              focusedLineAttr.metricName === metric?.name &&
              focusedLineAttr.traceContext === traceContext;
            if (!current && !activeRun) {
              runIndex++;
              return;
            }
            const traceData = [];
            const axisValues = trace.axisValues.filter((xVal, i) => {
              const isXLogScale =
                scaleOptions[chart.settings.persistent.xScale] === 'log';
              const isYLogScale =
                scaleOptions[chart.settings.persistent.yScale] === 'log';
              if (
                (isXLogScale && xVal <= 0) ||
                (isYLogScale && trace?.data[i]?.[0] <= 0)
              ) {
                return false;
              }
              if (!!trace?.data) {
                traceData.push(trace.data[i]);
              }
              return true;
            });

            const lineData = calculateLineValues({
              axisValues: axisValues,
              traceData: traceData,
              xMin: chartOptions.current.xScale.domain()[0],
              xMax: chartOptions.current.xScale.domain()[1],
              yMin: chartOptions.current.yScale.domain()[0],
              yMax: chartOptions.current.yScale.domain()[1],
              scale: {
                xScale: chart.settings.persistent.xScale ?? 0,
                yScale: chart.settings.persistent.yScale ?? 0,
              },
            });
            const focusedLine = d3
              .line()
              .x((d) => d.x)
              .y((d) => d.y)
              .curve(
                d3[
                  curveOptions[
                    chart.settings.persistent.interpolate &&
                    !chart.settings.persistent.aggregated
                      ? 5
                      : 0
                  ]
                ],
              );

            lines.current
              .append('path')
              .attr(
                'class',
                `PlotLine PlotLine-${
                  focusedLineAttr?.runHash
                } PlotLine-${traceToHash(
                  focusedLineAttr?.runHash,
                  focusedLineAttr?.metricName,
                  focusedLineAttr?.traceContext,
                )} ${activeRun ? 'active' : ''} ${current ? 'current' : ''}`,
              )
              .datum(lineData)
              .attr('d', focusedLine)
              .attr('clip-path', 'url(#lines-rect-clip-' + props.index + ')')
              .style('fill', 'none')
              .style(
                'stroke',
                traceList?.grouping?.color?.length > 0
                  ? traceModel.color
                  : getMetricColor(run, metric, trace, runIndex),
              )
              .style(
                'stroke-dasharray',
                traceList?.grouping?.stroke?.length > 0
                  ? traceModel.stroke
                  : '0',
              )
              .attr('data-run-hash', run.run_hash)
              .attr('data-metric-name', metric?.name)
              .attr('data-trace-context-hash', traceContext)
              .on('click', function () {
                handleLineClick(d3.mouse(this));
              });
            runIndex++;
          });
        });
      }
    });
  }

  function drawHoverAttributes() {
    const { chart, traceList, contextFilter } = HubMainScreenModel.getState();
    const highlightMode = chart.settings.highlightMode;
    const focused = chart.focused;
    let step = focused.circle.active ? focused.circle.step : focused.step;
    if (step === null || step === undefined) {
      return;
    }

    let x = chartOptions.current.xScale(step);

    const { height, width } = plotBox.current;
    const isXLogScale =
      scaleOptions[chart.settings.persistent.xScale] === 'log';
    const isYLogScale =
      scaleOptions[chart.settings.persistent.yScale] === 'log';

    const visArea = d3.select(visRef.current);

    if (!isXLogScale || step > 0) {
      // Draw vertical hover line
      const [xMinValue, xMaxValue] = chartOptions.current.xScale.domain();
      const [xMin, xMax] = chartOptions.current.xScale.range();
      const lineX = x < xMin ? xMin : x > xMax ? xMax : x;
      attributes.current
        .append('line')
        .attr('x1', lineX)
        .attr('y1', 0)
        .attr('x2', lineX)
        .attr('y2', height)
        .attr('class', 'HoverLine')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '4 2')
        .style('fill', 'none');

      if (xAxisValue.current) {
        xAxisValue.current.remove();
        xAxisValue.current = null;
      }

      const xAlignment = chart.settings.persistent.xAlignment;
      let xAxisValueText;
      let xAxisTickValue =
        +step < xMinValue ? xMinValue : +step > xMaxValue ? xMaxValue : +step;

      switch (xAlignment) {
        case 'epoch':
          const epochs = Object.keys(traceList.epochSteps[props.index]);
          xAxisValueText =
            epochs.find((epoch) =>
              traceList.epochSteps[props.index][epoch].includes(xAxisTickValue),
            ) ?? epochs[epochs.length - 1];
          break;
        case 'relative_time':
          xAxisValueText = shortEnglishHumanizer(
            Math.round(xAxisTickValue * 1000),
            {
              ...humanizerConfig.current,
              maxDecimalPoints: 2,
            },
          );
          break;
        case 'absolute_time':
          xAxisValueText = moment
            .unix(xAxisTickValue)
            .format('HH:mm:ss D MMM, YY');
          break;
        default:
          xAxisValueText = xAxisTickValue;
      }

      if (xAxisValueText !== 'null') {
        xAxisValue.current = visArea
          .append('div')
          .attr('class', 'ChartMouseValue xAxis')
          .style(
            'top',
            `${
              visBox.current.height -
              (visBox.current.margin.bottom + (isXLogScale ? 5 : 0)) +
              1
            }px`,
          )
          .text(xAxisValueText);

        const axisLeftEdge = visBox.current.margin.left - 1;
        const axisRightEdge =
          visBox.current.width - visBox.current.margin.right + 1;
        let xAxisValueWidth = xAxisValue.current.node().offsetWidth;
        if (xAxisValueWidth > width) {
          xAxisValueWidth = width;
        }
        xAxisValue.current
          .style('width', `${xAxisValueWidth}px`)
          .style(
            'left',
            `${
              x - xAxisValueWidth / 2 < 0
                ? axisLeftEdge + xAxisValueWidth / 2
                : x + axisLeftEdge + xAxisValueWidth / 2 > axisRightEdge
                  ? axisRightEdge - xAxisValueWidth / 2
                  : x + axisLeftEdge
            }px`,
          );
      }
    }

    // Draw circles
    const focusedMetric = focused.metric;
    const focusedCircle = focused.circle;
    const focusedLineAttr =
      focusedCircle.runHash !== null ? focusedCircle : focusedMetric;

    for (let traceKey in traces.current) {
      let trace = traces.current[traceKey];

      const closestStepIndex = findClosestIndex(
        trace.data.map((d) => d.x),
        chartOptions.current.xScale(step),
      );
      const closestPoint = trace.data[closestStepIndex] ?? trace.data[0];
      x = closestPoint?.x;
      const closestStep = chartOptions.current.xScale.invert(x);
      let y = closestPoint?.y;
      let val = chartOptions.current.yScale.invert(y);

      let shouldHighlightCircle;
      if (highlightMode === 'default' || !focusedLineAttr.runHash) {
        shouldHighlightCircle = true;
      } else if (highlightMode === 'run') {
        shouldHighlightCircle = focusedLineAttr.runHash === trace.runHash;
      } else if (highlightMode === 'metric') {
        shouldHighlightCircle =
          focusedLineAttr.runHash === trace.runHash &&
          focusedLineAttr.metricName === trace.metricName &&
          focusedLineAttr.traceContext === trace.traceContext;
      } else {
        shouldHighlightCircle = false;
      }

      const active =
        focusedMetric.runHash === trace.runHash &&
        focusedMetric.metricName === trace.metricName &&
        focusedMetric.traceContext === trace.traceContext;

      const focused =
        focusedCircle.runHash === trace.runHash &&
        focusedCircle.metricName === trace.metricName &&
        focusedCircle.traceContext === trace.traceContext;

      attributes.current
        .append('circle')
        .attr(
          'class',
          `HoverCircle HoverCircle-${closestStep} ${
            shouldHighlightCircle ? '' : 'inactive'
          } HoverCircle-${traceKey} ${
            focused ? 'focus' : active ? 'active' : ''
          }`,
        )
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', active || focused ? circleActiveRadius : circleRadius)
        .attr('data-x', x)
        .attr('data-y', y)
        .attr('data-step', closestStep)
        .attr('data-run-hash', trace.runHash)
        .attr('data-metric-name', trace.metricName)
        .attr('data-trace-context-hash', trace.traceContext)
        .attr('clip-path', 'url(#circles-rect-clip-' + props.index + ')')
        .style('fill', trace.color)
        .on('click', function () {
          handlePointClick(
            closestStep,
            trace.runHash,
            trace.metricName,
            trace.traceContext,
          );
          analytics.trackEvent('[Explore] [LineChart] Line point click');
        });

      if (active || focused) {
        // Draw horizontal hover line
        const [yMax, yMin] = chartOptions.current.yScale.range();
        const lineY = y < yMin ? yMin : y > yMax ? yMax : y;
        attributes.current
          .append('line')
          .attr('x1', 0)
          .attr('y1', lineY)
          .attr('x2', width)
          .attr('y2', lineY)
          .attr('class', 'HoverLine')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '4 2')
          .style('fill', 'none');

        if (yAxisValue.current) {
          yAxisValue.current.remove();
          yAxisValue.current = null;
        }

        const formattedValue = Math.round(val * 10e9) / 10e9;
        yAxisValue.current = visArea
          .append('div')
          .attr('class', 'ChartMouseValue yAxis')
          .attr('title', formattedValue)
          .style('max-width', `${visBox.current.margin.left - 5}px`)
          .style(
            'right',
            `${visBox.current.width - visBox.current.margin.left - 2}px`,
          )
          .text(formattedValue);

        const axisTopEdge = visBox.current.margin.top - 1;
        const axisBottomEdge =
          visBox.current.height - visBox.current.margin.top;
        const yAxisValueHeight = yAxisValue.current.node().offsetHeight;
        yAxisValue.current.style(
          'top',
          `${
            lineY - yAxisValueHeight / 2 < 0
              ? axisTopEdge + yAxisValueHeight / 2
              : lineY + axisTopEdge + yAxisValueHeight / 2 > axisBottomEdge
                ? axisBottomEdge - yAxisValueHeight / 2
                : lineY + axisTopEdge
          }px`,
        );
      }
    }

    // Apply focused state to line and circle
    if (focusedLineAttr.runHash !== null) {
      plot.current.selectAll('.PlotArea.active').moveToFront();
      plot.current.selectAll('.PlotLine.current').moveToFront();

      attributes.current.selectAll('circle.active').moveToFront();
      attributes.current.selectAll('circle.focus').moveToFront();
    }
  }

  function bindInteractions() {
    svg.current.on('mousemove', function () {
      handleAreaMouseMove(d3.mouse(this));
    });

    svg.current.on('mouseleave', function () {
      handleVisAreaMouseOut(d3.mouse(this));
    });

    bgRect.current.on('click', function () {
      handleBgRectClick(d3.mouse(this));
    });
  }

  function idled() {
    idleTimeout.current = null;
  }

  function handleZoomChange() {
    const { chart } = HubMainScreenModel.getState();
    let extent = d3.event.selection;

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!extent) {
      if (!idleTimeout.current) {
        return (idleTimeout.current = setTimeout(idled, 350)); // This allows to wait a little bit
      }
      setChartSettingsState({
        ...chart.settings,
        persistent: {
          ...chart.settings.persistent,
          zoom: null,
        },
      });
    } else {
      let left = chartOptions.current.xScale.invert(extent[0][0]);
      let right = chartOptions.current.xScale.invert(extent[1][0]);

      let top = chartOptions.current.yScale.invert(extent[0][1]);
      let bottom = chartOptions.current.yScale.invert(extent[1][1]);

      let [xMin, xMax] = chartOptions.current.xScale.domain();
      let [yMin, yMax] = chartOptions.current.yScale.domain();

      setChartSettingsState({
        ...chart.settings,
        zoomMode: !chart.settings.singleZoomMode,
        zoomHistory: [
          [props.index, chart.settings.persistent.zoom?.[props.index] ?? null],
        ].concat(chart.settings.zoomHistory),
        persistent: {
          ...chart.settings.persistent,
          zoom: {
            ...(chart.settings.persistent.zoom ?? {}),
            [props.index]: {
              x:
                extent[1][0] - extent[0][0] < 5
                  ? null
                  : [left < xMin ? xMin : left, right > xMax ? xMax : right],
              y:
                extent[1][1] - extent[0][1] < 5
                  ? null
                  : [bottom < yMin ? yMin : bottom, top > yMax ? yMax : top],
            },
          },
        },
      });
      // This remove the grey brush area as soon as the selection has been done
      svg.current.select('.brush').call(brush.current.move, null);
      analytics.trackEvent('[Explore] [LineChart] Line chart zoom in');
    }
  }

  function handleAreaMouseMove(mouse) {
    const { chart } = HubMainScreenModel.getState();
    // Disable hover effects if circle is focused
    if (chart.focused.circle.active) {
      return false;
    }

    // Update active state
    setActiveLineAndCircle(mouse);

    // Remove hovered line state
    unsetHoveredLine(mouse);
  }

  function handleVisAreaMouseOut(mouse) {
    const { circle } = HubMainScreenModel.getState().chart.focused;
    if (!circle.active) {
      unsetHoveredLine(mouse);
    }
  }

  function handleBgRectClick(mouse) {
    const { chart } = HubMainScreenModel.getState();
    if (!chart.focused.circle.active) {
      return;
    }

    setChartFocusedActiveState({
      circle: {
        runHash: null,
        metricName: null,
        traceContext: null,
      },
      step: null,
    });

    // Update active state
    setActiveLineAndCircle(mouse);
  }

  function handleLineClick(mouse) {
    const { chart } = HubMainScreenModel.getState();
    if (!chart.focused.circle.active) {
      return;
    }

    setChartFocusedActiveState({
      circle: {
        active: false,
        runHash: null,
        metricName: null,
        traceContext: null,
        step: null,
      },
      step: null,
    });

    // Update active state
    setActiveLineAndCircle(mouse, false);
  }

  function handlePointClick(step, runHash, metricName, traceContext) {
    setChartFocusedActiveState({
      circle: {
        active: true,
        step,
        runHash,
        metricName,
        traceContext,
      },
      metric: {
        runHash: null,
        metricName: null,
        traceContext: null,
      },
    });

    setTimeout(() => {
      let activeRow = document.querySelector('.ContextBox__table__cell.active');
      if (activeRow) {
        activeRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });
  }

  function setActiveLineAndCircle(mouse, marginInc = true) {
    const { chart } = HubMainScreenModel.getState();
    const { margin } = visBox.current;

    if (isMouseInVisArea(mouse)) {
      const data = chartOptions.current.xSteps;
      const x = marginInc ? mouse[0] - margin.left : mouse[0];
      const y = marginInc ? mouse[1] - margin.top : mouse[1];
      let step = 0;

      if (x >= 0) {
        // Line
        const xPoint = chartOptions.current.xScale.invert(x);
        const relIndex = d3.bisect(data, xPoint, 1);
        const a = data[relIndex - 1];
        const b = data[relIndex];

        step = xPoint - a > b - xPoint ? b : a;

        if (step !== chart.focused.step) {
          setChartFocusedState({
            step,
          });
        }

        // Find the nearest circle
        if (attributes.current) {
          // Circles
          let nearestCircle = [];

          attributes.current.selectAll('.HoverCircle').each(function () {
            const elem = d3.select(this);
            const elemX = parseFloat(elem.attr('data-x'));
            const elemY = parseFloat(elem.attr('data-y'));
            const rX = Math.abs(elemX - x);
            const rY = Math.abs(elemY - y);
            const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));

            if (nearestCircle.length === 0 || r < nearestCircle[0].r) {
              nearestCircle = [
                {
                  r: r,
                  nearestCircleRunHash: elem.attr('data-run-hash'),
                  nearestCircleMetricName: elem.attr('data-metric-name'),
                  nearestCircleTraceContext: elem.attr(
                    'data-trace-context-hash',
                  ),
                },
              ];
            } else if (nearestCircle.length && r === nearestCircle[0].r) {
              nearestCircle.push({
                r: r,
                nearestCircleRunHash: elem.attr('data-run-hash'),
                nearestCircleMetricName: elem.attr('data-metric-name'),
                nearestCircleTraceContext: elem.attr('data-trace-context-hash'),
              });
            }
          });

          nearestCircle.sort((a, b) => {
            const aHash = traceToHash(
              a.nearestCircleRunHash,
              a.nearestCircleMetricName,
              a.nearestCircleTraceContext,
            );
            const bHash = traceToHash(
              b.nearestCircleRunHash,
              b.nearestCircleMetricName,
              b.nearestCircleTraceContext,
            );
            return aHash > bHash ? 1 : -1;
          });

          if (nearestCircle.length) {
            const nearestCircleRunHash = nearestCircle[0].nearestCircleRunHash;
            const nearestCircleMetricName =
              nearestCircle[0].nearestCircleMetricName;
            const nearestCircleTraceContext =
              nearestCircle[0].nearestCircleTraceContext;

            if (
              nearestCircleRunHash !== chart.focused.metric.runHash ||
              nearestCircleMetricName !== chart.focused.metric.metricName ||
              nearestCircleTraceContext !== chart.focused.metric.traceContext
            ) {
              setChartFocusedState({
                metric: {
                  runHash: nearestCircleRunHash,
                  metricName: nearestCircleMetricName,
                  traceContext: nearestCircleTraceContext,
                },
              });
            }
          }
        }
      }
    }
  }

  function unsetHoveredLine(mouse = false) {
    if (mouse === false || !isMouseInVisArea(mouse)) {
      setChartFocusedState({
        metric: {
          runHash: null,
          metricName: null,
          traceContext: null,
        },
      });
    }
  }

  function isMouseInVisArea(mouse) {
    const { chart } = HubMainScreenModel.getState();
    const { width, height, margin } = visBox.current;
    const padding = 5;
    const isXLogScale =
      scaleOptions[chart.settings.persistent.xScale] === 'log';

    return (
      mouse[0] > margin.left - padding &&
      mouse[0] < width - margin.right + padding &&
      mouse[1] > margin.top - padding &&
      mouse[1] < height - (margin.bottom + (isXLogScale ? 5 : 0)) + padding
    );
  }

  useEffect(() => {
    initD3();
    const animatedRender = () => window.requestAnimationFrame(renderChart);
    window.addEventListener('resize', animatedRender);
    const rerenderSubscription = HubMainScreenModel.subscribe(
      [
        HubMainScreenModel.events.SET_TRACE_LIST,
        HubMainScreenModel.events.SET_CHART_SETTINGS_STATE,
        HubMainScreenModel.events.SET_CHART_FOCUSED_ACTIVE_STATE,
        // HubMainScreenModel.events.SET_CHART_HIDDEN_METRICS,
      ],
      animatedRender,
    );
    const updateSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.SET_CHART_FOCUSED_STATE,
      () => {
        window.requestAnimationFrame(updateChart);
      },
    );

    return () => {
      rerenderSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      window.removeEventListener('resize', animatedRender);
    };
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(renderChart);
    return () => {
      window.cancelAnimationFrame(renderChart);
    };
  }, [props.width, props.height]);

  const styles = {};

  if (props.width !== null) {
    styles.width = props.width;
  }
  if (props.height !== null) {
    styles.height = props.height;
  }

  return (
    <div className='PanelChart' ref={parentRef} style={styles}>
      <div ref={visRef} className='PanelChart__svg' />
    </div>
  );
}

PanelChart.defaultProps = {
  index: 0,
  width: null,
  height: null,
  ratio: null,
};

PanelChart.propTypes = {
  index: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  ratio: PropTypes.number,
};

export default React.memo(PanelChart);
