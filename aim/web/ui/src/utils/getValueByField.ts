import _ from 'lodash-es';

export default function getValueByField(
  list: Array<any>,
  value: any,
  comparisonFieldName: string = 'value',
  returnFiled: string = 'label',
) {
  const foundItem = list.find((listItem) =>
    _.isEqual(listItem[comparisonFieldName], value),
  );
  return foundItem ? foundItem[returnFiled] : '';
}
