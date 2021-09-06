import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';

export interface IAlignmentPopoverProps {
  onAlignmentMetricChange: (e) => void;
  onAlignmentTypeChange: (e) => void;
  alignmentConfig: IAlignmentConfig;
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
}
