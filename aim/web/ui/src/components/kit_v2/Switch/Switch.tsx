import React from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';

import { styled } from 'config/stitches/stitches.config';

import { ISwitchProps } from './Switch.d';

const ThumbStyled = styled(SwitchPrimitive.Thumb, {
  display: 'block',
  backgroundColor: 'white',
  br: '20px',
  bs: '0px 2px 4px rgba(28, 40, 82, 0.15)',
  transition: 'all 0.2s ease-out',
  transform: 'translateX(2px)',
  willChange: 'transform',
  variants: {
    size: {
      sm: {
        height: 8,
        width: 8,
        '&[data-state="checked"]': {
          transform: 'translateX(100%) translateX(6px)',
        },
      },
      md: {
        height: 12,
        width: 12,
        '&[data-state="checked"]': {
          transform: 'translateX(100%) translateX(6px)',
        },
      },
      lg: {
        height: 16,
        width: 16,
        '&[data-state="checked"]': {
          transform: 'translateX(100%) translateX(4px)',
        },
      },
    },
  },
});

const SwitchStyled = styled(SwitchPrimitive.Root, {
  all: 'unset',
  bc: '$secondary80',
  br: '$pill',
  position: 'relative',
  '&[data-disabled]': {
    pointerEvents: 'none',
  },
  '&[data-state="checked"]': {
    bc: '$primary100',
    '&[data-disabled]': { bc: '$primary50' },
  },
  '&[data-state="unchecked"]': {
    '&[data-disabled]': { bc: '$secondary50' },
  },
  variants: {
    size: {
      sm: {
        height: 12,
        width: '$3',
        '&:active': {
          [`& ${ThumbStyled}`]: { width: 10 },
          '&[data-state="checked"]': {
            [`& ${ThumbStyled}`]: {
              transform: 'translateX(100%) translateX(2px)',
            },
          },
        },
      },
      md: {
        height: 16,
        width: '$7',
        '&:active': {
          [`& ${ThumbStyled}`]: { width: 14 },
          '&[data-state="checked"]': {
            [`& ${ThumbStyled}`]: {
              transform: 'translateX(100%) translateX(2px)',
            },
          },
        },
      },
      lg: {
        height: '$1',
        width: '$10',
        '&:active': {
          [`& ${ThumbStyled}`]: { width: 18 },
          '&[data-state="checked"]': {
            [`& ${ThumbStyled}`]: {
              transform: 'translateX(100%) translateX(0px)',
            },
          },
        },
      },
    },
  },
});

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchStyled>,
  ISwitchProps
>(
  (
    { size = 'md', checked, disabled, onCheckedChange, ...rest }: ISwitchProps,
    ref,
  ) => {
    const [isChecked, setIsChecked] = React.useState(checked);

    const handleChange = React.useCallback(
      (val: boolean) => {
        if (!disabled) {
          setIsChecked(val);
          if (onCheckedChange) {
            onCheckedChange(val);
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    React.useEffect(() => {
      if (checked !== isChecked) {
        setIsChecked(checked);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checked]);

    return (
      <SwitchStyled
        {...rest}
        disabled={disabled}
        size={size}
        checked={checked}
        onCheckedChange={handleChange}
        ref={ref}
      >
        <ThumbStyled size={size} />
      </SwitchStyled>
    );
  },
);

export default React.memo(Switch);
