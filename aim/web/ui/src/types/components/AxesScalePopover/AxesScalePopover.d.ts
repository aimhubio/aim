import { IModel } from 'types/services/models/model';
import { ScaleEnum } from 'utils/d3';

export interface IAxesScaleState {
  xAxis: ScaleEnum;
  yAxis: ScaleEnum;
  model?: IModel<any>;
  appName?: string;
}

export interface IAxesScalePopoverProps {
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  axesScaleType: IAxesScaleState;
}
