import React, { memo } from 'react';

import { IDistributionVisualizerProps } from '../types';

import RangePanel from './RangePanel';
import Wrapper from './temp/Wrapper';

import './DistributionsVisualizer.scss';

function DistributionsVisualizer(
  props: IDistributionVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='DistributionsVisualizer'>
      {props.data?.processedValues && (
        <>
          <Wrapper data={props.data?.processedValues} className='Visualizer' />
          <RangePanel
            items={[
              {
                name: 'density',
                sliderTitle: 'Test1',
                inputTitle: 'Test1',
                sliderTitleTooltip: 'test1-tooltip',
                inputTitleTooltip: 'test1-tooltip',
                rangeEndpoints: [10, 20],
                selectedRangeValue: [10, 20],
                inputValue: 10,
              },
            ]}
          />
        </>
      )}
    </div>
  );
}

DistributionsVisualizer.displayName = 'DistributionsVisualizer';

export default memo<IDistributionVisualizerProps>(DistributionsVisualizer);
