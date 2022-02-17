import _ from 'lodash-es';

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
  let contextOption: IGroupingSelectOption;
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
    contextOption = {
      group: sequenceName,
      label: `${sequenceName}.context`,
      value: 'context',
    };
    options = !_.isEmpty(contexts)
      ? options.concat(nameOption, contextOption, contextOptions)
      : options.concat(nameOption);
  }

  return options;
}
