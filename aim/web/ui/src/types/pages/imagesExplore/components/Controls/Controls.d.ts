import { ImageRenderingEnum } from 'config/enums/imageEnums';

import { IPanelTooltip } from 'services/models/metrics/metricsAppModel';
import { IGroupingSelectOption } from 'services/models/imagesExplore/imagesExploreAppModel';

import { SortField } from 'types/services/models/metrics/metricsAppModel';
import { IImagesExploreAppConfig } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip: IPanelTooltip;
  orderedMap: { [key: string]: any };
  onChangeTooltip: (tooltip: Partial<IPanelTooltip>) => void;
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
