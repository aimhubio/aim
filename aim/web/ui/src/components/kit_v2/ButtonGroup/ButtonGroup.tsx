import React from 'react';

import { IButtonGroupProps } from './ButtonGroup.d';
import { Container } from './ButtonGroup.style';

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

export default ButtonGroup;
