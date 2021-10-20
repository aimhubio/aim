import _ from 'lodash';

export default function getValueByField(
  list: Array<any>,
  value: any,
  comparisonFieldName: string = 'value',
  returnFiled: string = 'label',
) {
  return list.find((listItem) =>
    _.isEqual(listItem[comparisonFieldName], value),
  )[returnFiled];
}
