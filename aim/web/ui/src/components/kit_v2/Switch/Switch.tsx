import React from 'react';

import { ISwitchProps } from './Switch.d';
import { SwitchStyled, ThumbStyled } from './Switch.style';

/**
 * Switch component
 * @param {boolean} checked - checked state of the switch
 * @param {boolean} disabled - disabled state of the switch
 * @param {string} size - size of the switch
 * @param {function} onCheckedChange - callback function for checked state change
 * @returns {React.FunctionComponentElement<React.ReactNode>} - React component
 * @example
 * <Switch checked={true} disabled={false} size="md" onCheckedChange={() => {}} />
 */
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

Switch.displayName = 'Switch';
export default React.memo(Switch);
