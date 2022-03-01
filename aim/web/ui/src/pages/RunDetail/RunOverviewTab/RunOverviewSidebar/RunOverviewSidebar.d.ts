import { TraceRawDataItem, TraceType } from 'services/models/runs/types';

import { IRunInfo } from '../../types';

export interface IRunOverviewSidebarProps {
  info: IRunInfo;
  runHash: string;
  traces: Record<TraceType, TraceRawDataItem[]>;
}
