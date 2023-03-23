import { IQueryableData } from 'modules/core/engine';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IVisualizerRangePanelProps extends IBaseComponentProps {}

export interface IRangePanelProps extends IBaseComponentProps {
  rangesData: IQueryableData;
}

export interface IRangePanelItemProps extends IBaseComponentProps {
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
