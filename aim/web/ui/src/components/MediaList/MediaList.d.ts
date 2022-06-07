import { IMediaPanelProps } from 'components/MediaPanel';
import { MediaTypeEnum } from 'components/MediaPanel/config';

import {
  IGroupingSelectOption,
  IImageData,
} from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  IFocusedState,
  IPanelTooltip,
} from 'types/services/models/metrics/metricsAppModel';

export interface IMediaListProps {
  data: IImageData[];
  addUriToList: (blobUrl: string) => void;
  wrapperOffsetWidth: number;
  wrapperOffsetHeight: number;
  mediaItemHeight: number;
  focusedState: IFocusedState;
  additionalProperties?: IMediaPanelProps['additionalProperties'];
  tooltip?: IPanelTooltip;
  mediaType: MediaTypeEnum;
  selectOptions: IGroupingSelectOption[];
}

export interface IImageBoxProps {
  data: IImageData;
  addUriToList: (blobUrl: string) => void;
  index: number;
  mediaItemHeight: number;
  focusedState: IFocusedState;
  tooltip?: IPanelTooltip;
  additionalProperties?: IMediaPanelProps['additionalProperties'];
  style: { [key: string]: any };
  selectOptions: IGroupingSelectOption[];
}
