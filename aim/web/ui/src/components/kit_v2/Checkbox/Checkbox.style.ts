import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { styled } from 'config/stitches';

const IndeterminateIcon = styled('span', {
  width: '6px',
  height: '6px',
  bc: '$primary100',
  br: '$1',
  transition: 'all 0.2s ease-out',
});

const StyledIndicator = styled(CheckboxPrimitive.Indicator, {
  display: 'flex',
  jc: 'center',
  ai: 'center',
  height: '100%',
  width: '100%',
  color: 'white',
  transition: 'all 0.2s ease-out',
});

const IndicatorWrapper = styled('span', {
  width: '10px',
  height: '10px',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  bs: 'inset 0 0 0 1px $colors$secondary100',
  br: '$2',
  transition: 'all 0.2s ease-out',
});

const StyledCheckbox = styled(CheckboxPrimitive.Root, {
  size: '20px',
  border: 'unset',
  bc: 'transparent',
  borderRadius: '$2',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  lineHeight: 1,
  cursor: 'pointer',
  transition: 'all 0.2s ease-out',
  '&:hover': {
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
  '&:disabled': {
    pointerEvents: 'none',
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$secondary50 !important',
    },
  },
  '&[data-state=checked]': {
    '&:hover': {
      [`& ${IndicatorWrapper}`]: {
        bc: '$primary110',
      },
    },
    '&:disabled': {
      [`& ${IndicatorWrapper}`]: {
        bc: '$secondary50',
      },
    },
    [`& ${IndicatorWrapper}`]: {
      bc: '$primary100',
      bs: 'inset 0 0 0 1px transparent',
      '&:disabled': {
        bc: '$secondary50 !important',
      },
    },
  },
  '&[data-state=indeterminate]': {
    '&:hover': {
      [`& ${IndicatorWrapper}`]: {
        bs: 'inset 0 0 0 1px $colors$primary110',
      },
      [`& ${IndeterminateIcon}`]: {
        bc: '$primary110',
      },
    },
    '&:disabled': {
      [`& ${IndeterminateIcon}`]: {
        bc: '$secondary50',
      },
    },
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
});

export { StyledCheckbox, StyledIndicator, IndicatorWrapper, IndeterminateIcon };
