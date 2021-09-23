import { ISetComponentRefsParams } from 'types/utils/app/setComponentsRefs';

/**
 *
 * @param {ISetComponentRefsParams<T>}
 */

export default function setComponentRefs<T>(
  params: ISetComponentRefsParams<T>,
): void {
  const modelState = params.model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, params.refElement);
    params.model.setState({ refs: modelState.refs });
  }
}
