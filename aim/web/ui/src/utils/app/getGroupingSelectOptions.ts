import _ from 'lodash-es';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

export default function getGroupingSelectOptions({
  params,
  runProps = [],
  contexts = [],
  sequenceName = null,
}: {
  params: string[];
  runProps?: string[];
  contexts?: string[];
  sequenceName?: null | 'metric' | 'images' | 'audios';
}): IGroupingSelectOption[] {
  let options = [
    {
      group: 'run',
      label: 'run.hash',
      value: 'run.hash',
    },
  ];

  if (runProps?.length) {
    const filterPropsOptions = ['notes', 'tags', 'experiment.id'];
    const replacePropsLabel: { [key: string]: string } = {
      'experiment.name': 'experiment',
    };
    const propsOptions: IGroupingSelectOption[] = runProps
      .filter((runProp: string) => filterPropsOptions.indexOf(runProp) === -1)
      .map((runProp: string) => {
        let propLabel = runProp;
        if (replacePropsLabel.hasOwnProperty(runProp)) {
          propLabel = replacePropsLabel[runProp];
        }
        return {
          group: 'run',
          label: `run.${propLabel}`,
          value: `run.props.${runProp}`,
        };
      });

    options = options.concat(propsOptions);
  }

  if (params?.length) {
    const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
      group: 'run',
      label: param[0] === '[' ? `run${param}` : `run.${param}`,
      value: param[0] === '[' ? `run.params${param}` : `run.params.${param}`,
    }));

    options = options.concat(paramsOptions);
  }

  if (sequenceName) {
    let contextOptions = contexts.map((context) => ({
      group: sequenceName,
      label: `${sequenceName}.context.${context}`,
      value: `context.${context}`,
    }));
    let nameOption = {
      group: sequenceName,
      label: `${sequenceName}.name`,
      value: 'name',
    };
    let contextOption = {
      group: sequenceName,
      label: `${sequenceName}.context`,
      value: 'context',
    };
    options = !_.isEmpty(contexts)
      ? options.concat(nameOption, contextOption, contextOptions)
      : options.concat(nameOption);
  }

  if (sequenceName === 'images' || sequenceName === 'audios') {
    const recordOptions = [
      {
        group: 'record',
        label: 'record.step',
        value: 'step',
      },
      {
        group: 'record',
        label: 'record.index',
        value: 'index',
      },
    ];
    options = options.concat(recordOptions);
  }

  return options;
}
