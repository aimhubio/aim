import { IExperimentData } from 'pages/Dashboard/components/ExploreSection/ExperimentsCard';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

export interface IHomeProps {
  activityData: IActivityData[];
  notifyData: INotification[];
  askEmailSent: boolean;
  onSendEmail: (data: object) => Promise<any>;
  onNotificationDelete: (id: number) => void;
  experimentsData?: IExperimentData[] | undefined;
}

export interface IActivityData {
  activity_map: { [key: string]: number };
  num_experiments: number;
  num_runs: number;
}
