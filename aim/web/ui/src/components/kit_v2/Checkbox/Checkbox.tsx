import React from 'react';

import Icon from 'components/kit/Icon';

import { ICheckboxProps } from './Checkbox.d';
import {
  IndeterminateIcon,
  IndicatorWrapper,
  StyledCheckbox,
  StyledIndicator,
} from './Checkbox.style';

/**
 * @description Checkbox component
 * Checkbox component params
 * @param {boolean} checked - Checked state of the checkbox
 * @param {boolean} defaultChecked - Default checked state of the checkbox
 * @param {boolean} disabled - Disabled state of the checkbox
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @example
 * <Checkbox checked={true} />
 */
export const CheckBox = React.forwardRef<
  React.ElementRef<typeof StyledCheckbox>,
  ICheckboxProps
>(
  (
    { checked, defaultChecked, disabled, ...props }: ICheckboxProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
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

CheckBox.displayName = 'CheckBox';
export default React.memo(CheckBox);
