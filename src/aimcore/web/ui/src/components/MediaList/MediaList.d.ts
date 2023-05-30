import { IMediaPanelProps } from 'components/MediaPanel';
import { MediaTypeEnum } from 'components/MediaPanel/config';

import {
  IGroupingSelectOption,
  IImageData,
} from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  IFocusedState,
  ITooltip,
} from 'types/services/models/metrics/metricsAppModel';

export interface IMediaListProps {
  data: IImageData[];
  addUriToList: (blobUrl: string) => void;
  wrapperOffsetWidth: number;
  wrapperOffsetHeight: number;
  mediaItemHeight: number;
  focusedState: IFocusedState;
  additionalProperties?: IMediaPanelProps['additionalProperties'];
  tooltip?: ITooltip;
  mediaType: MediaTypeEnum;
  selectOptions: IGroupingSelectOption[];
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
}

export interface IImageBoxProps {
  data: IImageData;
  addUriToList: (blobUrl: string) => void;
  index: number;
  mediaItemHeight: number;
  focusedState: IFocusedState;
  tooltip?: ITooltip;
  additionalProperties?: IMediaPanelProps['additionalProperties'];
  style: { [key: string]: any };
  selectOptions: IGroupingSelectOption[];
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
}
