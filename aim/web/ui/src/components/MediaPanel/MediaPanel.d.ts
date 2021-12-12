import React from 'react';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { IImagesExploreAppConfig } from 'types/services/models/imagesExplore/imagesExploreAppModel';

import { ChartTypeEnum } from 'utils/d3';

import { MediaTypeEnum } from './config';

export interface IMediaPanelProps {
  data: { [key: string]: any };
  orderedMap: { [key: string]: any };
  isLoading: boolean;
  panelResizing: boolean;
  wrapperOffsetHeight: number;
  wrapperOffsetWidth: number;
  controls?: React.ReactNode;
  resizeMode?: ResizeModeEnum;
  tooltip?: ITooltipContent;
  focusedState: IFocusedState;
  additionalProperties: IImagesExploreAppConfig['images']['additionalProperties'];
  tableHeight: string;
  mediaType: MediaTypeEnum;
  actionPanel?: React.ReactNode;
  actionPanelSize?: number;
  tooltipType?: ChartTypeEnum;
  onActivePointChange?: (activePoint: any, focusedStateActive: boolean) => void;
  getBlobsData: (uris: string[]) => Promise;
}
