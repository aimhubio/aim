import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import { DensityOptions } from 'config/enums/densityEnum';

export interface IAlignmentPopoverProps {
  onAlignmentMetricChange: (metric: string) => void;
  onAlignmentTypeChange: (type: AlignmentOptionsEnum) => void;
  onDensityTypeChange: (type: DensityOptions) => void;
  alignmentConfig: IAlignmentConfig;
  densityType: DensityOptions;
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
}
