import * as SliderPrimitive from '@radix-ui/react-slider';

import { styled } from 'config/stitches';

const SliderRoot = styled(SliderPrimitive.Root, {
  position: 'relative',
  display: 'flex',
  ai: 'center',
  userSelect: 'none',
  touchAction: 'none',
  cursor: 'pointer',
  '&[data-orientation="horizontal"]': {
    height: 10,
  },
  '&[data-orientation="vertical"]': {
    fd: 'column',
    width: 10,
    height: 100,
  },
  '&[data-disabled]': {
    cursor: 'unset',
    '.SliderThumb': {
      pointerEvents: 'none',
      bc: '$background-disable-neutral-light',
      opacity: 0,
    },
    '.SliderRange': {
      bc: '$background-disable-neutral-light',
    },
  },
});

const SliderMark = styled('span', {
  position: 'absolute',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  bc: '$background-default-neutral-soft',
  width: 1,
  height: 6,
  zIndex: -1,
  br: '$1',
  cursor: 'pointer',
  '&[data-active=true]': {
    bc: '$background-default-primary-plain',
  },
  '&[data-disabled=true]': {
    pointerEvents: 'none',
    bc: '$background-default-neutral-airly',
    cursor: 'unset',
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
  bc: '$background-default-neutral-gentle',
  position: 'relative',
  fg: 1,
  br: '$1',
  size: '$5',
  '&[data-orientation="horizontal"]': { height: 2 },
  '&[data-orientation="vertical"]': { width: 2 },
});

const SliderRange = styled(SliderPrimitive.Range, {
  position: 'absolute',
  bc: '$background-default-primary-plain',
  br: '$1',
  height: '100%',
});

const SliderThumb = styled(SliderPrimitive.Thumb, {
  position: 'relative',
  display: 'block',
  size: '10px',
  bc: '$background-default-primary-plain',
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
    bs: '0 0 0 2px $colors$background-focus-primary-light',
  },
});

const SliderLabel = styled('span', {
  position: 'absolute',
  width: '$1',
  height: '16px',
  top: '14px',
  left: '-5px',
  display: 'flex',
  color: '$text-default-text-deep',
  ai: 'center',
  jc: 'center',
  bc: 'white',
  br: '$3',
  fontSize: '$1',
  border: '1px solid $colors$border-default-primary-plain',
});

export {
  SliderRoot,
  SliderMark,
  SliderTrack,
  SliderRange,
  SliderThumb,
  SliderLabel,
};
