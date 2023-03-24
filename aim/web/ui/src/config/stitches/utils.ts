import * as Stitches from '@stitches/react';
import { ConfigType } from '@stitches/react/types/config';

export const utils: ConfigType.Utils = {
  inputBorder: () => ({
    border: '1px solid $colors$secondary50',
  }),
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

  minSize: (value: Stitches.PropertyValue<'minWidth'>) => ({
    minWidth: value,
    minHeight: value,
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
};
