import { IModel, State } from 'types/services/models/model';

export default function onNotificationDelete<M extends State>(
  id: number,
  model: IModel<M>,
) {
  let notifyData = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}
