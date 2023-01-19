export interface IRunLogRecordsProps {
  runHash: string;
  inProgress: boolean;
}

export type RunLogRecordType = {
  message: string;
  log_level: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
  hash: number;
  args: Record<string, any>;
  is_notified: boolean;
  timestamp: number;
};

export type RunLogRecordStateType = {
  runLogRecordsList: RunLogRecordType[];
  runLogRecordsTotalCount: number;
};

export type MessagesItemType =
  | {
      date: string;
      itemType: ListItemEnum;
      height: number;
    }
  | { date: string; itemType: ListItemEnum; height: number }
  | {
      date: string;
      hash: string;
      message: string;
      type: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
      creation_time: string;
      extraParams: Record<string, any>;
      runId: string;
      itemType: ListItemEnum;
      height: number;
    };
