import { IModel, State } from 'types/services/models/model';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

export default function onNotificationDelete<M extends State>({
  id,
  model,
}: {
  id: number;
  model: IModel<M>;
}): void {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}
