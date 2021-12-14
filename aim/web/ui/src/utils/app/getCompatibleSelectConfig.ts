import _ from 'lodash-es';

import { ISelectConfig } from 'types/services/models/explorer/createAppModel';

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
    return selectConfig;
  }
  return select;
}
