import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import { IListItemProps } from './ListItem.d';

const Container = styled('div', {
  display: 'flex',
  ai: 'center',
  p: '0 $5',
  br: '$3',
  transition: 'all 0.2s ease-out',
  cursor: 'pointer',
  color: '#454545',
  fontSize: '$3',
  '&:hover': {
    bc: '#EFF0F2',
  },
  variants: {
    size: {
      sm: {
        height: '$1',
      },
      md: {
        height: '$3',
      },
      lg: {
        height: '$5',
      },
    },
  },
});

const Content = styled('div', {
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  m: '0 $3',
  flex: 1,
});

/**
 * ListItem component
 * @param {React.ReactNode} children - children
 * @param {function} onClick - onClick handler
 * @param {ListItemSize} size - size of the ListItem
 * @param {React.ReactNode} rightNode - right node
 * @param {React.ReactNode} leftNode - left node
 * @param {IListItemProps} rest - rest props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
const ListItem = React.forwardRef<
  React.ElementRef<typeof Container>,
  IListItemProps
>(
  (
    {
      size = 'md',
      children,
      onClick,
      leftNode,
      rightNode,
      css = {},
      ...rest
    }: IListItemProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <Container
        {...rest}
        onClick={onClick ? onClick : () => null}
        size={size}
        css={css}
        ref={forwardedRef}
      >
        {leftNode ? leftNode : null}
        <Content>{children}</Content>
        {rightNode ? rightNode : null}
      </Container>
    );
  },
);

export default React.memo(ListItem);
