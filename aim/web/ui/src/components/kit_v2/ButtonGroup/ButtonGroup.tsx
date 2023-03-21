import React from 'react';

import { IButtonGroupProps } from './ButtonGroup.d';
import { Container } from './ButtonGroup.style';

/**
 * @description ButtonGroup component is a wrapper for Button component to group them together
 * ButtonGroup component params
 * @param {string} color - Color of the button group
 * @param {React.ReactNode} children - React children
 * @param {Partial<React.AllHTMLAttributes<HTMLElement>>} rest - HTML attributes
 */
const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof Container>,
  IButtonGroupProps
>(({ color, children, ...rest }: IButtonGroupProps, forwardedRef) => {
  const childrenWIthProps = React.Children.map(children, (child) => {
    return React.cloneElement(child as React.FunctionComponentElement<any>, {
      color,
      ...rest,
    });
  });

  return (
    <Container
      {...rest}
      ref={forwardedRef}
      variant={rest.variant}
      css={{
        color: `$${color}50`,
      }}
    >
      {childrenWIthProps}
    </Container>
  );
});

ButtonGroup.displayName = 'ButtonGroup';
export default React.memo(ButtonGroup);
