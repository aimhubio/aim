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

export interface ISyntaxErrorDetail {
  line: number;
  offset: number;
  end_offset?: number;
  statement: string;
}

export interface ISyntaxErrorDetails {
  detail: ISyntaxErrorDetail;
  message: string;
}
