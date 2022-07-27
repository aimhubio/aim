import _ from 'lodash';

import COLORS from 'config/colors/colors';

import { ISelectOption } from 'types/services/models/explorer/createAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';

import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import getObjectPaths from 'utils/getObjectPaths';

import { getLabelAndValueOfMetric } from './getLabelAndValueOfMetric';

export default function getSelectOptions(
  projectsData: IProjectParamsMetrics,
  addHighLevelMetrics: boolean = false,
): ISelectOption[] {
  const comparator = alphabeticalSortComparator<ISelectOption>({
    orderBy: 'label',
  });
  let systemOptions: ISelectOption[] = [];
  let params: ISelectOption[] = [];
  let metrics: ISelectOption[] = [];

  if (projectsData?.metric) {
    for (let metricName in projectsData.metric) {
      if (addHighLevelMetrics) {
        const { label, key, isSystemMetric } = getLabelAndValueOfMetric(
          metricName,
          {},
        );
        let index: number = metrics.length;
        let option: ISelectOption = {
          label: label,
          group: isSystemMetric ? 'System' : metricName,
          type: 'metrics',
          color: COLORS[0][index % COLORS[0].length],
          key,
          value: {
            option_name: metricName,
            context: null,
          },
        };
        if (isSystemMetric) {
          systemOptions.push(option);
        } else {
          metrics.push(option);
        }
      }
      for (let val of projectsData.metric[metricName]) {
        if ((addHighLevelMetrics && !_.isEmpty(val)) || !addHighLevelMetrics) {
          const { label, key, isSystemMetric } = getLabelAndValueOfMetric(
            metricName,
            val,
          );
          let index: number = metrics.length;
          let option: ISelectOption = {
            label: label,
            group: isSystemMetric ? 'System' : metricName,
            type: 'metrics',
            color: COLORS[0][index % COLORS[0].length],
            key,
            value: {
              option_name: metricName,
              context: val,
            },
          };
          if (isSystemMetric) {
            systemOptions.push(option);
          } else {
            metrics.push(option);
          }
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
        key: paramPath.slice(0, indexOf),
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
