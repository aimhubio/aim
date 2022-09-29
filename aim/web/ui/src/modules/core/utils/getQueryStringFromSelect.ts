import { QueryFormState } from 'modules/core/engine/explorer/query';

import { SequenceTypesEnum } from 'types/core/enums';

import { formatValue } from 'utils/formatValue';

export function getQueryStringFromSelect(
  queryData: QueryFormState,
  sequenceName: SequenceTypesEnum,
): string {
  let query = '';
  if (queryData !== undefined) {
    if (queryData.advancedModeOn) {
      query = queryData.advancedInput || '';
    } else {
      query = `${
        queryData.simpleInput ? `${queryData.simpleInput} and ` : ''
      }(${queryData.selections
        .map(
          (option) =>
            `(${sequenceName}.name == "${option.value?.option_name}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map(
                      (item) =>
                        `${sequenceName}.context.${item} == ${formatValue(
                          (option.value?.context)[item],
                        )}`,
                    )
                    .join(' and ')
            })`,
        )
        .join(' or ')})`.trim();
    }
  }
  return query;
}
