import * as React from 'react';
import _ from 'lodash-es';

import { drawLegends } from 'utils/d3';

import { IChartLegendsProps } from '.';

import './ChartLegends.scss';

function ChartLegends(props: IChartLegendsProps) {
  const { legendsData = {} } = props;
  const dataRef = React.useRef<typeof legendsData>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && !_.isEqual(dataRef.current, legendsData)) {
      dataRef.current = legendsData;
      drawLegends({
        legendsData,
        containerNode: containerRef.current,
      });
    }
  }, [legendsData]);

  return (
    <div className='ChartLegends'>
      <div ref={containerRef} className='ChartLegends__container' />
    </div>
  );
}

ChartLegends.displayName = 'ChartLegends';

export default React.memo<IChartLegendsProps>(ChartLegends);
