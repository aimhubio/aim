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

/**
 * @description Radio component is for displaying a radio button
 * Radio component params
 * @param {React.ReactNode} children - React children
 * @param {props} props - RadioGroupProps
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @example
 * <RadioGroup>
 * <Radio value='1'>Radio 1</Radio>
 * <Radio value='2'>Radio 2</Radio>
 * </RadioGroup>
 */
export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof StyledRadioGroup>,
  RadioGroupProps
>(({ children, ...props }: RadioGroupProps) => (
  <StyledRadioGroup {...props}>{children}</StyledRadioGroup>
));

const Radio = React.forwardRef<React.ElementRef<typeof Flex>, IRadioItemProps>(
  ({ ...props }: IRadioItemProps, forwardedRef) => (
    <Flex ref={forwardedRef} data-disabled={props.disabled}>
      <RadioItem {...props} id={props.id ?? props.value}>
        <IndicatorWrapper>
          <RadioGroupIndicator />
        </IndicatorWrapper>
      </RadioItem>
      {props.children ? (
        <RadioLabel htmlFor={props.id ?? props.value}>
          {props.children}
        </RadioLabel>
      ) : null}
    </Flex>
  ),
);

Radio.displayName = 'Radio';
export default React.memo(Radio);
