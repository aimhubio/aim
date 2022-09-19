import { IMediaPanelProps } from 'components/MediaPanel';
import { MediaTypeEnum } from 'components/MediaPanel/config';

import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import {
  IFocusedState,
  ITooltip,
} from 'types/services/models/metrics/metricsAppModel';

import { SortFields } from 'utils/getSortedFields';

export interface IMediaSetProps {
  data: { [key: string]: any };
  orderedMap: { [key: string]: any };
  onListScroll: ({ scrollOffset: number }) => void;
  addUriToList: (blobUrl: string) => void;
  index?: number;
  mediaSetKey: number;
  wrapperOffsetHeight: number;
  wrapperOffsetWidth: number;
  focusedState: IFocusedState;
  additionalProperties?: IMediaPanelProps['additionalProperties'];
  tableHeight: IMediaPanelProps['tableHeight'];
  tooltip?: ITooltip;
  mediaType: MediaTypeEnum;
  sortFieldsDict?: { [key: string]: SortField };
  sortFields?: SortFields;
  selectOptions: IGroupingSelectOption[];
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
}
