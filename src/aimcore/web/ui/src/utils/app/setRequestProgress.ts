import { IModel, State } from 'types/services/models/model';

export interface IRequestProgress {
  matched: number;
  checked: number;
  trackedRuns: number;
  percent?: number;
}

export default function setRequestProgress<M extends State>(
  model: IModel<M>,
  progress: Partial<IRequestProgress> = {},
) {
  const { checked = 0, trackedRuns = 0 } = progress;

  model.setState({
    requestProgress: {
      ...progress,
      percent: trackedRuns ? Math.ceil((checked / trackedRuns) * 100) : 0,
    },
  });
}
