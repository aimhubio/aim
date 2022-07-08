import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface INotificationContainer {
  data: INotification[];
  handleClose: IMetricProps['onNotificationDelete'];
}

export interface INotification {
  id: number;
  messages: string[];
  closeDelay?: number;
  severity: 'error' | 'info' | 'success' | 'warning';
}

export interface ISyntaxErrorDetails {
  detail: {
    line: number;
    offset: number;
    end_offset?: number;
    statement: string;
  };
  message: string;
}
