import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

export interface IHighlightModesPopoverProps {
  mode: HighlightEnum;
  onChange: (mode: HighlightEnum) => void;
}
