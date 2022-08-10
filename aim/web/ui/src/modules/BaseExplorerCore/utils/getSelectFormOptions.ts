import _ from 'lodash-es';

import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import contextToString from 'utils/contextToString';

export function getSelectFormOptions(
  projectsData: Record<string | number | symbol, unknown | any>,
) {
  let data: ISelectOption[] = [];

  if (projectsData) {
    for (let key in projectsData) {
      data.push({
        label: key,
        group: key,
        value: {
          option_name: key,
          context: null,
        },
      });
      for (let val of projectsData[key]) {
        if (!_.isEmpty(val)) {
          let label = contextToString(val);
          data.push({
            label: `${key} ${label}`,
            group: key,
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
