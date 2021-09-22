import { IModel } from 'types/services/models/model';

export default function setComponentRefs(
  refElement: React.MutableRefObject<any> | object,
  model: IModel<any>,
) {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
  }
}
