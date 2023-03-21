import { ButtonVariantType } from '../Button';

export function getButtonStyles(
  color: string,
  variant: ButtonVariantType,
  disabled: boolean | undefined,
) {
  switch (variant) {
    case 'contained':
      return {
        bc: `$${color}${disabled ? 50 : 100}`,
        color: 'white',
        '&:hover': {
          bc: `$${color}110`,
        },
        '&:active': {
          bc: `$${color}120`,
        },
      };
    case 'outlined':
      return {
        bc: 'transparent',
        color: `$${color}${disabled ? 50 : 100}`,
        bs: 'inset 0px 0px 0px 1px',
        '&:hover': {
          backgroundColor: `$${color}10`,
          color: `$${color}110`,
        },
        '&:active': {
          bc: `$${color}20`,
          color: `$${color}120`,
        },
      };
    case 'ghost':
      return {
        bc: 'transparent',
        color: `$${color}${disabled ? 50 : 100}`,
        '&:hover': {
          bc: `$${color}10`,
          color: `$${color}110`,
        },
        '&:active': {
          bc: `$${color}20`,
          color: `$${color}120`,
        },
      };
    case 'static':
      return {
        bc: 'transparent',
        color: `$${color}${disabled ? 50 : 100}`,
        '&:active': {
          color: `$${color}120`,
        },
      };
  }
}
