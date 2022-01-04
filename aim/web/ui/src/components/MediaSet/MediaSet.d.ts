import { IMediaPanelProps } from 'components/MediaPanel';

import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';

import { SortFields } from 'utils/getSortedFields';

import { MediaTypeEnum } from './config';
export interface IMediaSetProps {
  data: { [key: string]: any };
  orderedMap: { [key: string]: any };
  onListScroll: ({ scrollOffset: number }) => void;
  addUriToList: (blobUrl: string) => void;
  index?: number;
  setKey: number;
  wrapperOffsetHeight?: number;
  wrapperOffsetWidth?: number;
  mediaItemHeight: number;
  syncHoverState?: (args: any) => void;
  focusedState: IFocusedState;
  additionalProperties?: IMediaPanelProps['additionalProperties'];
  tableHeight: IMediaPanelProps['tableHeight'];
  tooltip?: ITooltipContent;
  mediaType: MediaTypeEnum;
  sortFieldsDict?: { [key: string]: SortField };
  sortFields?: SortFields;
}
