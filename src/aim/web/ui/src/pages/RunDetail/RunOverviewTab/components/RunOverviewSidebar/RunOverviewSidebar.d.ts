import { IRunInfo } from 'pages/RunDetail/types.d';

import { TraceRawDataItem, TraceType } from 'services/models/runs/types';

export interface IRunOverviewSidebarProps {
  info: IRunInfo;
  runHash: string;
  traces: Record<TraceType, TraceRawDataItem[]>;
  sidebarRef: HTMLElement | any;
  overviewSectionRef: HTMLElement | any;
  overviewSectionContentRef: HTMLElement | any;
  setContainerHeight: (containerHeight: number) => void;
}
