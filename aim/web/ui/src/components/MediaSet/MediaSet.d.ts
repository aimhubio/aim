import { IMediaPanelProps } from 'components/MediaPanel';

import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';

import { MediaTypeEnum } from './config';
export interface IMediaSetProps {
  data: any;
  orderedMap: { [key: string]: any };
  onScroll: () => void;
  onListScroll: ({ scrollOffset: number }) => void;
  addUriToList: (blobUrl: string) => void;
  index?: number;
  setKey: number;
  wrapperOffsetHeight?: number;
  wrapperOffsetWidth?: number;
  mediaItemHeight: number;
  syncHoverState?: (args: any) => void;
  focusedState: IFocusedState;
  additionalProperties: IMediaPanelProps['additionalProperties'];
  tableHeight: IMediaPanelProps['tableHeight'];
  tooltip: ITooltipContent;
  mediaType: MediaTypeEnum;
}
