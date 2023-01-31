import React from 'react';
import _ from 'lodash-es';

import Text from '../Text';

import { ISliderProps } from './Slider.d';
import {
  SliderLabel,
  SliderMark,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from './Slider.style';

//TODO: Fix the thumb label overlapping issue

const Slider = React.memo(
  ({
    min = 0,
    max = 100,
    value = [],
    defaultValue = [10],
    marks = [],
    onValueChange,
    ...props
  }: ISliderProps) => {
    const [sliderValue, setSliderValue] =
      React.useState<number[]>(defaultValue);

    React.useEffect(() => {
      if (value.length > 0 && !_.isEqual(value, sliderValue)) {
        setSliderValue(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const onChange = (value: number[]) => {
      setSliderValue(value);
      if (onValueChange) {
        onValueChange(value);
      }
    };

    function getMarkPosition(mark: number) {
      // The mark position is calculated based on the min and max values
      const markPosition = ((mark - min) / (max - min)) * 100;

      // The coefficient is needed to align the mark with the thumb
      const calcCoif: number = 5 - markPosition * 0.1;
      return `calc(${markPosition}% + ${calcCoif}px)`;
    }

    return (
      <SliderRoot
        value={sliderValue}
        defaultValue={defaultValue}
        min={min}
        max={max}
        onValueChange={onChange}
        data-testid='slider'
        {...props}
      >
        <SliderTrack className='SliderTrack'>
          <SliderRange className='SliderRange' />
        </SliderTrack>
        {sliderValue.map((_: number, i: number) => (
          <SliderThumb className='SliderThumb' key={i}>
            <SliderLabel className='SliderLabel'>{sliderValue[i]}</SliderLabel>
          </SliderThumb>
        ))}

        {marks.length > 0 &&
          marks.map((mark) => {
            return (
              <SliderMark
                key={mark.value}
                data-active={
                  sliderValue?.length > 1
                    ? mark.value >= sliderValue?.[0] &&
                      mark.value <= sliderValue[sliderValue.length - 1]
                    : mark.value <= sliderValue?.[0]
                }
                css={{ left: `${getMarkPosition(mark.value)}` }}
              >
                <Text size='$1' css={{ marginTop: 33 }}>
                  {mark.label}
                </Text>
              </SliderMark>
            );
          })}
      </SliderRoot>
    );
  },
);

Slider.displayName = 'Slider';
export default React.memo(Slider);
