import React from 'react';

import {
  Root,
  Item,
  Indicator,
  RadioGroupProps,
} from '@radix-ui/react-radio-group';

import { styled } from 'config/stitches/stitches.config';

import { IRadioProps } from './Radio.d';

const StyledRadioGroup = styled(Root, {});

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof StyledRadioGroup>,
  RadioGroupProps
>(({ children, ...props }: RadioGroupProps) => (
  <StyledRadioGroup {...props}>{children}</StyledRadioGroup>
));

const IndicatorWrapper = styled('span', {
  all: 'unset',
  display: 'inline-block',
  bc: 'white',
  width: 12,
  height: 12,
  br: '$round',
  borderRadius: '100%',
  transition: 'all 0.2s ease-out',
  boxShadow: 'inset 0 0 0 1px $colors$secondary100',
  cursor: 'pointer',
  '&:hover': { bs: 'inset 0 0 0 1px $colors$primary100' },
});

const RadioItem = styled(Item, {
  all: 'unset',
  backgroundColor: 'white',
  width: 20,
  height: 20,
  borderRadius: '100%',
  transition: 'all 0.2s ease-out',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  cursor: 'pointer',
  '&[data-state="checked"]': {
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
});

const RadioGroupIndicator = styled(Indicator, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const Radio = React.forwardRef<React.ElementRef<typeof RadioItem>, IRadioProps>(
  ({ ...props }: IRadioProps) => (
    <RadioItem {...props}>
      <IndicatorWrapper>
        <RadioGroupIndicator />
      </IndicatorWrapper>
    </RadioItem>
  ),
);

export default Radio;
