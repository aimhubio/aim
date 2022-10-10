import { createStitches } from '@stitches/react';
import type * as Stitches from '@stitches/react';
export type { VariantProps } from '@stitches/react';

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
  theme: {
    fonts: {
      inter: 'Inter, sans-serif',
      mono: 'Inconsolata, monospace',
    },
    space: {
      1: '0.0625rem', // 1px
      2: '0.125rem', // 2px
      3: '0.25rem', // 4px
      4: '0.375rem', // 6px
      5: '0.5rem', // 8px
      6: '0.625rem', // 10px
      7: '0.75rem', // 12px
      8: '0.875rem', // 14px
      9: '1rem', // 16px
      10: '1.125rem', // 18px
      11: '1.25rem', // 20px
      12: '1.375rem', // 22px
      13: '1.5rem', // 24px
      14: '1.625rem', // 26px
      15: '1.75rem', // 28px
      16: '1.875rem', // 30px
      17: '2rem', // 32px
    },
    sizes: {
      1: '1.25rem', //20px
      2: '1.375rem', //22px
      3: '1.5rem', //24px
      4: '1.625rem', //26px
      5: '1.75rem', //28px
      6: '1.875rem', //30px
      7: '2rem', //32px
      8: '2.125rem', //34px
      9: '2.25rem', //36px
      10: '2.375rem', //38px
      11: '2.5rem', //40px
      12: '2.625rem', //42px
      13: '2.75rem', //44px
      14: '2.875rem', //46px
      15: '3rem', //48px
    },
    fontSizes: {
      1: '0.5rem', // 8px
      2: '0.625rem', // 10px
      3: '0.75rem', // 12px
      4: '0.875rem', // 14px
      5: '1rem', // 16px
      6: '1.125rem', // 18px
      7: '1.25rem', // 20px
      8: '1.375rem', // 22px
      9: '1.5rem', // 24px
      10: '1.625rem', // 26px
      11: '1.75rem', // 28px
      12: '1.875rem', // 30px
      13: '2rem', // 32px
    },
    radii: {
      1: '0.25rem', // 4px
      2: '0.375rem', // 6px
      3: '0.5rem', // 8px
      4: '0.625rem', // 10px
      5: '0.75rem', // 12px
      round: '50%',
      pill: '9999px',
    },
    zIndices: {
      1: '100',
      2: '200',
      3: '300',
      4: '400',
      max: '999',
    },
  },
  media: {
    bp1: '(min-width: 520px)',
    bp2: '(min-width: 900px)',
    bp3: '(min-width: 1200px)',
    bp4: '(min-width: 1800px)',
    motion: '(prefers-reduced-motion)',
    hover: '(any-hover: hover)',
    dark: '(prefers-color-scheme: dark)',
    light: '(prefers-color-scheme: light)',
  },
  utils: {
    p: (value: Stitches.PropertyValue<'padding'>) => ({
      padding: value,
    }),
    pt: (value: Stitches.PropertyValue<'paddingTop'>) => ({
      paddingTop: value,
    }),
    pr: (value: Stitches.PropertyValue<'paddingRight'>) => ({
      paddingRight: value,
    }),
    pb: (value: Stitches.PropertyValue<'paddingBottom'>) => ({
      paddingBottom: value,
    }),
    pl: (value: Stitches.PropertyValue<'paddingLeft'>) => ({
      paddingLeft: value,
    }),
    px: (value: Stitches.PropertyValue<'paddingLeft'>) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: (value: Stitches.PropertyValue<'paddingTop'>) => ({
      paddingTop: value,
      paddingBottom: value,
    }),

    m: (value: Stitches.PropertyValue<'margin'>) => ({
      margin: value,
    }),
    mt: (value: Stitches.PropertyValue<'marginTop'>) => ({
      marginTop: value,
    }),
    mr: (value: Stitches.PropertyValue<'marginRight'>) => ({
      marginRight: value,
    }),
    mb: (value: Stitches.PropertyValue<'marginBottom'>) => ({
      marginBottom: value,
    }),
    ml: (value: Stitches.PropertyValue<'marginLeft'>) => ({
      marginLeft: value,
    }),
    mx: (value: Stitches.PropertyValue<'marginLeft'>) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (value: Stitches.PropertyValue<'marginTop'>) => ({
      marginTop: value,
      marginBottom: value,
    }),

    ta: (value: Stitches.PropertyValue<'textAlign'>) => ({ textAlign: value }),

    fd: (value: Stitches.PropertyValue<'flexDirection'>) => ({
      flexDirection: value,
    }),
    fw: (value: Stitches.PropertyValue<'flexWrap'>) => ({ flexWrap: value }),

    ai: (value: Stitches.PropertyValue<'alignItems'>) => ({
      alignItems: value,
    }),
    ac: (value: Stitches.PropertyValue<'alignContent'>) => ({
      alignContent: value,
    }),
    jc: (value: Stitches.PropertyValue<'justifyContent'>) => ({
      justifyContent: value,
    }),
    as: (value: Stitches.PropertyValue<'alignSelf'>) => ({ alignSelf: value }),
    fg: (value: Stitches.PropertyValue<'flexGrow'>) => ({ flexGrow: value }),
    fs: (value: Stitches.PropertyValue<'flexShrink'>) => ({
      flexShrink: value,
    }),
    fb: (value: Stitches.PropertyValue<'flexBasis'>) => ({ flexBasis: value }),

    bc: (value: Stitches.PropertyValue<'backgroundColor'>) => ({
      backgroundColor: value,
    }),

    br: (value: Stitches.PropertyValue<'borderRadius'>) => ({
      borderRadius: value,
    }),
    btrr: (value: Stitches.PropertyValue<'borderTopRightRadius'>) => ({
      borderTopRightRadius: value,
    }),
    bbrr: (value: Stitches.PropertyValue<'borderBottomRightRadius'>) => ({
      borderBottomRightRadius: value,
    }),
    bblr: (value: Stitches.PropertyValue<'borderBottomLeftRadius'>) => ({
      borderBottomLeftRadius: value,
    }),
    btlr: (value: Stitches.PropertyValue<'borderTopLeftRadius'>) => ({
      borderTopLeftRadius: value,
    }),

    bs: (value: Stitches.PropertyValue<'boxShadow'>) => ({ boxShadow: value }),

    lh: (value: Stitches.PropertyValue<'lineHeight'>) => ({
      lineHeight: value,
    }),

    ox: (value: Stitches.PropertyValue<'overflowX'>) => ({ overflowX: value }),
    oy: (value: Stitches.PropertyValue<'overflowY'>) => ({ overflowY: value }),

    pe: (value: Stitches.PropertyValue<'pointerEvents'>) => ({
      pointerEvents: value,
    }),
    us: (value: Stitches.PropertyValue<'userSelect'>) => ({
      WebkitUserSelect: value,
      userSelect: value,
    }),

    userSelect: (value: Stitches.PropertyValue<'userSelect'>) => ({
      WebkitUserSelect: value,
      userSelect: value,
    }),

    size: (value: Stitches.PropertyValue<'width'>) => ({
      width: value,
      height: value,
    }),

    appearance: (value: Stitches.PropertyValue<'appearance'>) => ({
      WebkitAppearance: value,
      appearance: value,
    }),
    backgroundClip: (value: Stitches.PropertyValue<'backgroundClip'>) => ({
      WebkitBackgroundClip: value,
      backgroundClip: value,
    }),

    fontMono: (size: number) => {
      const min_font_width = 114;
      const font_size_unit_width = 2;
      return {
        fontFamily: '$mono',
        fontVariationSettings: `'wdth' ${
          min_font_width - size * font_size_unit_width
        }`,
        fontSize: `${size}px`,
      };
    },
  },
});

export type CSS = Stitches.CSS<typeof config>;

export const darkTheme = createTheme('dark-theme', {
  colors: {
    // Semantic colors
    hiContrast: '$slate12',
    loContrast: '$slate1',
    canvas: 'hsl(0 0% 15%)',
    panel: '$slate3',
    transparentPanel: 'hsl(0 100% 100% / 97%)',
    shadowLight: 'hsl(206 22% 7% / 35%)',
    shadowDark: 'hsl(206 22% 7% / 20%)',
  },
});
