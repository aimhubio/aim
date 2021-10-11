import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IModel, State } from 'types/services/models/model';
import onNotificationDelete from './onNotificationDelete';

export default function onNotificationAdd<
  M extends State,
  N extends INotification,
>(notification: N, model: IModel<M>): void {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id, model);
  }, 3000);
}
