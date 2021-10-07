import { IModel } from 'types/services/models/model';
import { ScaleEnum } from 'utils/d3';

export interface IAxesScaleState {
  xAxis: ScaleEnum;
  yAxis: ScaleEnum;
}

export interface IAxesScalePopoverProps {
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  axesScaleType: IAxesScaleState;
}
