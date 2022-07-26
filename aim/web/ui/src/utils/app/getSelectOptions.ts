import COLORS from 'config/colors/colors';

import { ISelectOption } from 'types/services/models/explorer/createAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';

import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import contextToString from 'utils/contextToString';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import getObjectPaths from 'utils/getObjectPaths';
import { isSystemMetric } from 'utils/isSystemMetric';

export default function getSelectOptions(
  projectsData: IProjectParamsMetrics,
): ISelectOption[] {
  const comparator = alphabeticalSortComparator<ISelectOption>({
    orderBy: 'label',
  });
  let systemOptions: ISelectOption[] = [];
  let params: ISelectOption[] = [];
  let metrics: ISelectOption[] = [];

  if (projectsData?.metric) {
    for (let key in projectsData.metric) {
      let system: boolean = isSystemMetric(key);
      for (let val of projectsData.metric[key]) {
        let label = contextToString(val);
        let index: number = metrics.length;
        let option: ISelectOption = {
          label: `${system ? formatSystemMetricName(key) : key} ${label}`,
          group: system ? 'System' : key,
          type: 'metrics',
          color: COLORS[0][index % COLORS[0].length],
          value: {
            option_name: key,
            context: val,
          },
        };
        if (system) {
          systemOptions.push(option);
        } else {
          metrics.push(option);
        }
      }
    }
  }
  if (projectsData?.params) {
    const paramPaths = getObjectPaths(projectsData.params, projectsData.params);
    paramPaths.forEach((paramPath, index) => {
      const indexOf =
        paramPath.indexOf('.__example_type__') !== -1 ||
        paramPath[paramPath.length - 1] === '.'
          ? paramPath.indexOf('.__example_type__')
          : paramPath.length;
      params.push({
        label: paramPath.slice(0, indexOf),
        group: 'Params',
        type: 'params',
        color: COLORS[0][index % COLORS[0].length],
      });
    });
  }

  params = params.sort(comparator);
  metrics = metrics.sort(comparator);
  systemOptions = systemOptions.sort(comparator);

  return [...metrics, ...params, ...systemOptions];
}
