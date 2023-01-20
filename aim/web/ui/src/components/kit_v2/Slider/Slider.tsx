import React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { styled } from 'config/stitches/stitches.config';

const Slider = React.forwardRef(
  (
    {
      min = 0,
      max = 100,
      defaultValue = [0, 10],
      marks = [10, 20, 30, 40, 100],
      onValueChange,
      ...props
    }: any,
    forwardedRef: any,
  ) => {
    const [value, setValue] = React.useState<number[]>(defaultValue);
    function getMarkPosition(mark: number) {
      return ((mark - min) / (max - min)) * 100;
    }

    const onChange = (value: number[]) => {
      setValue(value);
      if (onValueChange) {
        onValueChange(value);
      }
    };

    function onMarkClick(e: React.SyntheticEvent<HTMLSpanElement>) {
      console.log(e.currentTarget.dataset.mark);
    }

    React.useEffect(() => {
      fixOverlappingThumbLabels();
    }, [value]);

    function fixOverlappingThumbLabels() {
      const labels = document.querySelectorAll('.SliderLabel');
      const thumbs = document.querySelectorAll('.SlierThumb');

      if (labels && thumbs) {
        for (let i = 0; i < labels.length; i++) {
          const label: any = labels[i];
          const thumb = thumbs[i];
          const thumbRect = thumb.getBoundingClientRect();
          const labelRect = label.getBoundingClientRect();
          console.log(thumbRect, labelRect);
        }
        //   console.log(
        //     '🚀 ~ file: Slider.tsx:49 ~ fixOverlappingThumbLabels ~ labelRect',
        //     labelRect.right,
        //     labelRect.left,
        //     thumbRect.right,
        //     thumbRect.left,
        //   );
        //   if (labelRect.right > thumbRect.right) {
        //     label.style.left = '10px';
        //   } else if (labelRect.left < thumbRect.left) {
        //     label.style.left = '-10px';
        //   } else {
        //     label.style.left = '-5px';
        //   }
        // }
      }
    }

    return (
      <form>
        <SliderRoot
          defaultValue={value}
          min={min}
          max={max}
          ref={forwardedRef}
          onValueChange={onChange}
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          {defaultValue.map((_: number, i: number) => (
            <SliderThumb className='SlierThumb' key={i}>
              <SliderLabel className='SliderLabel' css={{}}>
                {value[i]}
              </SliderLabel>
            </SliderThumb>
          ))}
          {marks.map((mark: number) => (
            <SliderMark
              onClick={onMarkClick}
              data-mark={mark}
              data-active={
                value.length > 0
                  ? mark >= value[0] && mark <= value[value.length - 1]
                  : mark <= value[0]
              }
              css={{ left: `${getMarkPosition(mark)}%` }}
              key={mark}
            />
          ))}
        </SliderRoot>
      </form>
    );
  },
);

const SliderRoot = styled(SliderPrimitive.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  '&[data-orientation="horizontal"]': {
    height: 20,
  },
  '&[data-orientation="vertical"]': {
    flexDirection: 'column',
    width: 20,
    height: 100,
  },
});

const SliderMark = styled('span', {
  position: 'absolute',
  bc: '#ACB2BC',
  width: 1,
  height: 6,
  zIndex: 1,
  cursor: 'pointer',
  '&[data-active=true]': {
    bc: '$primary100',
  },
  '&[data-disabled]': {
    pointerEvents: 'none',
    backgroundColor: '#CED1D7',
  },
});

const SliderTrack = styled(SliderPrimitive.Track, {
  backgroundColor: '#CED1D7',
  position: 'relative',
  flexGrow: 1,
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
  zIndex: 1,
  bc: '$primary100',
  bs: '0 1px 4px $colors$primary80',
  br: 10,
  '&:hover': 'violet',
  '&:focus': { outline: 'none', boxShadow: '0 0 0 2px $colors$primary20' },
});

const SliderLabel = styled('span', {
  position: 'absolute',
  width: '$1',
  height: '16px',
  top: '14px',
  left: '-5px',
  border: '1px solid $colors$primary100',
  bc: 'white',
  br: '$3',
  fontSize: '10px',
  display: 'flex',
  ai: 'center',
  jc: 'center',
});

export default React.memo(Slider);
