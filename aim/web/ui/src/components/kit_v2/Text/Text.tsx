import React from 'react';

import { ITextProps } from './Text.d';
import { StyledSlot } from './Text.style';

/**
 * Polymorphic Text component
 * @param {typographyType} as - HTML tag
 * @param {string} size - Font size
 * @param {string} weight - Font weight
 * @param {string} color - Font color
 * @param {CSS} css - CSS
 * @param {ITextProps} rest - rest of the props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @example
 * <Text as="span" size="$3" weight="$2" color="$textPrimary"> Text </Text>
 */
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
  ): React.FunctionComponentElement<React.ReactNode> => {
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

Text.displayName = 'Text';
export default React.memo(Text);
