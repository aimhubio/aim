import React from 'react';
import styled from 'styled-components';

import { IListItemProps, IListITemSize } from './ListItem.d';

const heights: { small: string; medium: string; large: string } = {
  small: '24px',
  medium: '28px',
  large: '32px',
};

const Container = styled.div<IListItemProps | any>`
  display: flex;
  align-items: center;
  height: ${({ size }) => heights[size as IListITemSize]};
  padding: 0 0.75rem;
  border-radius: 0.25rem;
  transition: all 0.18s ease-out;
  cursor: pointer;
  &:hover {
    background-color: #f4f4f6;
    color: #1473e6;
    .Text {
      color: #1473e6;
    }
  }
  .Text {
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

function ListItem({
  className = '',
  size = 'medium',
  children,
  onClick,
  ...rest
}: IListItemProps) {
  return (
    <Container
      onClick={onClick ? onClick : () => null}
      className={`ListItem ${className}`}
      size={size}
      {...rest}
    >
      {children}
    </Container>
  );
}

export default React.memo(ListItem);
