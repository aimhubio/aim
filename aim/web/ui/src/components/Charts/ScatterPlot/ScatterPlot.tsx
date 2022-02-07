/* eslint-disable react/prop-types */
import React, { forwardRef, memo } from 'react';
import { scaleLinear, axisLeft, axisBottom } from 'd3';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { getMaxValue } from './util';
import Circles from './Circles/Circles';
import Axis from './Axis/Axis';
import { IScatterPlotProps } from './types';
import widthResize from './withResize.jsx';
import { DEFAULT_CONTAINER_HEIGHT, DEFAULT_CONTAINER_WIDTH } from './config';

const margin = { top: 50, right: 50, bottom: 60, left: 60 };

/**
 * ScatterPlot Component
 * @Usage
 *  const dataSets: DataSet[] = [
       {
          label: 'Blue',
          data: [
            [20, 30],
            [15, 100],
            [100, 30],
            [80, 1000],
          ],
          circleRadius: 10,
          circleColor: 'blue',
        },
       {
          label: 'Yellow',
          data: [
            [10, 100],
            [20, 100],
            [12, 70],
            [50, 5000],
          ],
          circleRadius: 5,
          circleColor: 'yellow',
        },
       ];

      <ScatterPlot dataSets={dataSets} />
      <ScatterPlot dataSets={dataSets} yAxisLabel='Blue' xAxisLabel='Yellow' /> // need to use yAxisLabel and xAxisLabel inside module
  */
const ScatterPlot = forwardRef<any, IScatterPlotProps>(
  (props, ref): React.FunctionComponentElement<any> => {
    const {
      width = DEFAULT_CONTAINER_WIDTH,
      height = DEFAULT_CONTAINER_HEIGHT,
      yAxisLabel,
      xAxisLabel,
      dataSets,
    } = props;

    const dataDependency: number[] = [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dataSets.forEach(({ data }) => dataDependency.push(...data));

    const { graphWidth, graphHeight } = {
      graphWidth: width - margin.left - margin.right,
      graphHeight: height - margin.top - margin.bottom,
    };

    const x_scale = scaleLinear()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .domain([0, getMaxValue(dataDependency, 0)])
      .range([0, graphWidth]);

    const y_scale = scaleLinear()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .domain([0, getMaxValue(dataDependency, 1)])
      .range([graphHeight, 0]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (
      <ErrorBoundary>
        <div className='Aim_ScatterPlotWrapper' ref={ref}>
          <svg className='Aim_ScatterPlot' width={width} height={height}>
            <g
              transform={`translate(${margin.left}, ${margin.top})`}
              className='Aim_ScatterPlot'
            >
              {dataSets?.map((group, i) => {
                return (
                  group.data && (
                    <Circles
                      data={group.data}
                      scale={{ x_scale, y_scale }}
                      color={group.circleColor}
                      radius={group.circleRadius}
                      key={i}
                    />
                  )
                );
              })}
              <Axis
                transform={`translate(0, ${graphHeight})`}
                scale={axisBottom(x_scale)}
                label={xAxisLabel}
              />
              <Axis
                transform='translate(0,0)'
                scale={axisLeft(y_scale)}
                label={yAxisLabel}
              />
            </g>
          </svg>
        </div>
      </ErrorBoundary>
    );
  },
);

ScatterPlot.displayName = 'ScatterPlot';

export default memo<IScatterPlotProps>(widthResize(ScatterPlot));
