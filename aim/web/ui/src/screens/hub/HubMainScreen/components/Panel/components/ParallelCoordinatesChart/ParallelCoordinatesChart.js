import './ParallelCoordinatesChart.less';

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';

import {
  classNames,
  formatValue,
  getObjectValueByPath,
} from '../../../../../../../utils';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';
import * as analytics from '../../../../../../../services/analytics';

const d3 = require('d3');

const circleRadius = 3;
const circleActiveRadius = 5;
const gradientStartColor = '#2980B9';
const gradientEndColor = '#E74C3C';

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

function ParallelCoordinatesChart(props) {
  let traces = useRef([]);
  let dimensions = useRef([]);
  let closestAxis = useRef(null);
  let closestValue = useRef(null);

  let visBox = useRef({
    margin: {
      top: 60,
      right: 45,
      bottom: 25,
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
    xScale: null,
  });

  const parentRef = useRef();
  const visRef = useRef();
  const svg = useRef(null);
  const bgRect = useRef(null);
  const plot = useRef(null);
  const paths = useRef(null);
  const circles = useRef(null);
  const brushSelection = useRef(null);

  let { setChartFocusedState, setChartFocusedActiveState } =
    HubMainScreenModel.emitters;

  let { getMetricColor, traceToHash, contextToHash } =
    HubMainScreenModel.helpers;

  function initD3() {
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
  }

  function renderChart() {
    clear();
    draw(!!brushSelection.current);
  }

  function renderData() {
    clearLines();
    clearCircles();

    drawData();
  }

  function clear() {
    if (!visRef.current) {
      return;
    }

    const visArea = d3.select(visRef.current);
    visArea.selectAll('*').remove();
    visArea.attr('style', null);
  }

  function draw(recoverBrushSelection = false) {
    let { traceList } = HubMainScreenModel.getState();
    if (!visRef.current) {
      return;
    }

    if (!recoverBrushSelection) {
      traces.current = [];
      traceList?.traces.forEach((traceModel) => {
        if (traceModel.chart !== props.index) {
          return;
        }
        traces.current.push(traceModel.clone());
      });
      dimensions.current = getDimensions(traces.current);
    }

    drawArea(recoverBrushSelection);
  }

  function handleAreaMouseMove(mouse) {
    let { chart } = HubMainScreenModel.getState();
    if (chart.focused.circle.active) {
      return false;
    }
    const x = mouse[0] - visBox.current.margin.left;
    const y = mouse[1] - visBox.current.margin.top;
    let diffX;
    let diffY;
    let axis;
    let currAxis = null;
    let currValue = null;
    let currIndex;
    const prevAxis = closestAxis.current;
    dimensions.current.forEach((dim, index) => {
      axis = chartOptions.current.xScale(index);
      if (index === 0) {
        diffX = Math.abs(x - axis);
        currAxis = axis;
        currIndex = index;
      } else if (diffX > Math.abs(x - axis)) {
        diffX = Math.abs(x - axis);
        currAxis = axis;
        currIndex = index;
      }
    });
    if (currAxis !== closestAxis.current) {
      closestAxis.current = currAxis;
      window.requestAnimationFrame(renderData);
    }
    let runHash;
    let param;
    let contentType;
    traces.current.forEach((traceModel) =>
      traceModel.series.forEach((series, index) => {
        const params = series.getParamsFlatDict();
        const { run } = series;
        let dim = dimensions.current[currIndex];
        let val;

        if (dim.contentType === 'param') {
          // check if data element has property and contains a value
          if (!(dim.key in params) || params[dim.key] === null) {
            return null;
          }
          val = params[dim.key];
        } else {
          val = series.getAggregatedMetricValue(dim.metricName, dim.context);
        }
        if (dim.scale(val) !== undefined) {
          if (currValue === null || diffY > Math.abs(y - dim.scale(val))) {
            currValue = dim.scale(val);
            diffY = Math.abs(y - currValue);
            runHash = run.run_hash;
            param = dim.key;
            contentType = dim.contentType;
          }
        }
      }),
    );
    if (
      currValue !== null &&
      (currValue !== closestValue.current || prevAxis !== currAxis)
    ) {
      closestValue.current = currValue;
      setChartFocusedState({
        metric: {
          runHash: runHash,
          metricName: null,
          traceContext: null,
          param,
          contentType,
        },
      });
    }
  }

  function handleAreaMouseOut() {
    closestAxis.current = null;
    closestValue.current = null;
    setChartFocusedState({
      metric: {
        runHash: null,
        metricName: null,
        traceContext: null,
      },
    });
  }

  function handleBgRectClick() {
    let { chart } = HubMainScreenModel.getState();
    if (!chart.focused.circle.active) {
      return;
    }

    setChartFocusedState({
      circle: {
        runHash: null,
        metricName: null,
        traceContext: null,
      },
    });
  }

  function getDimensions(traces) {
    let { runs } = HubMainScreenModel.getState();
    const types = {
      number: {
        key: 'number',
        coerce: (d) => +d,
        extent: d3.extent,
        within: (d, extent, dim) =>
          extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1],
        defaultScale: (height) => d3.scaleLinear().range([height, 0]),
      },
      string: {
        key: 'string',
        coerce: String,
        extent: (data) =>
          data.sort((a, b) =>
            `${b}`.localeCompare(`${a}`, 'en', { numeric: true }),
          ),
        within: (d, extent, dim) =>
          extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1],
        defaultScale: (height) => d3.scalePoint().range([0, height]),
      },
      date: {
        key: 'date',
        coerce: (d) => new Date(d),
        extent: d3.extent,
        within: (d, extent, dim) =>
          extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1],
        defaultScale: (height) => d3.scaleTime().range([height, 0]),
      },
    };

    const dimensions = [];

    runs.params.forEach((param) => {
      let dimensionType;

      let allNum = true,
        dimensionExists = false;
      traces.forEach((traceModel) =>
        traceModel.series.forEach((series) => {
          const seriesParam = getObjectValueByPath(series.run.params, param);
          if (seriesParam !== undefined) {
            if (typeof seriesParam !== 'number') {
              allNum = false;
            }
            if (typeof seriesParam !== 'undefined') {
              dimensionExists = true;
            }
          }
        }),
      );

      if (!dimensionExists) {
        return;
      }

      if (allNum) {
        dimensionType = types['number'];
      } else {
        dimensionType = types['string'];
      }

      dimensions.push({
        key: param,
        type: dimensionType,
        contentType: 'param',
      });
    });

    Object.keys(runs.aggMetrics).forEach((metric) => {
      runs.aggMetrics[metric].forEach((context) => {
        let allNum = true;
        traces.forEach((traceModel) =>
          traceModel.series.forEach((series) => {
            const aggValue = series.getAggregatedMetricValue(metric, context);
            if (
              typeof aggValue !== 'undefined' &&
              typeof aggValue !== 'number'
            ) {
              allNum = false;
              return;
            }
          }),
        );
        dimensions.push({
          key: `metric-${metric}-${JSON.stringify(context)}`,
          type: allNum ? types['number'] : types['string'],
          contentType: 'metric',
          context: context,
          metricName: metric,
        });
      });
    });

    return dimensions;
  }

  function drawArea(recoverBrushSelection) {
    let { traceList } = HubMainScreenModel.getState();
    const parent = d3.select(parentRef.current);
    const parentRect = parent.node().getBoundingClientRect();

    const { margin } = visBox.current;
    const width = parentRect.width;
    const height = parentRect.height;

    const xScale = d3
      .scalePoint()
      .domain(d3.range(dimensions.current.length))
      .range([0, width - margin.left - margin.right]);

    visBox.current = {
      ...visBox.current,
      width,
      height,
    };

    plotBox.current = {
      ...plotBox.current,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };

    chartOptions.current.xScale = xScale;

    const devicePixelRatio = window.devicePixelRatio || 1;

    const container = d3
      .select(visRef.current)
      .append('div')
      .attr('class', 'ParallelCoordinates')
      .style('width', `${visBox.current.width}px`)
      .style('height', `${visBox.current.height}px`);
    // .on('mouseout', function() {
    //   handleAreaMouseOut();
    // });

    svg.current = container
      .append('svg')
      .attr('width', visBox.current.width)
      .attr('height', visBox.current.height)
      .on('mousemove', function () {
        handleAreaMouseMove(d3.mouse(this));
      });

    bgRect.current = svg.current
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .style('fill', 'transparent')
      .on('click', handleBgRectClick);

    if (traceList?.grouping.chart) {
      const titleMarginTop = 2;
      const titleHeight = 15;
      svg.current
        .append('foreignObject')
        .attr('x', 0)
        .attr('y', titleMarginTop)
        .attr('height', titleHeight)
        .attr('width', width)
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
            <div class='ParCoordsChartTitle' title='#${index} ${title}'>
              <div style='width: ${titleHeight}px; height: ${titleHeight}px;' class='ParCoordsChartTitle__index'>${index}</div>
              <div class='ParCoordsChartTitle__text'>${title}</div>
            </div>`;
        })
        .moveToFront();
    }

    plot.current = svg.current
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    paths.current = plot.current.append('g').attr('class', 'Lines');

    const axis = plot.current
      .selectAll('.ParCoordsAxis')
      .data(dimensions.current)
      .enter()
      .append('g')
      .attr('class', (d) => `ParCoordsAxis ParCoordsAxis-${d.key}`)
      .attr(
        'transform',
        (d, i) => `translate(${chartOptions.current.xScale(i)})`,
      );

    circles.current = plot.current.append('g').attr('class', 'Circles');

    traces.current.forEach((traceModel) =>
      traceModel.series.forEach((series) => {
        const seriesParams = series.getParamsFlatDict();

        dimensions.current.forEach((p) => {
          if (p.contentType !== 'param') {
            return;
          }
          seriesParams[p.key] = !seriesParams[p.key]
            ? null
            : p.type.coerce(seriesParams[p.key]);
        });

        // Truncate long text strings to fit in data table
        for (let key in seriesParams) {
          if (
            seriesParams[key] &&
            typeof seriesParams[key] === 'string' &&
            seriesParams[key].length > 20
          )
            seriesParams[key] = seriesParams[key].slice(0, 21);
        }
      }),
    );

    const d3_functor = (v) => (typeof v === 'function' ? v : () => v);

    // Type/dimension default setting happens here
    dimensions.current.forEach((dim) => {
      if (!('domain' in dim)) {
        // Detect domain using dimension type's extent function
        const domain = [];
        if (dim.contentType === 'param') {
          traces.current.forEach((traceModel) =>
            traceModel.series.forEach((series) => {
              const param = series.getParamsFlatDict()[dim.key];
              if (param !== undefined) {
                domain.push(param);
              }
            }),
          );
        } else {
          traces.current.forEach((traceModel) =>
            traceModel.series.forEach((series) => {
              const aggValue = series.getAggregatedMetricValue(
                dim.metricName,
                dim.context,
              );
              if (aggValue !== undefined) {
                domain.push(aggValue);
              }
            }),
          );
        }
        dim.domain = d3_functor(dim.type.extent)(domain);
      }
      if (!('scale' in dim)) {
        // Use type's default scale for dimension
        dim.scale = dim.type.defaultScale(plotBox.current.height - 2).copy();
      }
      dim.scale.domain(dim.domain);
    });

    if (!recoverBrushSelection) {
      drawData();
    }

    const titleWidth = plotBox.current.width / (dimensions.current.length - 1);
    const titles = svg.current
      .selectAll('.ParCoordsTitle')
      .data(dimensions.current)
      .enter()
      .append('g')
      .attr('class', (d) => 'ParCoordsTitle')
      .attr('transform', (d, i) => {
        const left =
          chartOptions.current.xScale(i) + visBox.current.margin.left;
        const width =
          i === 0 || i === dimensions.current.length - 1
            ? titleWidth
            : titleWidth * 2;
        return (
          'translate(' +
          (i === 0
            ? left
            : i === dimensions.current.length - 1
              ? left - width
              : left - width / 2) +
          ', ' +
          (i % 2 === 0 ? 15 : 35) +
          ')'
        );
      })
      .append('foreignObject')
      .attr('width', (d, i) =>
        i === 0 || i === dimensions.current.length - 1
          ? titleWidth
          : titleWidth * 2,
      )
      .attr('height', 20)
      .html((d, i) => {
        const wrapperClassName = classNames({
          ParCoordsTitle__wrapper: true,
          left: i === 0,
          center: i > 0 && i < dimensions.current.length - 1,
          right: i === dimensions.current.length - 1,
          small: titleWidth < 100,
          metric: d.contentType === 'metric',
          param: d.contentType === 'param',
        });

        let description, strDescription;
        if (d.contentType === 'metric') {
          const contextDesc = !!d.context
            ? Object.keys(d.context)
              .map((k) => `${k}=${formatValue(d.context[k])}`)
              .join(', ')
            : '';
          description = contextDesc
            ? `${d.metricName} <span class='ParCoordsTitle__content__context'>${contextDesc}</span>`
            : d.metricName;
          strDescription = contextDesc
            ? `${d.metricName} ${contextDesc}`
            : d.metricName;
        } else {
          description = d.key;
          strDescription = d.key;
        }

        return `
        <div class='${wrapperClassName}'>
          <div class='ParCoordsTitle__content' title='${strDescription}'>
             ${description}
          </div>
        </div>
      `;
      });

    axis.append('g').each(function (d, i) {
      let tickWidth =
        i === 0
          ? 40
          : plotBox.current.width / (dimensions.current.length - 1) - 20;
      const renderAxis =
        'axis' in d
          ? d.axis.scale(d.scale) // Custom axis
          : d3.axisLeft().scale(d.scale); // Default axis
      d3.select(this)
        .call(renderAxis)
        .selectAll('.tick')
        .append('foreignObject')
        .attr('x', -tickWidth - 10)
        .attr('y', -6)
        .attr('height', 12)
        .attr('width', tickWidth)
        .html((d) => {
          return `<div style='width: ${tickWidth}px' class='xAxis__text' title='${d}'>${d}</div>`;
        });
    });

    // Add and store a brush for each axis.

    const brushHeight = plotBox.current.height;
    axis
      .append('g')
      .attr('class', 'ParCoordsAxis__brush')
      .each(function (d) {
        d3.select(this).call(
          (d.brush = d3
            .brushY()
            .extent([
              [-10, 0],
              [10, brushHeight],
            ])
            .on('start', handleBrushStart)
            .on('brush', function () {
              handleBrushEvent();
            })
            .on('end', function () {
              handleBrushEvent();
            })),
        );
        brushSelection.current?.find(
          (selection) => selection?.dimension.key === d.key,
        )?.extent;
        if (recoverBrushSelection) {
          d.brush.move(
            d3.select(this),
            brushSelection.current?.find(
              (selection) => selection?.dimension.key === d.key,
            )?.extent ?? null,
          );
        }
      })
      .selectAll('rect')
      .attr('x', -10)
      .attr('width', 20);

    if (recoverBrushSelection) {
      handleBrushEvent(brushSelection.current);
    }
  }

  function drawData() {
    let { traceList, chart } = HubMainScreenModel.getState();
    const focused = chart.focused;
    const focusedMetric = focused.metric;
    const focusedCircle = focused.circle;

    const lastDim = dimensions.current[dimensions.current.length - 1];
    let color;

    if (lastDim) {
      const lastDimValues = traceList?.traces
        .map((t) =>
          t.series.map((s) => {
            if (t.chart !== props.index) {
              return undefined;
            }

            if (lastDim.contentType === 'param') {
              const params = s.getParamsFlatDict();
              if (lastDim.key in params) {
                return params[lastDim.key];
              }
            } else {
              return s.getAggregatedMetricValue(
                lastDim.metricName,
                lastDim.context,
              );
            }
            return undefined;
          }),
        )
        .flat()
        .filter((v) => v !== undefined);

      const interpolationValues = lastDimValues.filter(
        (v) => typeof v === 'number',
      );

      color = d3
        .scaleSequential()
        .domain([_.min(interpolationValues), _.max(interpolationValues)])
        .interpolator(d3.interpolateRgb(gradientStartColor, gradientEndColor));
    } else {
      color = d3
        .scaleSequential()
        .interpolator(d3.interpolateRgb(gradientStartColor, gradientEndColor));
    }

    // Draw color
    if (displayParamsIndicator()) {
      const lg = circles.current
        .append('linearGradient')
        .attr('id', `ParCoordsGradient-${props.index}`)
        .attr('class', 'ParCoordsGradient')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 1);

      lg.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', gradientEndColor);

      lg.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', gradientStartColor);

      circles.current
        .append('rect')
        .attr('class', 'ParCoordsGradient__rect')
        .attr('x', plotBox.current.width)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', plotBox.current.height - 1)
        .attr('stroke', '#777')
        .attr('stroke-width', 1)
        .attr('fill', `url(#ParCoordsGradient-${props.index})`);
    }

    let runIndex = 0;

    traceList?.traces.forEach((traceModel) => {
      _.uniqBy(traceModel.series, 'run.run_hash').forEach((series) => {
        if (traceModel.chart !== props.index) {
          runIndex++;
          return;
        }
        const { run, metric, trace } = series;

        if (
          traces.current.every(
            (filteredTrace) =>
              !filteredTrace.hasRun(
                run.run_hash,
                metric?.name,
                contextToHash(trace?.context),
              ),
          )
        ) {
          runIndex++;
          return;
        }

        if (run.metricIsHidden) {
          runIndex++;
          return;
        }
        const params = series.getParamsFlatDict();

        const coords = dimensions.current.map((p, i) => {
          let val;

          if (p.contentType === 'param') {
            // check if data element has property and contains a value
            if (!(p.key in params) || params[p.key] === null) {
              return null;
            }
            val = params[p.key];
          } else {
            val = series.getAggregatedMetricValue(p.metricName, p.context);
          }

          return p.scale(val) === undefined
            ? null
            : [chartOptions.current.xScale(i), p.scale(val)];
        });

        let colorVal;
        if (lastDim?.contentType === 'metric') {
          colorVal = series.getAggregatedMetricValue(
            lastDim.metricName,
            lastDim.context,
          );
        } else {
          colorVal = params[lastDim.key];
        }

        const strokeStyle = displayParamsIndicator()
          ? lastDim?.key && !!color(colorVal)
            ? color(colorVal)
            : '#999999'
          : traceList?.grouping?.color?.length > 0
            ? traceModel.color
            : getMetricColor(series.run, null, null, runIndex);

        runIndex++;

        const strokeDashArray =
          traceList?.grouping?.stroke?.length > 0 ? traceModel.stroke : '0';

        const lineFunction = d3
          .line()
          .x((d) => d[0])
          .y((d) => d[1])
          .curve(
            d3[curveOptions[chart.settings.persistent.interpolate ? 5 : 0]],
          );

        let lines = [[]];
        let lineIndex = 0;

        coords.forEach((p, i) => {
          const prev = coords[i - 1];
          if (p === null) {
            if (i !== 0) {
              lineIndex++;
              lines[lineIndex] = [null];
              if (prev !== null) {
                lines[lineIndex].push([prev[0], prev[1]]);
              }
            }
          } else {
            if (p[0] === undefined || p[1] === undefined) {
              lineIndex++;
              lines[lineIndex] = [];
            } else {
              lines[lineIndex].push(p);
              if (
                focusedMetric.runHash === run.run_hash ||
                focusedCircle.runHash === run.run_hash ||
                closestAxis.current === p[0]
              ) {
                const param = dimensions.current[i];
                let val;
                if (param.contentType === 'param') {
                  // check if data element has property and contains a value
                  if (!(param.key in params) || params[param.key] === null) {
                    val = null;
                  }
                  val = params[param.key];
                } else {
                  val = series.getAggregatedMetricValue(
                    param.metricName,
                    param.context,
                  );
                }
                circles.current
                  .append('circle')
                  .attr(
                    'class',
                    `ParCoordsCircle ParCoordsCircle-${traceToHash(
                      run.run_hash,
                      null,
                      null,
                    )} ${
                      focusedMetric.runHash === run.run_hash ? 'highlight' : ''
                    } ${
                      focusedMetric.runHash === run.run_hash &&
                      (focusedMetric.param ?? param.key) === param.key
                        ? 'active'
                        : ''
                    } ${
                      focusedCircle.runHash === run.run_hash &&
                      (focusedCircle.param ?? param.key) === param.key
                        ? 'focus'
                        : ''
                    }`,
                  )
                  .attr('cx', p[0])
                  .attr('cy', p[1])
                  .attr(
                    'r',
                    focusedMetric.runHash === run.run_hash ||
                      (focusedCircle.runHash === run.run_hash &&
                        (focusedCircle.param ?? param.key) === param.key)
                      ? circleActiveRadius
                      : circleRadius,
                  )
                  .attr('data-x', p[0])
                  .attr('data-y', p[1])
                  .style('fill', strokeStyle)
                  .on('click', function () {
                    handlePointClick(
                      run.run_hash,
                      param.key,
                      param.contentType,
                    );
                    analytics.trackEvent(
                      '[Explore] [ParPlot] Line point click',
                    );
                  });
              }
              if (lines[lineIndex][0] === null) {
                lineIndex++;
                lines[lineIndex] = [];
                lines[lineIndex].push(p);
              }
            }
          }
        });

        lines.forEach((line) => {
          if (line[0] === null) {
            paths.current
              .append('path')
              .attr('d', lineFunction(line.slice(1)))
              .attr(
                'class',
                `ParCoordsLine ParCoordsLine-${traceToHash(
                  run.run_hash,
                  null,
                  null,
                )} silhouette`,
              )
              .style('fill', 'none');
          } else {
            paths.current
              .append('path')
              .attr('d', lineFunction(line))
              .attr(
                'class',
                `ParCoordsLine ParCoordsLine-${traceToHash(
                  run.run_hash,
                  null,
                  null,
                )}`,
              )
              .style('fill', 'none')
              .style('stroke', strokeStyle)
              .style('stroke-dasharray', strokeDashArray)
              .moveToFront();
          }
        });
      });
    });

    if (focusedCircle.runHash !== null || focusedMetric.runHash !== null) {
      const focusedLineAttr =
        focusedCircle.runHash !== null ? focusedCircle : focusedMetric;
      paths.current
        .selectAll(
          `.ParCoordsLine-${traceToHash(focusedLineAttr.runHash, null, null)}`,
        )
        .classed('active', true)
        .moveToFront();
      circles.current
        .selectAll(
          `.ParCoordsCircle-${traceToHash(
            focusedLineAttr.runHash,
            null,
            null,
          )}`,
        )
        // .classed('active', true)
        // .attr('r', circleActiveRadius)
        .moveToFront();
    }
  }

  function clearLines() {
    paths.current?.selectAll('*')?.remove();
  }

  function clearCircles() {
    circles.current?.selectAll('*')?.remove();
  }

  function displayParamsIndicator() {
    let { chart } = HubMainScreenModel.getState();
    return (
      chart?.settings?.persistent?.indicator && dimensions.current?.length > 1
    );
  }

  function handlePointClick(runHash, param, contentType) {
    setChartFocusedActiveState({
      circle: {
        active: true,
        runHash,
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
    setTimeout(() => {
      let activeRow = document.querySelector('.ContextBox__table__cell.active');
      if (activeRow) {
        activeRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });
  }

  function handleBrushStart() {
    d3.event?.sourceEvent?.stopPropagation();
  }

  function handleBrushEvent(currentBrushSelection) {
    let { traceList } = HubMainScreenModel.getState();
    let actives = [];
    plot.current
      .selectAll('.ParCoordsAxis .ParCoordsAxis__brush')
      .filter(function (d) {
        return currentBrushSelection
          ? currentBrushSelection?.find(
            (selection) => selection?.dimension.key === d.key,
          )?.extent
          : d3.brushSelection(this);
      })
      .each(function (d) {
        actives.push({
          dimension: d,
          extent: currentBrushSelection
            ? currentBrushSelection?.find(
              (selection) => selection?.dimension.key === d.key,
            )?.extent
            : d3.brushSelection(this),
        });
      });

    if (!currentBrushSelection) {
      brushSelection.current = actives.length > 0 ? actives : null;
    }
    traces.current = [];
    traceList?.traces.forEach((traceModel) => {
      if (traceModel.chart !== props.index) {
        return;
      }
      const chartTrace = traceModel.clone();

      let i = 0;
      while (i < chartTrace.seriesLength) {
        if (
          !actives.every(function (active) {
            let dim = active.dimension;
            // test if point is within extents for each active brush
            const value =
              dim.contentType === 'param'
                ? chartTrace.series[i].getParamsFlatDict()[dim.key]
                : chartTrace.series[i].getAggregatedMetricValue(
                  dim.metricName,
                  dim.context,
                );
            return dim.type.within(value, active.extent, dim);
          })
        ) {
          chartTrace.removeSeries(i);
        } else {
          i += 1;
        }
      }

      traces.current.push(chartTrace);
    });

    window.requestAnimationFrame(renderData);
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
      ],
      animatedRender,
    );
    const updateSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.SET_CHART_FOCUSED_STATE,
      () => window.requestAnimationFrame(renderData),
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

  return (
    <div className='ParallelCoordinatesChart' ref={parentRef}>
      <div ref={visRef} className='ParallelCoordinatesChart__svg' />
    </div>
  );
}

ParallelCoordinatesChart.defaultProps = {
  index: 0,
  width: null,
  height: null,
};

ParallelCoordinatesChart.propTypes = {
  index: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default React.memo(ParallelCoordinatesChart);
