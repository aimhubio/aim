import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import { IQueryBadgeProps } from './QueryBadge.d';

const Container = styled('button', {});

const QueryBadge = React.forwardRef<React.ElementRef<typeof Container>, any>(
  (
    { ...props }: IQueryBadgeProps,
    forwardedRed,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return <Container>Query Badge</Container>;
  },
);

export default React.memo(QueryBadge);
