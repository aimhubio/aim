import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import { IButtonProps } from '../Button';

const Container = styled('div', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  br: '$3',
  fontWeight: '$2',
  overflow: 'hidden',
  boxShadow: '0px 0px 0px 1px',
  '& > button': {
    br: '0',
    bs: 'unset',
    '&:not(:first-of-type)': {
      bs: 'inset 0 0 0 1px',
    },
    '&:hover': {
      bs: 'inset 0 0 0 1px',
    },
  },
});

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof Container>,
  IButtonProps
>(({ children, ...props }: any, forwardedRef) => {
  const childrenWIthProps = React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      ...props,
    });
  });

  return (
    <Container
      {...props}
      ref={forwardedRef}
      css={{
        color: `$${props.color}100`,
      }}
    >
      {childrenWIthProps}
    </Container>
  );
});

export default ButtonGroup;
