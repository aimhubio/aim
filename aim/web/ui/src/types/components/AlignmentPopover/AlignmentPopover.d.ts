import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import { DensityOptions } from 'config/enums/densityEnum';

export interface IAlignmentPopoverProps {
  onAlignmentMetricChange: (metric: string) => void;
  onAlignmentTypeChange: (type: AlignmentOptions) => void;
  onDensityTypeChange: (type: DensityOptions) => void;
  alignmentConfig: IAlignmentConfig;
  densityType: DensityOptions;
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
}
