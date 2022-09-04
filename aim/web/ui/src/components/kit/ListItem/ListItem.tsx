import React from 'react';
import styled from 'styled-components';

import { IListItemProps, IListITemSize } from './ListItem.d';

const heights: { small: string; medium: string; large: string } = {
  small: '28px',
  medium: '32px',
  large: '36px',
};

const Container = styled.div<IListItemProps | any>`
  display: flex;
  align-items: center;
  height: ${({ size }) => heights[size as IListITemSize]};
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  transition: 0.18s ease-out;
  cursor: pointer;
  &:hover {
    background-color: #f2f5fa;
  }
`;

function ListItem({
  className = '',
  size = 'medium',
  children,
  ...rest
}: IListItemProps) {
  return (
    <Container className={`ListItem ${className}`} size={size} {...rest}>
      {children}
    </Container>
  );
}

export default React.memo(ListItem);
