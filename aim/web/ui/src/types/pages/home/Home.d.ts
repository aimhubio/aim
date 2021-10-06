import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

export interface IHomeProps {
  activityData: IActivityData[];
  onSendEmail: (data: object) => Promise<any>;
  notifyData: INotification[];
  onNotificationDelete: (id: number) => void;
}

export interface IActivityData {
  activity_map: { [key: string]: number };
  num_experiments: number;
  num_runs: number;
}
