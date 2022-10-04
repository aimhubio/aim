import { HighlightEnum } from 'utils/d3';

export interface IHighlightModesPopoverProps {
  mode: HighlightEnum;
  onChange: (mode: HighlightEnum) => void;
}
