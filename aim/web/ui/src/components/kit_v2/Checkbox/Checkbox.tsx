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
  transition: 'all 0.2s ease-out',
});

const IndicatorWrapper = styled('span', {
  width: '10px',
  height: '10px',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  bs: 'inset 0 0 0 1px $colors$secondary100',
  br: '$2',
  transition: 'all 0.2s ease-out',
});

const StyledCheckbox = styled(CheckboxPrimitive.Root, {
  size: '20px',
  border: 'unset',
  bc: 'white',
  borderRadius: '$2',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  lineHeight: 1,
  cursor: 'pointer',
  transition: 'all 0.2s ease-out',
  '&:hover': {
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
  '&:disabled': {
    pointerEvents: 'none',
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$secondary50 !important',
    },
  },
  '&[data-state=checked]': {
    '&:hover': {
      [`& ${IndicatorWrapper}`]: {
        bc: '$primary110',
      },
    },
    '&:disabled': {
      [`& ${IndicatorWrapper}`]: {
        bc: '$secondary50',
      },
    },
    [`& ${IndicatorWrapper}`]: {
      bc: '$primary100',
      bs: 'inset 0 0 0 1px transparent',
      '&:disabled': {
        bc: '$secondary50 !important',
      },
    },
  },
  '&[data-state=indeterminate]': {
    '&:hover': {
      [`& ${IndicatorWrapper}`]: {
        bs: 'inset 0 0 0 1px $colors$primary110',
      },
      [`& ${IndeterminateIcon}`]: {
        bc: '$primary110',
      },
    },
    '&:disabled': {
      [`& ${IndeterminateIcon}`]: {
        bc: '$secondary50',
      },
    },
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
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
      <StyledCheckbox
        {...props}
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
        ref={forwardedRef}
      >
        <IndicatorWrapper>
          <StyledIndicator>
            {isChecked === 'indeterminate' ? <IndeterminateIcon /> : null}
            {isChecked === true ? <Icon fontSize={6} name='check' /> : null}
          </StyledIndicator>
        </IndicatorWrapper>
      </StyledCheckbox>
    );
  },
);

export default React.memo(CheckBox);
