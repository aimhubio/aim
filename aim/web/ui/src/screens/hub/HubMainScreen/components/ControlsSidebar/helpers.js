import { flattenObject } from '../../../../../utils';

export function getGroupingOptions(
  params,
  contextKeys,
  isMetricsMode,
  isParamsMode,
) {
  const paramsFields = [];
  Object.keys(flattenObject(params)).forEach((paramPrefix) => {
    !!params[paramPrefix] &&
      params[paramPrefix].forEach((paramName) => {
        paramsFields.push(`${paramPrefix}.${paramName}`);
      });
  });

  let contextFields = [];
  if (isMetricsMode) {
    contextFields = contextKeys.map((field) => `context.${field}`);
  }

  let otherFields = [];
  if (isMetricsMode) {
    otherFields = ['experiment', 'run.hash', 'metric'];
  } else if (isParamsMode) {
    otherFields = ['experiment', 'run.hash'];
  }

  const options = [
    {
      label: 'Parameters',
      options: paramsFields.map((i) => ({
        value: `params.${i}`,
        label: i,
      })),
    },
    {
      label: 'Metrics Context',
      options: contextFields.map((i) => ({
        label: i,
        value: i,
      })),
    },
    {
      label: 'Other',
      options: otherFields.map((i) => ({
        label: i,
        value: i,
      })),
    },
  ];

  return options;
}
