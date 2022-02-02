import React from 'react';

import { Grid, GridSize } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import chartGridPattern from 'config/chart-grid-pattern/chartGridPattern';

import { chartTypesConfig } from '../config';

import { IChartGridProps } from './ChartGrid.d';

import './ChartGrid.scss';

function ChartGrid({
  data,
  chartType,
  chartRefs = [],
  nameKey,
  chartProps,
  componentProps = {},
  syncHoverState,
}: IChartGridProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      {data.map((chartData: any, index: number) => {
        const Component = chartTypesConfig[chartType];
        const gridSize =
          data.length > 9
            ? 4
            : (chartGridPattern[data.length][index] as GridSize);
        return (
          <Grid key={index} item className='ChartGrid' xs={gridSize}>
            <Component
              ref={chartRefs[index]}
              nameKey={nameKey}
              index={index}
              {...chartProps[index]}
              {...componentProps}
              data={chartData}
              syncHoverState={syncHoverState}
            />
          </Grid>
        );
      })}
    </ErrorBoundary>
  );
}

ChartGrid.displayName = 'ChartGrid';

export default React.memo<IChartGridProps>(ChartGrid);
