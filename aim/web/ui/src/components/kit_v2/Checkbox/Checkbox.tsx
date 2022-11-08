import React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import Icon from 'components/kit/Icon';

import { styled } from 'config/stitches/stitches.config';

import { ICheckboxProps } from './Checkbox.d';

const IndeterminateIcon = styled('span', {
  width: '6px',
  height: '6px',
  bc: '$primary100',
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
});

const StyledCheckbox = styled(CheckboxPrimitive.Root, {
  display: 'flex',
  all: 'unset',
  size: '10px',
  bc: 'white',
  borderRadius: '$2',
  ai: 'center',
  jc: 'center',
  lineHeight: 1,
  bs: 'inset 0 0 0 1px $colors$secondary100',
  transition: 'all 0.2s ease-out',
  '&:disabled': {
    bs: 'inset 0 0 0 1px $colors$secondary50 !important',
  },
});

const CheckboxContainer = styled('div', {
  width: '$1',
  height: '$1',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  cursor: 'pointer',
  variants: {
    disabled: {
      true: {
        pointerEvents: 'none',
      },
    },
  },
  '&:hover': {
    [`& ${StyledCheckbox}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
  '&[data-state=checked]': {
    '&:hover': {
      [`& ${StyledCheckbox}`]: {
        bc: '$primary110',
      },
    },
    [`& ${StyledCheckbox}`]: {
      bc: '$primary100',
      bs: 'inset 0 0 0 1px transparent',
      '&[data-disabled]': {
        bc: '$secondary50',
      },
    },
  },
  '&[data-state=indeterminate]': {
    '&:hover': {
      [`& ${StyledCheckbox}`]: {
        bs: 'inset 0 0 0 1px $colors$primary110',
      },
      [`& ${IndeterminateIcon}`]: {
        bc: '$primary110',
      },
    },
    [`& ${StyledCheckbox}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
      '&[data-disabled]': {
        [`& ${IndeterminateIcon}`]: {
          bc: '$secondary50',
        },
      },
    },
  },
});

export const CheckBox = React.forwardRef<
  React.ElementRef<typeof StyledCheckbox>,
  ICheckboxProps
>(
  (
    { checked, defaultChecked, disabled, ...props }: ICheckboxProps,
    forwardedRef,
  ) => {
    const [isChecked, setIsChecked] = React.useState<ICheckboxProps['checked']>(
      checked || defaultChecked,
    );
    const checkboxRef = React.useRef<any>(forwardedRef);

    // control checkbox state from outside
    React.useEffect(() => {
      if (checked !== isChecked) {
        setIsChecked(checked);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checked]);

    // control checkbox state from inside
    const handleChange = React.useCallback(
      (val: ICheckboxProps['checked']) => {
        if (!disabled) {
          const value: ICheckboxProps['checked'] =
            isChecked === 'indeterminate' ? false : val;
          setIsChecked(value);
          if (props.onCheckedChange) {
            props.onCheckedChange(value);
          }
        }
      },
      [isChecked, props, disabled],
    );

    return (
      <CheckboxContainer
        onClick={() => {
          checkboxRef?.current?.click();
        }}
        data-state={
          isChecked === 'indeterminate'
            ? 'indeterminate'
            : isChecked
            ? 'checked'
            : 'unchecked'
        }
        disabled={disabled}
      >
        <StyledCheckbox
          {...props}
          checked={isChecked}
          onCheckedChange={handleChange}
          disabled={disabled}
          ref={checkboxRef}
        >
          <StyledIndicator>
            {isChecked === 'indeterminate' ? <IndeterminateIcon /> : null}
            {isChecked === true ? <Icon fontSize={6} name='check' /> : null}
          </StyledIndicator>
        </StyledCheckbox>
      </CheckboxContainer>
    );
  },
);

export default React.memo(CheckBox);
