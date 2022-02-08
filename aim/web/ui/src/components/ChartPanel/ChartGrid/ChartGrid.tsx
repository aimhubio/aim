import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';

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
  overrideProps = {},
  syncHoverState,
}: IChartGridProps): React.FunctionComponentElement<React.ReactNode> {
  // Calculation trust know that for one row we are using max 12 column from system
  const isOnlyOneRow: boolean = React.useMemo(
    () => _.sum(chartGridPattern[data.length]) === 12,
    [data],
  );

  return (
    <ErrorBoundary>
      {data.map((chartData: any, index: number) => {
        const Component = chartTypesConfig[chartType];

        const gridSize =
          data.length > 9
            ? 4
            : (chartGridPattern[data.length][index] as GridSize);
        return (
          <Grid
            key={index}
            item
            className={classNames('ChartGrid', {
              ChartGrid__single__row__chart__view: isOnlyOneRow,
            })}
            xs={gridSize}
          >
            <Component
              ref={chartRefs[index]}
              nameKey={nameKey}
              index={index}
              {...chartProps[index]}
              {...overrideProps}
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
