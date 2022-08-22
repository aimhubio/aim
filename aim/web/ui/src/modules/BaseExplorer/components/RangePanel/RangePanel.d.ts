import { IQueryableData } from 'modules/core/engine';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IRangePanelProps {
  engine: IBaseComponentProps['engine'];
  rangesData: any;
}

export interface IRangePanelItemProps {
  engine: IBaseComponentProps['engine'];
  sliderName: 'record' | 'index';
  onSubmit: () => {};
  itemConfig: {
    sliderTitle: string;
    countTitleTooltip: string;
    countInputTitle: string;
    sliderTitleTooltip: string;
    type: string;
  };
  ranges: IRangesState;
  rangesData: IQueryableData;
}

export interface IRangesState {
  record?: IRangeState;
  index?: IRangeState;
  isInputInvalid?: boolean;
  isApplyButtonDisabled?: boolean;
}

export interface IRangeState {
  slice: [number, number];
  density: number;
}
