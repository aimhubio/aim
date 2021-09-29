import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

export default function getGroupingSelectOptions(
  params: string[],
): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    value: `run.params.${param}`,
    group: 'params',
    label: param,
  }));

  return [
    ...paramsOptions,
    {
      group: 'Run',
      label: 'run.experiment',
      value: 'run.props.experiment',
    },
    {
      group: 'Run',
      label: 'run.hash',
      value: 'run.hash',
    },
    {
      group: 'metric',
      label: 'metric',
      value: 'metric_name',
    },
    {
      group: 'metric',
      label: 'context.subset',
      value: 'context.subset',
    },
  ];
}
