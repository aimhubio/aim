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
        .map((metric) =>
          metric.value.context === null
            ? `(metric.name == "${metric.value.metric_name}")`
            : `${Object.keys(metric.value.context).map(
                (item) =>
                  `(metric.name == "${
                    metric.value.metric_name
                  }" and metric.context.${item} == ${formatValue(
                    (metric.value.context as any)[item],
                  )})`,
              )}`,
        )
        .join(' or ')})`.trim();
    }
  }

  return query;
}
