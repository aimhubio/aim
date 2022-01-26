import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ITextProps } from './Text.d';

import './Text.scss';

/**
 * @property {number} size - text size
 * @property {string} color - text color
 * @property {number} weight - text weight
 * @property {string} className - component className
 * @property {string} component - defines rendering html tag
 * @property {number} tint - tinting text color
 * @property {React.HTMLAttributes}  rest - rest properties that can be set
 */

function Text({
  size,
  color,
  weight,
  children,
  className,
  component,
  tint,
  ...rest
}: ITextProps): React.FunctionComponentElement<React.ReactNode> {
  const Element = (): React.FunctionComponentElement<React.ReactNode> => {
    const classes: string = `${className || ''} Text Text__size_${
      size ? size : 12
    } Text__weight_${weight ? weight : 500} Text__color_${`${
      color ? color : 'primary'
    }${tint ? `_${tint}` : ''}`}`;
    switch (component) {
      case 'h1':
        return (
          <h1 {...rest} className={classes}>
            {children}
          </h1>
        );
      case 'h2':
        return (
          <h2 {...rest} className={classes}>
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 {...rest} className={classes}>
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4 {...rest} className={classes}>
            {children}
          </h4>
        );
      case 'h5':
        return (
          <h5 {...rest} className={classes}>
            {children}
          </h5>
        );
      case 'h6':
        return (
          <h6 {...rest} className={classes}>
            {children}
          </h6>
        );
      case 'span':
        return (
          <span {...rest} className={classes}>
            {children}
          </span>
        );
      case 'strong':
        return (
          <strong {...rest} className={classes}>
            {children}
          </strong>
        );
      case 'small':
        return (
          <small {...rest} className={classes}>
            {children}
          </small>
        );
      case 'p':
        return (
          <p {...rest} className={classes}>
            {children}
          </p>
        );
      default:
        return (
          <span {...rest} className={classes}>
            {children}
          </span>
        );
    }
  };

  return (
    <ErrorBoundary>
      <Element />
    </ErrorBoundary>
  );
}

Text.displayName = 'Text';

export default React.memo<ITextProps>(Text);
