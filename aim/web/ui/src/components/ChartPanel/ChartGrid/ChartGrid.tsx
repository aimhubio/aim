import React from 'react';

import { Grid, GridSize } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { CHART_TYPES_CONFIG } from 'components/ChartPanel/config';

import { GRID_SIZE, CHART_GRID_PATTERN } from 'config/charts';

import { IChartGridProps } from '.';

import './ChartGrid.scss';

function ChartGrid({
  data,
  chartType,
  chartRefs = [],
  nameKey,
  chartProps,
  readOnly = false,
  syncHoverState,
  resizeMode,
  chartPanelOffsetHeight,
}: IChartGridProps): React.FunctionComponentElement<React.ReactNode> {
  function getGridSize(dataLength: number, index: number): GridSize {
    return (
      dataLength > 9 ? GRID_SIZE.S : CHART_GRID_PATTERN[dataLength][index]
    ) as GridSize;
  }
  return (
    <ErrorBoundary>
      {data.map((chartData: any, index: number) => {
        const Component = CHART_TYPES_CONFIG[chartType];
        const gridSize = getGridSize(data.length, index);
        return (
          <Grid
            key={`${index}-${resizeMode}-${chartPanelOffsetHeight}`}
            item
            className='ChartGrid'
            xs={gridSize}
          >
            <Component
              ref={chartRefs[index]}
              nameKey={nameKey}
              index={index}
              {...chartProps[index]}
              readOnly={readOnly}
              data={chartData}
              syncHoverState={syncHoverState}
              resizeMode={resizeMode}
            />
          </Grid>
        );
      })}
    </ErrorBoundary>
  );
}

ChartGrid.displayName = 'ChartGrid';

export default React.memo<IChartGridProps>(ChartGrid);
