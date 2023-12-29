import React from 'react';

import { IListItemProps } from './ListItem.d';
import { Container, Content } from './ListItem.style';

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
      leftNode,
      rightNode,
      disabled,
      css = {},
      onClick,
      ...rest
    }: IListItemProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <Container
        {...rest}
        onClick={onClick ? onClick : () => null}
        disabled={disabled}
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

ListItem.displayName = 'ListItem';
export default React.memo(ListItem);
