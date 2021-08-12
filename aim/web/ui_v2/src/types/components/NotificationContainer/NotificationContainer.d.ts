export interface INotificationContainer {
  data: ISnackbar[];
  handleClose: (e: any) => void;
}

export interface INotification {
  id: string;
  message: string;
  severity: 'error' | 'info' | 'success' | 'warning';
}
