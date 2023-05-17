import React from 'react';
import classNames from 'classnames';

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
    const classes: string = classNames({
      Text: true,
      [`Text__size_${size || 12}`]: true,
      [`Text__weight_${weight || 500}`]: true,
      [`Text__color_${color || 'primary'}${tint ? `_${tint}` : ''}`]: true,
      [`${className}`]: !!className,
    });

    const elementProps = {
      ...rest,
      className: classes,
    };

    switch (component) {
      case 'h1':
        return <h1 {...elementProps}>{children}</h1>;
      case 'h2':
        return <h2 {...elementProps}>{children}</h2>;
      case 'h3':
        return <h3 {...elementProps}>{children}</h3>;
      case 'h4':
        return <h4 {...elementProps}>{children}</h4>;
      case 'h5':
        return <h5 {...elementProps}>{children}</h5>;
      case 'h6':
        return <h6 {...elementProps}>{children}</h6>;
      case 'span':
        return <span {...elementProps}>{children}</span>;
      case 'strong':
        return <strong {...elementProps}>{children}</strong>;
      case 'small':
        return <small {...elementProps}>{children}</small>;
      case 'p':
        return <p {...elementProps}>{children}</p>;
      case 'pre':
        return <pre {...elementProps}>{children}</pre>;
      default:
        return <span {...elementProps}>{children}</span>;
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
