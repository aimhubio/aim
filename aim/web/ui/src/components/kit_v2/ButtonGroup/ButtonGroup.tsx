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
  p: '1px',
  bs: 'inset 0 0 0 1px',
  '& > button': {
    br: '0',
    bs: 'none',
    '&:not(:first-of-type)': {
      borderLeft: '1px solid',
    },
    '&:first-of-type': {
      borderTopLeftRadius: '$3',
      borderBottomLeftRadius: '$3',
    },
    '&:last-of-type': {
      borderTopRightRadius: '$3',
      borderBottomRightRadius: '$3',
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
        '& > button': {
          borderColor: `$colors$${props.color}100`,
        },
      }}
    >
      {childrenWIthProps}
    </Container>
  );
});

export default ButtonGroup;
