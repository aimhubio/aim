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

export default React.memo(ControlsButton);
