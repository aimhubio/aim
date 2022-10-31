import { ISyntaxErrorDetails } from 'types/components/NotificationContainer/NotificationContainer';
import { ISelectConfig } from 'types/services/models/explorer/createAppModel';

import { jsValidVariableRegex } from 'utils/getObjectPaths';

import { formatValue } from '../formatValue';

export default function getQueryStringFromSelect(
  selectData: ISelectConfig,
  error?: ISyntaxErrorDetails,
) {
  let query = '()';
  if (selectData === undefined) {
    return query;
  }
  if (selectData.advancedMode) {
    query = selectData.advancedQuery || '';
  } else {
    const simpleInput =
      selectData.query?.trim() && !error?.message
        ? `(${selectData.query.trim()})`
        : '';
    const selections = selectData.options?.length
      ? `(${selectData.options
          .map((option) => {
            const metricName = option.value?.option_name.replaceAll('"', '\\"');
            return `(metric.name == "${metricName}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map((item) => {
                      const contextName = !jsValidVariableRegex.test(item)
                        ? `['${item.replaceAll('"', '\\"')}']`
                        : `.${item}`;
                      const value = (option.value?.context as any)[item];
                      return `metric.context${contextName} == ${formatValue(
                        value,
                      )}`;
                    })
                    .join(' and ')
            })`;
          })
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
