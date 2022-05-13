export interface IRunLogsTabProps {
  isRunLogsLoading: boolean;
  runHash: string;
  runLogs: { [key: string]: any };
  inProgress: boolean;
  updatedLogsCount: number;
}
