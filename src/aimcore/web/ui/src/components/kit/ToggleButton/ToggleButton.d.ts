import { ButtonProps } from '@material-ui/core';

export default interface IToggleButtonProps extends ButtonProps {
  onChange: (value: string | number | any, id?: string | number | any) => void;
  id?: string | undefined;
  leftLabel: string;
  rightLabel: string;
  leftValue: number | string;
  rightValue: number | string;
  value: string | number;
  title: string;
}
