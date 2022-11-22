import { CSS } from 'config/stitches/stitches.config';

export interface IBoxProps extends Partial<React.HTMLAttributes<HTMLElement>> {
  as?: keyof HTMLElementTagNameMap;
  css?: CSS;
  children?: React.ReactNode;
  mt?: CSS['mt'];
  mb?: CSS['mb'];
  ml?: CSS['ml'];
  mr?: CSS['mr'];
  mx?: CSS['mx'];
  my?: CSS['my'];
  m?: CSS['m'];
  pt?: CSS['pt'];
  pb?: CSS['pb'];
  pl?: CSS['pl'];
  pr?: CSS['pr'];
  px?: CSS['px'];
  py?: CSS['py'];
  p?: CSS['p'];
  size?: CSS['size'];
  fontSize?: CSS['fontSize'];
  fontWeight?: CSS['fontWeight'];
  color?: CSS['colors'];
}
