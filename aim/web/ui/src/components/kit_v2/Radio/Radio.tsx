import React from 'react';

import {
  Root,
  Item,
  Indicator,
  RadioGroupProps,
} from '@radix-ui/react-radio-group';

import { styled } from 'config/stitches/stitches.config';

import { IRadioItemProps } from './Radio.d';

const StyledRadioGroup = styled(Root, {});

const IndicatorWrapper = styled('span', {
  all: 'unset',
  display: 'inline-block',
  bc: 'white',
  width: 12,
  height: 12,
  br: '$round',
  transition: 'all 0.2s ease-out',
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
  transition: 'all 0.2s ease-out',
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
  transition: 'all 0.2s ease-out',
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

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof StyledRadioGroup>,
  RadioGroupProps
>(({ children, ...props }: RadioGroupProps) => (
  <StyledRadioGroup {...props}>{children}</StyledRadioGroup>
));

const Radio = React.forwardRef<React.ElementRef<typeof Flex>, IRadioItemProps>(
  ({ ...props }: IRadioItemProps, forwardedRef) => (
    <Flex ref={forwardedRef} data-disabled={props.disabled}>
      <RadioItem {...props} id={props.id || props.value}>
        <IndicatorWrapper>
          <RadioGroupIndicator />
        </IndicatorWrapper>
      </RadioItem>
      {props.children ? (
        <RadioLabel htmlFor={props.id || props.value}>
          {props.children}
        </RadioLabel>
      ) : null}
    </Flex>
  ),
);

export default Radio;
