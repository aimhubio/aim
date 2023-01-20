import { IconName } from 'components/kit/Icon';

export const RunLogRecordsConfig: Record<
  string,
  { icon: IconName; color: string; background: string }
> = {
  ERROR: { icon: 'close-circle', color: '#e64e48', background: '#F9E7E6' },
  WARNING: {
    icon: 'warning-contained',
    color: '#ffcc00',
    background: '#FEF7E8',
  },
  INFO: { icon: 'circle-info', color: '#1473e6', background: '#ECF1FD' },
  DEBUG: { icon: 'search', color: '#1c2852', background: '#E8EAEE' },
};

export enum ListItemEnum {
  MONTH = 'Month',
  DAY = 'Day',
  RECORD = 'Record',
  EMPTY = 'Empty',
}
