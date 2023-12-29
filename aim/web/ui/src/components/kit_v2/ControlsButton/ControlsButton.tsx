import React from 'react';

import { IconCaretDown, IconCaretUp } from '@tabler/icons-react';

import { IControlsButtonProps } from './ControlsButton.d';
import {
  AppliedCount,
  ArrowIcon,
  LeftIcon,
  RightIcon,
  Trigger,
} from './ControlsButton.style';

function getControlButtonStyles(
  color: string,
  focused: boolean,
  applied: boolean,
  disabled = false,
) {
  // Define suffixes based on the color.
  const hoverSuffix = color === 'neutral' ? 'light' : 'pastel';
  const colorSuffix = color === 'neutral' ? 'lumos' : 'light';

  // Define styles based on the color, focus, applied and disabled statuses.
  return {
    backgroundColor: applied
      ? `$background-${
          disabled ? 'disable' : 'applied'
        }-${color}-${colorSuffix}`
      : 'unset',
    bs: focused
      ? `inset 0 0 0 1px $colors$border-focus-${color}-soft`
      : 'unset',
    '&:hover': {
      backgroundColor: `$background-hover-${color}-${hoverSuffix}`,
    },
  };
}

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
      color = 'neutral',
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
        size={size}
        rightIcon={!!rightIcon}
        leftIcon={!!leftIcon}
        disabled={disabled}
        css={{
          ...getControlButtonStyles(
            color,
            open,
            appliedValuesCount ? appliedValuesCount > 0 : hasAppliedValues,
            disabled,
          ),
        }}
        ref={forwardedRef}
      >
        {leftIcon ? <LeftIcon size='sm' icon={leftIcon} /> : null}
        {children}
        {appliedValuesCount ? (
          <AppliedCount
            css={{
              backgroundColor: `$background-${
                disabled ? 'disable' : 'default'
              }-${color}-${
                disabled
                  ? color === 'neutral'
                    ? 'light'
                    : 'pastel-opacity'
                  : color === 'neutral'
                  ? 'pastel-opacity'
                  : 'gentle-opacity'
              }`,
            }}
          >
            {appliedValuesCount}
          </AppliedCount>
        ) : null}
        {
          <ArrowIcon rightIcon={!!rightIcon} size={size}>
            {open ? <IconCaretUp /> : <IconCaretDown />}
          </ArrowIcon>
        }
        {rightIcon?.icon ? (
          <RightIcon
            size='sm'
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault();
              rightIcon?.onClick();
            }}
            icon={rightIcon?.icon}
            color='secondary'
          />
        ) : null}
      </Trigger>
    );
  },
);

ControlsButton.displayName = 'ControlsButton';
export default React.memo(ControlsButton);
