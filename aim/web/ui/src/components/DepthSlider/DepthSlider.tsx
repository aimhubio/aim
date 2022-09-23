import React from 'react';
import classNames from 'classnames';

import { Button, Icon, Slider } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IDepthSliderProps } from '.';

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
    (value: number, i: number) => {
      if (typeof onDepthChange === 'function') {
        onDepthChange(value, i);
      }
    },
    [onDepthChange],
  );
  const maxDepthValue = items.length - 1;
  return items.length === 0 ? null : (
    <ErrorBoundary>
      <div
        className={classNames('DepthSlider', { [className]: !!className })}
        style={style}
      >
        <Slider
          label={label}
          aria-labelledby='track-false-slider'
          track={false}
          valueLabelDisplay={valueLabelDisplay}
          getAriaValueText={(value) => `${items[value]}`}
          value={depth}
          onChange={(e, value) => onChange(value as number, index)}
          step={null}
          marks={sliderMarks}
          min={0}
          max={maxDepthValue}
          prevIconNode={
            <Button
              onClick={() => depth > 0 && onChange(depth - 1, index)}
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
              onClick={() =>
                depth < maxDepthValue && onChange(depth + 1, index)
              }
              className='nextIconBtn'
              disabled={depth >= maxDepthValue}
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
