import React, { memo } from 'react';

import { Text } from 'components/kit';

import { IImagesVisualizerProps } from '../types';

import './ImagesVisualizer.scss';

function ImagesVisualizer(
  props: IImagesVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='ImagesVisualizer'>
      {props.data?.processedValues && (
        <>
          <div>images set here</div>
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

ImagesVisualizer.displayName = 'ImagesVisualizer';

export default memo<IImagesVisualizerProps>(ImagesVisualizer);
