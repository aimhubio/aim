import { TooltipProps } from '@material-ui/core/Tooltip';

import { IButtonProps } from 'components/kit';

export interface IActionCardProps {
  title: string;
  description: string;
  btnTooltip: TooltipProps['title'];
  btnText: string;
  onAction: () => void;
  btnProps: IButtonProps;
}
