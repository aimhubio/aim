import { IRunInfo } from 'pages/RunDetail/types.d';

import { TraceRawDataItem, TraceType } from 'services/models/runs/types';

export interface IRunOverviewSidebarProps {
  info: IRunInfo;
  runHash: string;
  traces: Record<TraceType, TraceRawDataItem[]>;
}
