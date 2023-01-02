import React from 'react';

import Icon, { IconName } from 'components/kit/Icon';

import { ColorPaletteType, styled } from 'config/stitches/stitches.config';

import IconButton from '../IconButton';

import { IControlsButtonProps } from './ControlsButton.d';

const Trigger = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  lineHeight: 1,
  fontWeight: '$2',
  cursor: 'pointer',
  borderRadius: '$3',
  transition: 'all 0.2s ease-out',
  fontSize: '$3',
  color: ' #5A667A',
  '&:hover': {
    bc: '#E2E6ED',
  },
  variants: {
    applied: {
      true: {
        bc: '$secondary10',
      },
    },
    focused: {
      true: {
        bs: '0px 0px 0px 1px $colors$secondary100',
        bc: '#E2E6ED',
      },
    },
    rightIcon: { true: {} },
    leftIcon: { true: {} },
    size: {
      md: {
        height: '$3',
        pl: '$5',
        pr: '$4',
      },
      lg: {
        height: '$5',
        pl: '$6',
        pr: '$5',
      },
      xl: {
        height: '$7',
        pl: '$7',
        pr: '$6',
      },
    },
    disabled: {
      true: {
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: '$secondary50',
      },
    },
  },
  compoundVariants: [
    {
      rightIcon: true,
      size: 'md',
      css: {
        pr: '$3',
      },
    },
    {
      rightIcon: true,
      size: 'lg',
      css: {
        pr: '$4',
      },
    },
    {
      rightIcon: true,
      size: 'xl',
      css: {
        pr: '$6',
      },
    },
    {
      leftIcon: true,
      size: 'md',
      css: {
        pl: '$2',
      },
    },
    {
      leftIcon: true,
      size: 'lg',
      css: {
        pl: '$3',
      },
    },
    {
      leftIcon: true,
      size: 'xl',
      css: {
        pl: '$5',
      },
    },
  ],
});

const ArrowIcon = styled(Icon, {
  width: '10px',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  ml: '$2',
  variants: {
    rightIcon: { true: {} },
    size: {
      md: {},
      lg: {
        ml: '$3',
      },
      xl: {
        ml: '$5',
      },
    },
  },
  compoundVariants: [
    {
      size: 'md',
      rightIcon: true,
      css: {
        mr: '$2',
      },
    },
    {
      size: 'lg',
      rightIcon: true,
      css: {
        mr: '$3',
      },
    },
    {
      size: 'xl',
      rightIcon: true,
      css: {
        mr: '$5',
      },
    },
  ],
});

const AppliedCount = styled('span', {
  width: '16px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  height: '14px',
  lineHeight: 1.4,
  bc: '$secondary30',
  display: 'inline-block',
  textAlign: 'center',
  br: '100px',
  fontSize: '10px',
  fontWeight: '$3',
  ml: '$3',
});

const LeftIcon = styled(Icon, {
  size: '$1',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  mr: '$2',
});

const RightIcon = styled(IconButton, {
  width: '$1',
});

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
