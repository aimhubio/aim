import React from 'react';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import {
  IImageData,
  IImagesExploreAppConfig,
} from 'types/services/models/imagesExplore/imagesExploreAppModel';

import { ChartTypeEnum } from 'utils/d3';

import { MediaTypeEnum } from './config';

export interface IMediaPanelProps {
  data: any;
  orderedMap: { [key: string]: any };
  getBlobsData: (uris: string[]) => Promise;
  isLoading: boolean;
  panelResizing: boolean;
  wrapperOffsetHeight: number;
  wrapperOffsetWidth: number;
  controls?: React.ReactNode;
  resizeMode: ResizeModeEnum;
  tooltip: ITooltipContent;
  focusedState: IFocusedState;
  additionalProperties: IImagesExploreAppConfig['images']['additionalProperties'];
  onActivePointChange?: (activePoint: any, focusedStateActive: boolean) => void;
  tableHeight: string;
  mediaType: MediaTypeEnum;
  actionPanel?: React.ReactNode;
  actionPanelSize?: number;
  tooltipType: ChartTypeEnum;
}
