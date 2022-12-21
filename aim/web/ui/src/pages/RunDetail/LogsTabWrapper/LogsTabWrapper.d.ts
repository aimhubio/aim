export interface ILogsTabWrapperProps {
  isRunLogsLoading: boolean;
  runHash: string;
  runLogs: { [key: string]: { index: string; value: string } };
  inProgress: boolean;
  updatedLogsCount: number;
}
