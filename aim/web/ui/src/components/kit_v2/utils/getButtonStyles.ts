import { ButtonVariantType } from '../Button';

export function getButtonStyles(
  color: string,
  variant: ButtonVariantType,
  disabled: boolean | undefined,
) {
  switch (variant) {
    case 'contained':
      return {
        bc: `$background-${disabled ? 'disable' : 'default'}-${color}-${
          disabled ? 'soft' : 'plain'
        }`,
        color: 'white',
        '&:hover': {
          bc: `$background-hover-${color}-bold`,
        },
        '&:active': {
          bc: `$background-active-${color}-dark`,
        },
      };
    case 'outlined':
      return {
        bc: 'transparent',
        color: `$text-${disabled ? 'disable' : 'default'}-${color}-${
          disabled ? 'soft' : 'plain'
        }`,
        bs: 'inset 0px 0px 0px 1px',
        '&:hover': {
          bc: `$background-hover-${color}-airly`,
          color: `$text-hover-${color}-bold`,
        },
        '&:active': {
          bc: `$background-active-${color}-light`,
          color: `$text-active-${color}-dark`,
        },
      };
    case 'ghost':
      return {
        bc: 'transparent',
        color: `$text-${disabled ? 'disable' : 'default'}-${color}-${
          disabled ? 'soft' : 'plain'
        }`,
        '&:hover': {
          bc: `$background-hover-${color}-airly`,
          color: `$text-hover-${color}-bold`,
        },
        '&:active': {
          bc: `$background-active-${color}-light`,
          color: `$text-active-${color}-dark`,
        },
      };
    case 'static':
      return {
        bc: 'transparent',
        color: `$text-${disabled ? 'disable' : 'default'}-${color}-${
          disabled ? 'soft' : 'plain'
        }`,
        '&:active': {
          color: `$text-active-${color}-dark`,
        },
      };
  }
}
