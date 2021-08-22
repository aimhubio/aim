import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';

export interface IAlignmentPopoverProps {
  onAlignmentMetricChange: (e) => void;
  onAlignmentTypeChange: (e) => void;
  alignmentConfig: IAlignmentConfig;
}
