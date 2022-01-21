import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

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
    <ErrorBoundary>
      <i
        className={`Icon__container icon-${name} ${className}`}
        style={{
          ...(fontSize && { fontSize: fontSize }),
          ...(color && { color }),
          ...style,
        }}
        {...rest}
      />
    </ErrorBoundary>
  );
}

export default React.memo(Icon);
