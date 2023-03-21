import { CSS } from 'config/stitches/stitches.config';
export interface ITextProps
  extends Partial<
    React.HTMLAttributes<
      HTMLSpanElement | HTMLHeadingElement | HTMLParagraphElement | HTMLElement
    >
  > {
  as?: typographyType;
  weight?: CSS['fontWeight'];
  size?: CSS['fontSize'];
  color?: CSS['color'];
  css?: CSS;
}

type typographyType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'span'
  | 'p'
  | 'strong'
  | 'small';
