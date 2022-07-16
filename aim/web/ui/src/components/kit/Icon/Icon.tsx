import React from 'react';
import classNames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IIconProps } from './Icon.d';

import './Icon.scss';

function Icon({
  name,
  className = '',
  style,
  fontSize,
  color,
  box = false,
  ...rest
}: IIconProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <i
        className={classNames(`Icon__container icon-${name} ${className}`, {
          Icon__box: box,
        })}
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
