import React from 'react';

import { Button, Icon, Slider } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { MEDIA_SET_SLIDER_HEIGHT } from 'config/mediaConfigs/mediaConfigs';

import { IDepthSliderProps } from './DepthSlider.d';

import './DepthSlider.scss';

function DepthSlider({
  index,
  pathValue,
  depth,
  onDepthChange,
}: IDepthSliderProps): React.FunctionComponentElement<React.ReactNode> {
  const sliderMarks = React.useMemo(() => {
    return (pathValue as string[]).map((l, i) => ({ value: i }));
  }, [pathValue]);
  return (
    <ErrorBoundary>
      <div className='DepthSlider' style={{ height: MEDIA_SET_SLIDER_HEIGHT }}>
        <Slider
          aria-labelledby='track-false-slider'
          track={false}
          valueLabelDisplay='off'
          getAriaValueText={(value) => `${pathValue[value]}`}
          value={depth}
          onChange={(e, value) => onDepthChange?.(value as number, index)}
          step={null}
          marks={sliderMarks}
          min={0}
          max={pathValue.length - 1}
          prevIconNode={
            <Button
              onClick={() => {
                if (depth > 0) onDepthChange?.(depth - 1, index);
              }}
              className='prevIconBtn'
              disabled={depth <= 0}
              size='small'
              withOnlyIcon
            >
              <Icon name='arrow-left' fontSize={10} />
            </Button>
          }
          nextIconNode={
            <Button
              onClick={() => {
                if (depth < pathValue.length - 1)
                  onDepthChange?.(depth + 1, index);
              }}
              className='nextIconBtn'
              disabled={depth >= pathValue.length - 1}
              size='small'
              withOnlyIcon
            >
              <Icon name='arrow-right' fontSize={10} />
            </Button>
          }
        />
      </div>
    </ErrorBoundary>
  );
}

DepthSlider.displayName = 'DepthSlider';

export default React.memo<IDepthSliderProps>(DepthSlider);
