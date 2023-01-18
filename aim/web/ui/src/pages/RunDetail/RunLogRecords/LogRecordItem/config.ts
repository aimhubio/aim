export const RunLogRecordsConfig: Record<
  string,
  { label: string; color: 'primary' | 'error' | 'warning' | 'info' }
> = {
  ERROR: { label: 'Error', color: 'error' },
  WARNING: { label: 'Warning', color: 'warning' },
  INFO: { label: 'Info', color: 'info' },
  DEBUG: { label: 'Debug', color: 'primary' },
};

export enum ListItemEnum {
  MONTH = 'Month',
  DAY = 'Day',
  RECORD = 'Record',
}
