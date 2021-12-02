import React, { memo } from 'react';

import { Text } from 'components/kit';

import { IDistributionVisualizerProps } from '../types';

import Wrapper from './temp/Wrapper';

import './DistributionsVisualizer.scss';

function DistributionsVisualizer(
  props: IDistributionVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='DistributionsVisualizer'>
      {props.data?.processedValues && (
        <>
          <Wrapper data={props.data?.processedValues} />
          <div className='VisualizationName'>
            <Text size={14} tint={80} weight={500}>
              {props.activeTraceContext}
            </Text>
          </div>
        </>
      )}
    </div>
  );
}

DistributionsVisualizer.displayName = 'DistributionsVisualizer';

export default memo<IDistributionVisualizerProps>(DistributionsVisualizer);
