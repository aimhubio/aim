import { IBoxConfigState } from '../';

export interface IBoxPropertiesPopoverProps {
  update: (boxProps: Partial<IBoxConfigState>) => void;
  reset: () => void;
  boxProperties: IBoxConfigState;
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
