import React from 'react';

import { Button, Icon, Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IDepthSliderProps } from './DepthSlider.d';

import './DepthSlider.scss';

function DepthSlider({
  index = 0,
  items,
  depth,
  onDepthChange,
  style = {},
  valueLabelDisplay = 'off',
  label,
  className = '',
}: IDepthSliderProps) {
  const sliderMarks = React.useMemo(() => {
    return (items as string[]).map((l, i) => ({ value: i }));
  }, [items]);
  const onChange = React.useCallback(
    (value: number) => {
      if (typeof onDepthChange === 'function') {
        onDepthChange(value, index);
      }
    },
    [onDepthChange, index],
  );
  return items.length === 0 ? null : (
    <ErrorBoundary>
      <div className={`DepthSlider ${className}`} style={style}>
        <Slider
          label={label}
          aria-labelledby='track-false-slider'
          track={false}
          valueLabelDisplay={valueLabelDisplay}
          getAriaValueText={(value) => `${items[value]}`}
          value={depth}
          onChange={(e, value) => onChange(value as number)}
          step={null}
          marks={sliderMarks}
          min={0}
          max={items.length - 1}
          prevIconNode={
            <Button
              onClick={() => depth > 0 && onChange(depth - 1)}
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
              onClick={() => depth < items.length - 1 && onChange(depth + 1)}
              className='nextIconBtn'
              disabled={depth >= items.length - 1}
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
