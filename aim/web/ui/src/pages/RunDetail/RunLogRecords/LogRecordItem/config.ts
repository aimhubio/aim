import { IconName } from 'components/kit/Icon';

export const RunLogRecordsConfig: Record<
  string,
  { icon: IconName; color: string; background: string }
> = {
  ERROR: { icon: 'close-circle', color: '#e64e48', background: '#e64e484a' },
  WARNING: {
    icon: 'warning-contained',
    color: '#ffcc00',
    background: '#ffcc004a',
  },
  INFO: { icon: 'circle-info', color: '#1473e6', background: '#1473e64a' },
  DEBUG: { icon: 'search', color: '#1c2852', background: '#1c28524a' },
};

export enum ListItemEnum {
  MONTH = 'Month',
  DAY = 'Day',
  RECORD = 'Record',
  EMPTY = 'Empty',
}
