export interface IRunLogsTabProps {
  isRunLogsLoading: boolean;
  runHash: string;
  runLogs: { [key: string]: { index: string; value: string } };
  inProgress: boolean;
  updatedLogsCount: number;
}

export enum LogsLastRequestEnum {
  DEFAULT = 'default',
  LIVE_UPDATE = 'live-update',
  LOAD_MORE = 'load-more',
}
