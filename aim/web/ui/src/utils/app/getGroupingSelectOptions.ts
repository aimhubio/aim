import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

export default function getGroupingSelectOptions({
  params,
  contexts = [],
}: {
  params: string[];
  contexts?: string[];
}): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    group: 'run',
    label: `run.${param}`,
    value: `run.params.${param}`,
  }));

  const contextOptions: IGroupingSelectOption[] = contexts.map((context) => ({
    group: 'metric',
    label: `metric.context.${context}`,
    value: `context.${context}`,
  }));

  return [
    {
      group: 'run',
      label: 'run.experiment',
      value: 'run.props.experiment.name',
    },
    {
      group: 'run',
      label: 'run.hash',
      value: 'run.hash',
    },
    ...paramsOptions,
    {
      group: 'metric',
      label: 'metric.name',
      value: 'name',
    },
    ...contextOptions,
  ];
}
