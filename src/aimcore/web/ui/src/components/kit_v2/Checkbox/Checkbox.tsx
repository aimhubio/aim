import React from 'react';

import { IconCheck } from '@tabler/icons-react';

// import Icon from 'components/kit/Icon';

import Text from '../Text';
import Box from '../Box';

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
export const Checkbox = React.forwardRef<
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
        hasLabel={!!props.label}
        disabled={disabled}
        ref={forwardedRef}
      >
        <IndicatorWrapper>
          <StyledIndicator>
            {isChecked === 'indeterminate' ? <IndeterminateIcon /> : null}
            {isChecked === true ? <IconCheck fontSize={6} /> : null}
          </StyledIndicator>
        </IndicatorWrapper>
        {props.label && (
          <Box ml='$5' as='label' className='Label' htmlFor={props.id}>
            <Text>{props.label}</Text>
          </Box>
        )}
      </StyledCheckbox>
    );
  },
);

Checkbox.displayName = 'Checkbox';
export default React.memo(Checkbox);
