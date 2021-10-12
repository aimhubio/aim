import React from 'react';
import { ITextProps } from 'types/components/ui/Text/ITextProps';

import './Text.scss';

function Text({
  size,
  color,
  weight,
  children,
  className,
  component,
  tint,
}: ITextProps): React.FunctionComponentElement<React.ReactNode> {
  const Element = React.useMemo(() => {
    const classes = `${className || ''} Text Text__size_${
      size ? size : 5
    } Text__weight_${weight ? weight : 500} Text__color_${
      color ? `${color}${tint ? `_${tint}` : ''}` : 'primary'
    }`;
    let Component;
    switch (component) {
      case 'h1':
        Component = <h1 className={classes}>{children}</h1>;
        break;
      case 'h2':
        Component = <h2 className={classes}>{children}</h2>;
        break;
      case 'h3':
        Component = <h3 className={classes}>{children}</h3>;
        break;
      case 'h4':
        Component = <h4 className={classes}>{children}</h4>;
        break;
      case 'h5':
        Component = <h5 className={classes}>{children}</h5>;
        break;
      case 'h6':
        Component = <h6 className={classes}>{children}</h6>;
        break;
      case 'span':
        Component = <span className={classes}>{children}</span>;
        break;
      case 'strong':
        Component = <strong className={classes}>{children}</strong>;
        break;
      case 'small':
        Component = <small className={classes}>{children}</small>;
        break;
      case 'p':
        Component = <p className={classes}>{children}</p>;
        break;

      default:
        Component = <span className={classes}>{children}</span>;
    }
    return Component;
  }, []);

  return Element;
}

export default React.memo(Text);
