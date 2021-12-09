import React, { memo } from 'react';

import { IDistributionVisualizerProps } from '../types';

import Wrapper from './temp/Wrapper';

import './DistributionsVisualizer.scss';

function DistributionsVisualizer(
  props: IDistributionVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='DistributionsVisualizer'>
      {props.data?.processedValues && (
        <Wrapper
          data={props.data?.processedValues}
          className='Visualizer'
          iters={props.data.iters}
        />
      )}
    </div>
  );
}

DistributionsVisualizer.displayName = 'DistributionsVisualizer';

export default memo<IDistributionVisualizerProps>(DistributionsVisualizer);
