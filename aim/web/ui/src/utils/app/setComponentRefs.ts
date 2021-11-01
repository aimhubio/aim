import { IModel, State } from 'types/services/models/model';

/**
 *
 * @param {ISetComponentRefsParams<T>}
 */

export default function setComponentRefs<M extends State>({
  refElement,
  model,
}: {
  refElement: any;
  model: IModel<M>;
}): void {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
  }
}
