import { ISyntaxErrorDetails } from 'types/components/NotificationContainer/NotificationContainer';
import { ISelectConfig } from 'types/services/models/explorer/createAppModel';

import { formatValue } from '../formatValue';

export default function getQueryStringFromSelect(
  selectData: ISelectConfig,
  error?: ISyntaxErrorDetails,
) {
  let query = '';
  if (selectData !== undefined) {
    if (selectData.advancedMode) {
      query = selectData.advancedQuery || '';
    } else {
      query = `${
        selectData.query && !error?.message ? `(${selectData.query}) and ` : ''
      }(${selectData.options
        .map(
          (option) =>
            `(metric.name == "${option.value?.option_name}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map(
                      (item) =>
                        `metric.context.${item} == ${formatValue(
                          (option.value?.context as any)[item],
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
