import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { IModel, State } from 'types/services/models/model';

let timeoutId: number = 0;

export default function setRequestStatus<M extends State>(
  model: IModel<M>,
  status: RequestStatusEnum,
  delay?: number,
): void {
  if (delay || delay === 0) {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      model.setState({ requestStatus: status });
    }, delay);
  } else {
    model.setState({ requestStatus: status });
  }
}
