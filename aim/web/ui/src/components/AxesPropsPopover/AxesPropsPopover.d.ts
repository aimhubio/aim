import { IMetricProps } from 'types/pages/metrics/Metrics';
import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

export interface IAxesPropsPopoverProps {
  onAlignmentMetricChange: IMetricProps['onAlignmentMetricChange'];
  onAlignmentTypeChange: IMetricProps['onAlignmentTypeChange'];
  alignmentConfig: IAlignmentConfig;
  selectFormOptions: ISelectOption[];
  axesScaleRange: IAxesScaleRange;
  onAxesScaleRangeChange: IMetricProps['onAxesScaleRangeChange'];
}

export interface IAxesScaleRange {
  yAxis: { min?: number; max?: number };
  xAxis: { min?: number; max?: number };
}

export interface IAxesRangeValue {
  min?: number;
  max?: number;
}

export interface IAxesRangeValidation {
  min: boolean;
  max: boolean;
}
