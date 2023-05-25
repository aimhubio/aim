import { QueryFormState } from 'modules/core/engine/explorer/query';

import { SequenceType } from 'types/core/enums';

import { formatValue } from 'utils/formatValue';

export function getQueryStringFromSelect(queryData: QueryFormState): string {
  if (queryData === undefined) {
    return '()';
  }
  let query = '';
  if (queryData.advancedModeOn) {
    query = queryData.advancedInput || '';
  } else {
    const simpleInput = queryData.simpleInput?.trim()
      ? `(${queryData.simpleInput.trim()})`
      : '';
    const selections = queryData.selections?.length
      ? `(${queryData.selections
          .map(
            (option) =>
              `(sequence.name == "${option.value?.option_name}"${
                option.value?.context === null
                  ? ''
                  : ' and ' +
                    Object.keys(option.value?.context)
                      .map(
                        (item) =>
                          `sequence.context.${item} == ${formatValue(
                            (option.value?.context)[item],
                          )}`,
                      )
                      .join(' and ')
              })`,
          )
          .join(' or ')})`
      : '';

    if (simpleInput && selections) {
      query = `${simpleInput} and ${selections}`;
    } else {
      query = `${simpleInput}${selections}`;
    }
  }
  return query.trim() || '()';
}
