import React, { memo } from 'react';
import Plot from 'react-plotly.js';
import _ from 'lodash-es';

import { IPlotlyVisualizerProps } from '../types';

import './PlotlyVisualizer.scss';
function PlotlyVisualizer(
  props: IPlotlyVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='PlotlyVisualizer'>
      {!_.isEmpty(props.data?.processedValue) && (
        <div className='PlotlyVisualizer__recordCnt'>
          <Plot
            data={props.data?.processedValue?.data}
            layout={props.data?.processedValue?.layout}
            className='PlotlyVisualizer__recordCnt__plotWrapper'
            useResizeHandler={true}
          />
        </div>
      )}
    </div>
  );
}

PlotlyVisualizer.displayName = 'PlotlyVisualizer';

export default memo<IPlotlyVisualizerProps>(PlotlyVisualizer);
