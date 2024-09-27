import * as React from 'react';

import { ITextProps } from './Text.d';
import StyledSlot from './Text.style';

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
      mono = false,
      weight = '$2',
      color = '$textPrimary',
      disabled = false,
      textTransform,
      lineHeight,
      ellipsis,
      css,
      children,
      ...rest
    }: ITextProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const TagElement = as;
    return (
      <StyledSlot
        ellipsis={ellipsis}
        disabled={disabled}
        css={{
          fontSize: size,
          fontWeight: weight,
          color: disabled ? `${color}50` : color,
          fontFamily: mono ? '$mono' : '$inter',
          textTransform,
          lineHeight,
          ...css,
        }}
        ref={forwardedRef}
        {...rest}
      >
        <TagElement>{children}</TagElement>
      </StyledSlot>
    );
  },
);

Text.displayName = 'Text';
export default React.memo(Text);
