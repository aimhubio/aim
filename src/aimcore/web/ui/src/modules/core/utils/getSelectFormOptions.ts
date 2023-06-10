import _ from 'lodash-es';

import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import { getMetricHash } from 'utils/app/getMetricHash';
import { getMetricLabel } from 'utils/app/getMetricLabel';
import { isSystemMetric } from 'utils/isSystemMetric';

export function getSelectFormOptions(
  projectsData: Record<string | number | symbol, unknown | any>,
) {
  let data: ISelectOption[] = [];

  if (projectsData) {
    for (let key in projectsData) {
      const isSystem = isSystemMetric(key);
      const metricHash = getMetricHash(key, {});
      const metricLabel = getMetricLabel(key, {});
      data.push({
        label: metricLabel,
        group: isSystem ? 'System' : key,
        key: metricHash,
        value: {
          option_name: key,
          context: null,
        },
      });
      for (let val of projectsData[key]) {
        if (!_.isEmpty(val)) {
          const metricHash = getMetricHash(key, val);
          const metricLabel = getMetricLabel(key, val);
          data.push({
            label: metricLabel,
            group: isSystem ? 'System' : key,
            key: metricHash,
            value: {
              option_name: key,
              context: val,
            },
          });
        }
      }
    }
  }
  return data.sort(
    alphabeticalSortComparator<ISelectOption>({ orderBy: 'label' }),
  );
}
