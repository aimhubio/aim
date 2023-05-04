import { createStitches } from '@stitches/react';

import { lightTheme } from './theme';
import { media } from './media';
import { utils } from './utils';
import { globalStyles } from './global';

export const {
  styled,
  css,
  theme,
  createTheme,
  getCssText,
  globalCss,
  keyframes,
  config,
  reset,
} = createStitches({
  prefix: 'aim-ui',
  theme: lightTheme,
  media,
  utils,
});

const injectGlobalCss = globalCss(globalStyles);
injectGlobalCss();
