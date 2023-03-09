import { CSS } from 'config/stitches/types';
export interface ITextProps
  extends Partial<
    React.HTMLAttributes<
      HTMLSpanElement | HTMLHeadingElement | HTMLParagraphElement | HTMLElement
    >
  > {
  as?: typographyType;
  mono?: boolean;
  weight?: CSS['fontWeight'];
  disabled?: boolean;
  size?: CSS['fontSize'];
  color?: CSS['color'];
  css?: CSS;
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
  | 'sup';
