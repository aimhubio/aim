import React, { memo } from 'react';
import Plot from 'react-plotly.js';
import { isEmpty } from 'lodash';

import { IPlotlyVisualizerProps } from '../types';

import './PlotlyVisualizer.scss';
function PlotlyVisualizer(
  props: IPlotlyVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='PlotlyVisualizer'>
      {!isEmpty(props.data?.processedValue) && (
        <div className='PlotlyVisualizer__recordCnt'>
          <Plot
            data={props.data?.processedValue?.data}
            layout={props.data?.processedValue?.layout}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>
      )}
    </div>
  );
}

PlotlyVisualizer.displayName = 'PlotlyVisualizer';

export default memo<IPlotlyVisualizerProps>(PlotlyVisualizer);
