import { CircularProgressProps } from '@material-ui/core';

export interface ISpinnerProps extends CircularProgressProps {
  className?: string;
  style?: React.StyleHTMLAttributes;
}
