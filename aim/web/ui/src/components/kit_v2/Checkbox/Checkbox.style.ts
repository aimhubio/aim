import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { styled } from 'config/stitches';

const IndeterminateIcon = styled('span', {
  width: '6px',
  height: '6px',
  bc: '$background-default-primary-plain',
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
  bs: 'inset 0 0 0 1px $colors$icon-default-text-soft',
  br: '$2',
  transition: 'all 0.2s ease-out',
});

const StyledCheckbox = styled(CheckboxPrimitive.Root, {
  size: '$1',
  minHeight: '$1',
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
      bs: 'inset 0 0 0 1px $colors$icon-hover-primary-bold',
    },
  },
  '&:disabled': {
    pointerEvents: 'none',
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$icon-disable-text-pastel !important',
    },
  },
  '&[data-state=checked]': {
    '&:hover': {
      [`& ${IndicatorWrapper}`]: {
        bc: '$icon-hover-primary-bold',
      },
    },
    '&:disabled': {
      [`& ${IndicatorWrapper}`]: {
        bs: 'unset !important',
        bc: '$icon-disable-primary-soft',
      },
    },
    [`& ${IndicatorWrapper}`]: {
      bc: '$icon-focus-primary-plain',
      bs: 'inset 0 0 0 1px transparent',
      '&:disabled': {
        bc: '$background-text-disable-pastel !important',
      },
    },
  },
  '&[data-state=indeterminate]': {
    [`& ${IndeterminateIcon}`]: {
      bc: '$icon-default-text-soft',
    },
    '&:hover': {
      [`& ${IndicatorWrapper}`]: {
        bs: 'inset 0 0 0 1px $colors$icon-hover-primary-bold',
      },
      [`& ${IndeterminateIcon}`]: {
        bc: '$icon-hover-primary-bold',
      },
    },
    '&:disabled': {
      [`& ${IndeterminateIcon}`]: {
        bc: '$icon-disable-text-pastel',
      },
    },
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$icon-default-text-soft',
    },
  },
  variants: {
    hasLabel: {
      true: {
        height: 'fit-content',
        width: 'fit-content',
      },
    },
  },
});

export { StyledCheckbox, StyledIndicator, IndicatorWrapper, IndeterminateIcon };
