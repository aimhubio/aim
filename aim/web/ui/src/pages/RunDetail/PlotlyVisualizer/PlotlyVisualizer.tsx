import React, { memo } from 'react';
import Plot from 'react-plotly.js';
import _ from 'lodash-es';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { IPlotlyVisualizerProps } from '../types';

import './PlotlyVisualizer.scss';

function PlotlyVisualizer(
  props: IPlotlyVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        className='VisualizationLoader'
        isLoading={!!props.isLoading}
      >
        <div className='PlotlyVisualizer'>
          {_.isEmpty(props.data?.processedValue) ? (
            <IllustrationBlock size='xLarge' title='No Tracked Figures' />
          ) : (
            <div className='PlotlyVisualizer__recordCnt'>
              <Plot
                data={props.data?.processedValue?.data}
                layout={props.data?.processedValue?.layout}
                frames={props.data?.processedValue?.frames}
                useResizeHandler={true}
              />
            </div>
          )}
        </div>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

PlotlyVisualizer.displayName = 'PlotlyVisualizer';

export default memo<IPlotlyVisualizerProps>(PlotlyVisualizer);
