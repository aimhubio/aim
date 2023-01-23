import React from 'react';
import _ from 'lodash-es';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { styled } from 'config/stitches/stitches.config';

import Text from '../Text';

import { ISliderProps } from './Slider.d';

//TODO: Fix the thumb label overlapping issue

const Slider = React.memo(
  ({
    min = 0,
    max = 100,
    value,
    defaultValue = [10],
    marks = [],
    onValueChange,
    ...props
  }: ISliderProps) => {
    const [sliderValue, setSliderValue] =
      React.useState<number[]>(defaultValue);

    React.useEffect(() => {
      if (value) {
        if (value && !_.isEqual(value, sliderValue)) {
          setSliderValue(value);
        }
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
          marks?.map((mark) => {
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

const SliderRoot = styled(SliderPrimitive.Root, {
  position: 'relative',
  display: 'flex',
  ai: 'center',
  userSelect: 'none',
  touchAction: 'none',
  zIndex: '$1',
  '&[data-orientation="horizontal"]': {
    height: 10,
  },
  '&[data-orientation="vertical"]': {
    fd: 'column',
    width: 10,
    height: 100,
  },
});

const SliderMark = styled('span', {
  position: 'absolute',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  bc: '#ACB2BC',
  width: 1,
  height: 6,
  zIndex: -1,
  br: '$1',
  cursor: 'pointer',
  '&[data-active=true]': {
    bc: '$primary100',
  },
  '&[data-disabled]': {
    pointerEvents: 'none',
    bc: '#CED1D7',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: -6,
    left: -1,
    width: 4,
    height: 20,
    bc: 'transparent',
    br: '$1',
  },
});

const SliderTrack = styled(SliderPrimitive.Track, {
  bc: '#CED1D7',
  position: 'relative',
  fg: 1,
  br: '$1',
  size: '$5',
  '&[data-orientation="horizontal"]': { height: 2 },
  '&[data-orientation="vertical"]': { width: 2 },
});

const SliderRange = styled(SliderPrimitive.Range, {
  position: 'absolute',
  bc: '$primary100',
  br: '$1',
  height: '100%',
});

const SliderThumb = styled(SliderPrimitive.Thumb, {
  position: 'relative',
  display: 'block',
  size: '10px',
  bc: '$primary100',
  br: '$5',
  '&:parent': {
    zIndex: '$10',
  },
  '&:hover, &:focus': {
    '&:after': {
      content: '""',
      position: 'absolute',
      top: 3,
      left: 3,
      width: 4,
      height: 4,
      bc: 'white',
      br: 2,
    },
  },
  '&:focus': {
    outline: 'none',
    bs: '0 0 0 2px $colors$primary20',
  },
});

const SliderLabel = styled('span', {
  position: 'absolute',
  width: '$1',
  height: '16px',
  top: '14px',
  left: '-5px',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  bc: 'white',
  br: '$3',
  fontSize: '$1',
  border: '1px solid $colors$primary100',
});

export default Slider;
