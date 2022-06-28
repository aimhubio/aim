import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { IModel, State } from 'types/services/models/model';

import onNotificationAdd from './onNotificationAdd';

export default function exceptionHandler<M extends State>({
  detail,
  model,
}: {
  detail: any;
  model: IModel<M>;
}) {
  let message: string = '';
  if (detail.message === 'SyntaxError') {
    message = `Query syntax error at line (${detail.detail.Line}, ${detail.detail.Offset})`;
  } else {
    message = detail.message || 'Something went wrong';
  }
  model.setState({ requestStatus: RequestStatusEnum.BadRequest });
  onNotificationAdd({
    notification: {
      id: Date.now(),
      severity: 'error',
      messages: [message],
    },
    model,
  });
}
