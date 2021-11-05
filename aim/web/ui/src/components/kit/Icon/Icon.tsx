import React from 'react';

import { IIconProps } from './Icon.d';

function Icon({
  name,
  className = '',
  style,
  fontSize,
  color,
  ...rest
}: IIconProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <i
      className={`Icon__container icon-${name} ${className}`}
      style={{
        ...(fontSize && { fontSize: fontSize }),
        ...(color && { color }),
        ...style,
      }}
      {...rest}
    />
  );
}

export default React.memo(Icon);
