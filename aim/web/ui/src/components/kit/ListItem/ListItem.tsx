import React from 'react';
import styled from 'styled-components';

import { IListItemProps } from './ListItem.d';

const heights: any = {
  small: '28px',
  medium: '32px',
  large: '36px',
};

const Container: any = styled.div`
  display: flex;
  align-items: center;
  height: ${({ size }: any) => heights[size]};
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  transition: 0.18s ease-out;
  cursor: pointer;
  &:hover {
    background-color: #f2f5fa;
  }
`;

function ListItem({ className, size = 'medium', children, ...rest }: any) {
  return (
    <Container className={`ListItem ${className}`} size={size} {...rest}>
      {children}
    </Container>
  );
}

export default React.memo(ListItem);
