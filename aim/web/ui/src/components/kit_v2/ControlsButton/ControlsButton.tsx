import React from 'react';

import { IconName } from 'components/kit/Icon';

import { IControlsButtonProps } from './ControlsButton.d';
import {
  AppliedCount,
  ArrowIcon,
  LeftIcon,
  RightIcon,
  Trigger,
} from './ControlsButton.style';

/**
 * @description ControlsButton component
 * ControlsButton component params
 * @param {string} children - Label of the button
 * @param {boolean} open - Open state of the button
 * @param {string} rightIcon - Right icon of the button
 * @param {string} size - Size of the button
 * @param {boolean} hasAppliedValues - Applied values state of the button
 * @param {number} appliedValuesCount - Applied values count of the button
 * @param {string} leftIcon - Left icon of the button
 * @param {boolean} disabled - Disabled state of the button
 * @returns {React.FunctionComponentElement<React.ReactNode>} - React component
 */
const ControlsButton = React.forwardRef<
  React.ElementRef<typeof Trigger>,
  IControlsButtonProps
>(
  (
    {
      children,
      open,
      rightIcon,
      size = 'md',
      hasAppliedValues = false,
      appliedValuesCount,
      leftIcon,
      disabled,
      ...props
    }: IControlsButtonProps,
    forwardedRef,
  ) => {
    return (
      <Trigger
        {...props}
        focused={open}
        applied={hasAppliedValues}
        size={size}
        rightIcon={!!rightIcon}
        leftIcon={!!leftIcon}
        disabled={disabled}
        ref={forwardedRef}
      >
        {leftIcon ? <LeftIcon fontSize={10} name={leftIcon} /> : null}
        {children}
        {appliedValuesCount ? (
          <AppliedCount>{appliedValuesCount}</AppliedCount>
        ) : null}
        <ArrowIcon
          fontSize={6}
          size={size}
          rightIcon={!!rightIcon}
          name={`arrow-${open ? 'up' : 'down'}-contained` as IconName}
        />
        {rightIcon?.name ? (
          <RightIcon
            size='sm'
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault();
              rightIcon?.onClick();
            }}
            disabled={disabled}
            icon={rightIcon?.name}
            variant='text'
            color='secondary'
          />
        ) : null}
      </Trigger>
    );
  },
);

ControlsButton.displayName = 'ControlsButton';
export default React.memo(ControlsButton);
