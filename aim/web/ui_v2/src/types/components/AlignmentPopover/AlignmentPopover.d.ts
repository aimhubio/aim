import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';
import { XAlignmentEnum } from 'utils/d3';

export interface IAlignmentPopoverProps {
  onAlignmentMetricChange: (e) => void;
  onAlignmentTypeChange: (e) => void;
  alignmentConfig: IAlignmentConfig;
}
