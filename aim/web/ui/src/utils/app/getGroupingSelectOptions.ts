import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

export default function getGroupingSelectOptions({
  params,
  contexts = [],
  sequenceName = null,
}: {
  params: string[];
  contexts?: string[];
  sequenceName?: null | 'metric' | 'images';
}): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    group: 'run',
    label: `run.${param}`,
    value: `run.params.${param}`,
  }));

  let options = [
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
    {
      group: 'run',
      label: 'run.creation_time',
      value: 'run.props.creation_time',
    },
    ...paramsOptions,
  ];

  let contextOptions: IGroupingSelectOption[];
  let nameOption: IGroupingSelectOption;

  if (sequenceName) {
    contextOptions = contexts.map((context) => ({
      group: sequenceName,
      label: `${sequenceName}.context.${context}`,
      value: `context.${context}`,
    }));
    nameOption = {
      group: sequenceName,
      label: `${sequenceName}.name`,
      value: 'name',
    };
    options = options.concat(nameOption, contextOptions);
  }

  return options;
}
