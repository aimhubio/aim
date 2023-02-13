import { Root, Item, Indicator } from '@radix-ui/react-radio-group';

import { styled } from 'config/stitches';

const StyledRadioGroup = styled(Root, {});

const IndicatorWrapper = styled('span', {
  all: 'unset',
  display: 'inline-block',
  bc: 'white',
  width: 12,
  height: 12,
  br: '$round',
  transition: '$main',
  bs: 'inset 0 0 0 1px $colors$secondary100',
  cursor: 'pointer',
});

const RadioGroupIndicator = styled(Indicator, {
  display: 'flex',
  ai: 'center',
  jc: 'center',
  width: '100%',
  height: '100%',
  position: 'relative',
  transition: '$main',
  '&::after': {
    content: '""',
    display: 'block',
    width: 6,
    height: 6,
    br: '50%',
    bc: '$primary100',
  },
});

const RadioItem = styled(Item, {
  all: 'unset',
  bc: 'white',
  size: '$1',
  br: '$round',
  transition: '$main',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  cursor: 'pointer',
  '&:hover': {
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
  '&[data-state="checked"]': {
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
});

const Flex = styled('div', {
  display: 'flex',
  '&[data-disabled]': {
    pointerEvents: 'none',
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$secondary50 !important',
    },
    [`& ${RadioGroupIndicator}`]: {
      '&::after': {
        bc: '$secondary50',
      },
    },
  },
});

const RadioLabel = styled('label', {
  cursor: 'pointer',
});

export {
  StyledRadioGroup,
  RadioItem,
  RadioGroupIndicator,
  IndicatorWrapper,
  Flex,
  RadioLabel,
};
