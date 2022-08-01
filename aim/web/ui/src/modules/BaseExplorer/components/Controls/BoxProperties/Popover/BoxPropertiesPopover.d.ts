import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { IBoxConfigState } from '../';

export interface IBoxPropertiesPopoverProps extends IBaseComponentProps {
  boxConfig: IBoxConfigState;
  updateDelay?: number;
  settings: {
    maxWidth: number;
    minWidth: number;
    maxHeight: number;
    minHeight: number;
    maxGap: number;
    minGap: number;
    step: number;
  };
}
