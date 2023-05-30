import { ImageRenderingEnum } from 'config/enums/imageEnums';

import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  ITooltip,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';
import { IImagesExploreAppConfig } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip?: ITooltip;
  orderedMap: { [key: string]: any };
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
  additionalProperties: IImagesExploreAppConfig['images']['additionalProperties'];
  onImageSizeChange: (newValue: number) => void;
  onImageRenderingChange: (type: ImageRenderingEnum) => void;
  onImageAlignmentChange: (
    value: { value: string; label: string } | null,
  ) => void;
  onStackingToggle: () => void;
  onImagesSortReset: () => void;
  onImagesSortChange: any;
  sortFields: SortField[];
}
