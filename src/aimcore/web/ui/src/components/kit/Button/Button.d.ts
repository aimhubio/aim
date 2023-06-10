import { ButtonProps } from '@material-ui/core/Button';

export interface IButtonProps extends ButtonProps {
  withOnlyIcon?: boolean;
  size?: ButtonProps['size'] | 'xSmall' | 'xxSmall';
}
