import React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches/stitches.config';

import { IBoxProps } from './Box.d';
const StyledBox: any = styled(Slot, {});

/**
 * Polymorphic Box component
 * @param {IBoxProps} props
 * @param {keyof HTMLElementTagNameMap} as - HTML element or React component
 * @param {object} css - css object
 * @param {React.ReactNode} children - React children
 * @param {Partial<React.AllHTMLAttributes<HTMLElement>>} rest - HTML attributes
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @see https://www.radix-ui.com/docs/primitives/utilities/slot
 * @see https://stitches.dev/docs/overriding-styles#the-css-prop
 */

const Box = React.forwardRef<typeof StyledBox, IBoxProps>(
  (
    {
      as = 'div',
      css,
      children,
      display,
      flex,
      fd,
      fw,
      ai,
      jc,
      m,
      mt,
      mr,
      mb,
      ml,
      p,
      pt,
      pr,
      pb,
      pl,
      width,
      height,
      bg,
      color,
      ...rest
    }: IBoxProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const Component: any = as;
    return (
      <StyledBox
        {...rest}
        css={{
          display,
          flex,
          fd,
          fw,
          ai,
          jc,
          m,
          mt,
          mr,
          mb,
          ml,
          p,
          pt,
          pr,
          pb,
          pl,
          width,
          height,
          bg,
          color,
          ...css,
        }}
        ref={forwardedRef}
      >
        <Component>{children}</Component>
      </StyledBox>
    );
  },
);

export default React.memo(Box);
