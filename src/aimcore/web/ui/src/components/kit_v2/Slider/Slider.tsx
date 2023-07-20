import React from 'react';
import _ from 'lodash-es';

import Text from '../Text';
import { Caption } from '../Input/Input.style';

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
/**
 * Slider component
 * @param {number} min - min value
 * @param {number} max - max value
 * @param {number[]} value - value
 * @param {number[]} defaultValue - default value
 * @param {number[]} marks - marks
 * @param {function} onValueChange - onValueChange handler
 * @param {ISliderProps} rest - rest props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @example
 * <Slider min={0} max={100} value={[10, 20]} defaultValue={[10]} />
 */
const Slider = React.memo(
  ({
    min = 0,
    max = 100,
    value = [],
    defaultValue = [10],
    marks = [],
    disabled = false,
    onValueChange,
    onValueCommit,
    showLabel = true,
    ...props
  }: ISliderProps): React.FunctionComponentElement<React.ReactNode> => {
    const [sliderValue, setSliderValue] =
      React.useState<number[]>(defaultValue);
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    React.useEffect(() => {
      if (value.length > 0 && !_.isEqual(value, sliderValue)) {
        const { errMsg } = validate(value, min, max);
        if (errMsg) {
          setErrorMessage(errMsg);
          setSliderValue([min]);
          return;
        }
        setSliderValue(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const onChange = React.useCallback(
      (value: number[]) => {
        if (errorMessage) {
          return;
        }
        setSliderValue(value);
        if (onValueChange) {
          onValueChange(value);
        }
      },
      [errorMessage, onValueChange],
    );

    const onCommit = React.useCallback(
      (value: number[]) => {
        if (errorMessage) {
          return;
        }
        if (onValueCommit) {
          onValueCommit(value);
        }
      },
      [errorMessage, onValueCommit],
    );

    function getMarkPosition(mark: number) {
      // The mark position is calculated based on the min and max values
      const markPosition = ((mark - min) / (max - min)) * 100;

      // The coefficient is needed to align the mark with the thumb
      const calcCoif: number = 5 - markPosition * 0.1;
      return `calc(${markPosition}% + ${calcCoif}px)`;
    }

    return (
      <>
        <SliderRoot
          value={sliderValue}
          defaultValue={defaultValue}
          disabled={disabled || !!errorMessage}
          min={min}
          max={max}
          onValueChange={onChange}
          onValueCommit={onCommit}
          data-testid='slider'
          {...props}
        >
          <SliderTrack className='SliderTrack'>
            <SliderRange className='SliderRange' />
          </SliderTrack>
          {sliderValue.map((value: number, index) => (
            <SliderThumb className='SliderThumb' key={index}>
              {!showLabel || errorMessage ? null : (
                <SliderLabel className='SliderLabel'>{value}</SliderLabel>
              )}
            </SliderThumb>
          ))}
          {!errorMessage &&
            marks.length > 0 &&
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
        {errorMessage ? <Caption error={true}>{errorMessage}</Caption> : null}
      </>
    );
  },
);

Slider.displayName = 'Slider';
export default Slider;

function validate(value: number[], min: number, max: number) {
  const minValue = Math.min(...value);
  const maxValue = Math.max(...value);
  if (min >= max) {
    return { errMsg: 'Min value should be less than max value' };
  }
  if (minValue < min || maxValue > max) {
    return {
      errMsg: `Value(s) should be between ${min} and ${max}`,
    };
  }
  return { errMsg: '' };
}
