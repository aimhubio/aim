import { ButtonSizeType, IButtonProps } from './Button.d';

export const ButtonSpacingMap = {
  compact: { xs: '0 $4', sm: '0 $4', md: '0 $5', lg: '0 $6', xl: '0 $7' },
  default: { xs: '0 $7', sm: '0 $7', md: '0 $8', lg: '0 $9', xl: '0 $11' },
};

export const getIconSpacing = (
  spacing: IButtonProps['horizontalSpacing'],
  size: ButtonSizeType,
) => {
  if (spacing === 'compact') {
    return 'calc($3 * -1)';
  }
  let spaces: Record<string, string> = {
    xs: 'calc($3 * -1)',
    sm: 'calc($3 * -1)',
    md: 'calc($4 * -1)',
    lg: 'calc($5 * -1)',
    xl: 'calc($7 * -1)',
  };
  return spaces[size];
};
