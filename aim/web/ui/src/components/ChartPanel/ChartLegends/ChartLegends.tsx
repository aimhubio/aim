import * as React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { drawLegends, LegendsModeEnum } from 'utils/d3';

import { IChartLegendsProps } from '.';

import './ChartLegends.scss';

function ChartLegends(props: IChartLegendsProps) {
  const { data = {}, mode = LegendsModeEnum.PINNED, readOnly = false } = props;
  const dataRef = React.useRef<typeof data>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && !_.isEqual(dataRef.current, data)) {
      dataRef.current = data;
      drawLegends({
        data,
        containerNode: containerRef.current,
        readOnly,
      });
    }
  }, [data, readOnly]);

  return (
    <ErrorBoundary>
      <div className={classNames('ChartLegends', { [mode]: true })}>
        <div ref={containerRef} className='ChartLegends__container' />
      </div>
    </ErrorBoundary>
  );
}

ChartLegends.displayName = 'ChartLegends';

export default React.memo<IChartLegendsProps>(ChartLegends);
