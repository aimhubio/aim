import { ConfigType } from '@stitches/react/types/config';

export const media: ConfigType.Media = {
  bp1: '(min-width: 520px)',
  bp2: '(min-width: 900px)',
  bp3: '(min-width: 1200px)',
  bp4: '(min-width: 1800px)',
  motion: '(prefers-reduced-motion)',
  hover: '(any-hover: hover)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
};
