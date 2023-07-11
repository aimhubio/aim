import React from 'react';

import { ISpinnerProps } from './Spinner.d';

import './Spinner.scss';
/**
 * @property {number | string} size - * The size of the circle.
 * If using a number, the pixel unit is assumed.
 * If using a string, you need to provide the CSS unit, e.g '3rem'.
 * @property {number} thickness - The thickness of the circle.
 * @property {string} color - The color of the circle.
 * @property {string} className - component className
 */

const Spinner = React.forwardRef<HTMLDivElement, ISpinnerProps>(
  (
    {
      size = 40,
      thickness = 3,
      color = '#1473e6',
      className = '',
    }: ISpinnerProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <div
        ref={forwardedRef}
        style={{ width: size, height: size }}
        className={`Spinner ${className}`}
      >
        <div
          className='Spinner__loader'
          style={{
            borderWidth: thickness,
            borderColor: color,
            borderRightColor: 'transparent',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    );
  },
);

Spinner.displayName = 'Spinner';

export default React.memo(Spinner);
