import * as Stitches from '@stitches/react';

import { config } from '.';

export type CSS = Stitches.CSS<typeof config>;
export type VariantProps = Stitches.VariantProps<typeof config>;
export type ColorPaletteType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'pale'
  | 'purple'
  | 'pink'
  | 'orange';
