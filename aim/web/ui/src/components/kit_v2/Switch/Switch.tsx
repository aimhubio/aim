import React from 'react';

import { ISwitchProps } from './Switch.d';
import { SwitchStyled, ThumbStyled } from './Switch.style';

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
