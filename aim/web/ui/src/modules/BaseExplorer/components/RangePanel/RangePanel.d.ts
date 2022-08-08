export interface IRangePanelItemProps {
  engine: any;
  sliderName: string;
  onSubmit: () => {};
  itemConfig: {
    sliderTitle: string;
    countTitleTooltip: string;
    countInputTitle: string;
    sliderTitleTooltip: string;
    type: string;
  };
}

export interface IRangesState {
  record?: { slice: [number, number]; density: number };
  index?: { slice: [number, number]; density: number };
  isInputInvalid?: boolean;
  isApplyButtonDisabled?: boolean;
}
