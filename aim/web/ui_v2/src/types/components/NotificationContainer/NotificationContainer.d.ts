export interface INotificationContainer {
  data: ISnackbar[];
  handleClose: (id: string) => void;
}

export interface INotification {
  id: string;
  message: string;
  severity: 'error' | 'info' | 'success' | 'warning';
}
