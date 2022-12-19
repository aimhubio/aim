import React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches/stitches.config';

import { ITextProps } from './Text.d';

const StyledSlot: any = styled(Slot, {
  lineHeight: 1,
});
const Text = React.forwardRef<React.ElementRef<typeof StyledSlot>, ITextProps>(
  (
    {
      as = 'span',
      size = '$3',
      weight = '$2',
      color = '$textPrimary',
      css,
      children,
      ...rest
    }: ITextProps,
    forwardedRef,
  ) => {
    const Comp = as;
    return (
      <StyledSlot
        css={{ fontSize: size, fontWeight: weight, color: color, ...css }}
        ref={forwardedRef}
        {...rest}
      >
        <Comp>{children}</Comp>
      </StyledSlot>
    );
  },
);

export default React.memo(Text);
