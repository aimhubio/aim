export interface IRunLogRecordsProps {
  runHash: string;
}

export type RunLogRecordType = {
  message: string;
  log_level: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
  hash: number;
  args: any;
  is_notified: boolean;
  timestamp: number;
};
