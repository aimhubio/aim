import { SwitchProps } from '@material-ui/core';

export default interface IToggleButtonProps extends SwitchProps {
  onChange: (event: React.ChangeEvent<any>, checked: boolean) => void;
  id: string | undefined;
  leftLabel: string;
  rightLabel?: string;
}
