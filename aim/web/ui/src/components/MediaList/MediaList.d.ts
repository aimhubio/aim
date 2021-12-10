import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';

import { IMediaPanelProps } from '../MediaPanel';
import { MediaTypeEnum } from '../MediaPanel/config';

export interface IMediaListProps {
  data: IImageData[];
  addUriToList: (blobUrl: string) => void;
  wrapperOffsetWidth: number;
  mediaItemHeight: number;
  focusedState: IFocusedState;
  syncHoverState?: (args: any) => void;
  additionalProperties: IMediaPanelProps['additionalProperties'];
  tooltip?: ITooltipContent;
  mediaType: MediaTypeEnum;
}

export interface IImageBoxProps {
  data: IImageData;
  addUriToList: (blobUrl: string) => void;
  index: number;
  mediaItemHeight: number;
  focusedState: IFocusedState;
  tooltip?: ITooltipContent;
  syncHoverState?: (args: any) => void;
  additionalProperties: IMediaPanelProps['additionalProperties'];
  style: { [key: string]: any };
}
