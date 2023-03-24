import * as SliderPrimitive from '@radix-ui/react-slider';

import { styled } from 'config/stitches';

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

export {
  SliderRoot,
  SliderMark,
  SliderTrack,
  SliderRange,
  SliderThumb,
  SliderLabel,
};
