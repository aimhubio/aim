import { DensityOptions } from 'config/enums/densityEnum';

import { ISelectOption } from 'services/models/explorer/createAppModel';

import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';

import { AlignmentOptionsEnum } from 'utils/d3';

export interface IAlignmentPopoverProps {
  onAlignmentMetricChange: (metric: string) => void;
  onAlignmentTypeChange: (type: AlignmentOptionsEnum) => void;
  onDensityTypeChange: (type: DensityOptions) => void;
  alignmentConfig: IAlignmentConfig;
  densityType: DensityOptions;
  selectFormOptions: ISelectOption[];
}
