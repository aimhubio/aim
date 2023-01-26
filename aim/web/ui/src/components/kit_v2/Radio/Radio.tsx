import React from 'react';

import { RadioGroupProps } from '@radix-ui/react-radio-group';

import { IRadioItemProps } from './Radio.d';
import {
  Flex,
  IndicatorWrapper,
  RadioGroupIndicator,
  RadioItem,
  RadioLabel,
  StyledRadioGroup,
} from './Radio.style';

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
