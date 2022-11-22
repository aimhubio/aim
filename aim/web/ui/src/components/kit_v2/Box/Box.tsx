import React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches/stitches.config';

import { IBoxProps } from './Box.d';
const StyledBox: any = styled(Slot, {});

const Box = React.forwardRef<typeof StyledBox, IBoxProps>(
  ({ as = 'div', css, mt, children, ...rest }: IBoxProps, forwardedRef) => {
    const Comp: any = as;
    return (
      <StyledBox {...rest} css={{ ...css, mt }} ref={forwardedRef}>
        <Comp>{children}</Comp>
      </StyledBox>
    );
  },
);

export default React.memo(Box);
