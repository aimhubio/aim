import {  IRunInfo } from '../../types';
import { TraceRawDataItem, TraceType } from 'services/models/runs/types';

export interface IRunOverviewSidebarProps {
  info: IRunInfo;
  traces:  Record<TraceType, TraceRawDataItem[]>;
  systemBatchLength: number
}
