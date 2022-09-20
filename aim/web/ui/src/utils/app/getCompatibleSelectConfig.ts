import _ from 'lodash-es';

import { ISelectConfig } from 'types/services/models/explorer/createAppModel';

import { getMetricHash } from './getMetricHash';
import { getMetricLabel } from './getMetricLabel';

export function getCompatibleSelectConfig(
  keys: string[] = [],
  select: ISelectConfig,
): ISelectConfig {
  if (select) {
    let selectConfig: any = _.cloneDeep(select);
    keys?.forEach((key: string) => {
      if (selectConfig?.hasOwnProperty(key)) {
        const selectOptions = selectConfig[key];
        if (Array.isArray(selectOptions)) {
          selectOptions.forEach((option) => {
            if (option?.value && typeof option.value === 'object') {
              ['metric_name', 'param_name'].forEach((valueNameKey) => {
                if (option.value?.hasOwnProperty(valueNameKey)) {
                  option.value.option_name = option.value[valueNameKey];
                  delete option.value[valueNameKey];
                }
              });
            }
          });
        }

        selectConfig = {
          ...selectConfig,
          options: [
            ...(selectConfig[key] || []),
            ...(selectConfig.options || []),
          ],
        };
        delete selectConfig[key];
      }
    });
    selectConfig.options = selectConfig.options?.map((option: any) => {
      if (!option.key) {
        if (option.value) {
          const { option_name, context } = option.value;
          const metricHash = getMetricHash(option_name, context);
          const metricLabel = getMetricLabel(option_name, context);
          return { ...option, label: metricLabel, key: metricHash };
        } else {
          return { ...option, key: option.label };
        }
      }
      return option;
    });
    return selectConfig;
  }
  return select;
}
