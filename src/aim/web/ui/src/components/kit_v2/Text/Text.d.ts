import { CSS } from 'config/stitches/types';
export interface ITextProps
  extends Partial<
    React.HTMLAttributes<
      HTMLSpanElement | HTMLHeadingElement | HTMLParagraphElement | HTMLElement
    >
  > {
  /**
   * @description Component element to render as (e.g. h1, h2, h3, etc.)
   * @default 'span'
   * @type {typographyType}
   * @example
   * <Text as="h1">Heading 1</Text>
   */
  as?: typographyType;
  /**
   * @description Is the text monospaced?
   * @default false
   * @type {boolean}
   * @example
   * <Text mono>Monospaced text</Text>
   */
  mono?: boolean;
  /**
   * @description The text weight (e.g. '$3', '$4', etc.)
   * @default '$3'
   * @type {CSS['fontWeight']}
   * @example
   * <Text weight={500}>Semi-bold text</Text>
   */
  weight?: CSS['fontWeight'];
  /**
   * @description Is the text disabled?
   * @default false
   * @type {boolean}
   * @example
   * <Text disabled>Disabled text</Text>
   */
  disabled?: boolean;
  /**
   * @description The text size (e.g. '$3', '$4', etc.)
   * @default '$3'
   * @type {CSS['fontSize']}
   * @example
   * <Text size={'$4'}>Semi-bold text</Text>
   */
  size?: CSS['fontSize'];
  /**
   * @description The text color (e.g. '$primary', '$secondary', etc.)
   * @default '$textPrimary'
   * @type {CSS['color']}
   * @example
   * <Text color={'$secondary'}>Secondary text</Text>
   */
  color?: CSS['color'];
  /**
   * @description Render the text with ellipsis if it overflows
   * @default false
   * @type {boolean}
   * @example
   * <Text ellipsis>Long text</Text>
   */
  ellipsis?: boolean;
  /**
   * @description Transform the text (e.g. 'uppercase', 'lowercase', etc.)
   * @default 'none'
   * @type {CSS['textTransform']}
   * @example
   * <Text transform={'uppercase'}>Uppercase text</Text>
   */
  textTransform?: CSS['textTransform'];
  /**
   * @description The text line height
   * @default '$1'
   * @type {CSS['lineHeight']}
   * @example
   * <Text lineHeight={'$2'}>Text with line height</Text>
   */
  lineHeight?: CSS['lineHeight'];
  /**
   * @description The custom CSS styles for the text
   * @default {}
   * @type {CSS}
   * @example
   * <Text css={{ color: '$primary' }}>Custom text</Text>
   */
  css?: CSS;
  htmlFor?: string;
}

export type typographyType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'span'
  | 'p'
  | 'strong'
  | 'small'
  | 'b'
  | 'u'
  | 'i'
  | 'em'
  | 'abbr'
  | 'cite'
  | 'del'
  | 's'
  | 'samp'
  | 'sub'
  | 'sup'
  | 'label';
