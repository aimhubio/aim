import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

import { formatValue } from '../formatValue';

export default function getQueryStringFromSelect(
  selectData: IMetricAppConfig['select'],
) {
  let query = '';
  if (selectData !== undefined) {
    if (selectData.advancedMode) {
      query = selectData.advancedQuery;
    } else {
      query = `${
        selectData.query ? `${selectData.query} and ` : ''
      }(${selectData.metrics
        .map(
          (metric) =>
            `(metric.name == "${metric.value.metric_name}"${
              metric.value.context === null
                ? ''
                : ' and ' +
                  Object.keys(metric.value.context)
                    .map(
                      (item) =>
                        `metric.context.${item} == ${formatValue(
                          (metric.value.context as any)[item],
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
