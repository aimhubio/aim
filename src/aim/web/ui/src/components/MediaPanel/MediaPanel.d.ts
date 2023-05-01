import React from 'react';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import {
  IFocusedState,
  IGroupingSelectOption,
  ITooltip,
} from 'types/services/models/metrics/metricsAppModel';
import { IImagesExploreAppConfig } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import { IIllustrationConfig } from 'types/components/Table/Table';

import { ChartTypeEnum } from 'utils/d3';
import { SortFields } from 'utils/getSortedFields';

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
  tooltip?: ITooltip;
  focusedState: IFocusedState;
  selectOptions?: IGroupingSelectOption[];
  additionalProperties?:
    | IImagesExploreAppConfig['images']['additionalProperties']
    | any;
  tableHeight: string;
  mediaType: MediaTypeEnum;
  actionPanel?: React.ReactNode;
  actionPanelSize?: number;
  tooltipType?: ChartTypeEnum;
  onActivePointChange?: (activePoint: any, focusedStateActive: boolean) => void;
  getBlobsData: (uris: string[]) => Promise;
  sortFieldsDict?: { [key: string]: SortField };
  sortFields?: SortFields;
  illustrationConfig?: IIllustrationConfig;
  onRunsTagsChange?: (runHash: string, tags: ITagInfo[]) => void;
  onChangeTooltip?: (tooltip: ITooltip) => void;
}
