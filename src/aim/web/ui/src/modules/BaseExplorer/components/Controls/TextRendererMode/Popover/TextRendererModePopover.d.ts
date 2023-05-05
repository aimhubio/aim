import { ITextRendererModeState } from '../';

export interface ITextRendererModePopoverProps {
  update: (textRenderer: Partial<ITextRendererModeState>) => void;
  reset?: () => void;
  textRenderer: ITextRendererModeState;
  updateDelay?: number;
}
