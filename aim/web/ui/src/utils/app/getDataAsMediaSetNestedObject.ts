import _ from 'lodash-es';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import { formatValue } from 'utils/formatValue';
import getValueByField from 'utils/getValueByField';

export function getDataAsMediaSetNestedObject<M extends State>({
  data,
  groupingSelectOptions,
  model,
  defaultGroupFields,
}: {
  data: any[];
  groupingSelectOptions: IGroupingSelectOption[];
  model?: IModel<M>;
  defaultGroupFields?: string[];
}) {
  if (!_.isEmpty(data)) {
    const modelState = model?.getState();
    const grouping = modelState?.config?.grouping;
    const setData: object = {};
    const group: string[] = [...(grouping?.group || [])];
    const groupFields =
      defaultGroupFields ||
      (grouping?.reverseMode?.group
        ? groupingSelectOptions
            .filter(
              (option: IGroupingSelectOption) => !group.includes(option.label),
            )
            .map((option) => option.value)
        : group);
    const orderedMap = {};
    data.forEach((group: any) => {
      const path = groupFields?.reduce(
        (acc: string[], field: string, index: number) => {
          const value = _.get(group.data[0], field);
          _.set(
            orderedMap,
            acc.concat(['ordering']),
            new Set([
              ...(_.get(orderedMap, acc.concat(['ordering'])) || []),
              value,
            ]),
          );
          _.set(
            orderedMap,
            acc.concat(['key']),
            getValueByField(groupingSelectOptions, field),
          );
          acc.push(
            `${getValueByField(groupingSelectOptions, field)} = ${formatValue(
              value,
            )}`,
          );
          return acc;
        },
        [],
      );
      _.set(
        setData,
        path,
        _.sortBy(group.data, [
          ...groupFields,
          ...groupingSelectOptions
            .map((option: IGroupingSelectOption) => option.value)
            .filter((field) => !groupFields.includes(field)),
          'caption',
        ]),
      );
    });
    return {
      setData: _.isEmpty(setData) ? data[0].data : setData,
      orderedMap,
    };
  } else {
    return {};
  }
}
