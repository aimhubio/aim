import React from 'react';

import {
  ImageAlignmentEnum,
  ImageRenderingEnum,
} from 'config/enums/imageEnums';

import { IPanelTooltip } from 'services/models/metrics/metricsAppModel';
import { IGroupingSelectOption } from 'services/models/imagesExplore/imagesExploreAppModel';

import { IImagesExploreAppConfig } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip: IPanelTooltip;
  onChangeTooltip: (tooltip: Partial<IPanelTooltip>) => void;
  imageProperties: IImagesExploreAppConfig['images']['imageProperties'];
  onImageSizeChange: (newValue: number) => void;
  onImageRenderingChange: (type: ImageRenderingEnum) => void;
  onImageAlignmentChange: (
    value: { value: string; label: string } | null,
  ) => void;
}
