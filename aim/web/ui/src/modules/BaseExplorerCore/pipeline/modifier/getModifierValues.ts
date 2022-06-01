import { orderBy, pick } from 'lodash-es';

import { getValue } from 'utils/helper';
import { encode } from 'utils/encoder/encoder';

import { Order } from './applyModifier';

type ValueGetter = (...args: any) => Record<string, any>;

export function pickValues(
  object: any,
  paths: string[],
  valueGetter: ValueGetter = getValue,
): { [key: string]: any } {
  const values: { [key: string]: any } = {};
  paths.forEach((path: string) => {
    values[path] = valueGetter(object, path);
  });

  return values;
}

type Group = { [key: string]: any };

type GroupValue = { [key: string]: any };

function getModifierValues(
  data: any[],
  fields: string[],
  orders: Order[],
): Record<string, Group> {
  // generate possible groups
  const groups: Record<string, Group> = data.reduce(
    (groups: Group, value: any) => {
      const groupValue: GroupValue = pickValues(value, fields);
      const groupKey: string = encode(groupValue, true);

      if (!groups.hasOwnProperty(groupKey)) {
        groups[groupKey] = {
          key: groupKey,
          fields: groupValue,
          items: [],
        };
      }

      groups[groupKey].items.push(value);

      return groups;
    },
    {},
  );
  console.log(groups);
  // sort groups
  const orderedGroups = orderBy(
    groups,
    fields.map((p) => `fields.${p}`),
    [...new Array(fields.length).fill(orders[0])],
  );

  // set orders to groups
  orderedGroups.forEach((item: GroupValue, index: number) => {
    groups[item.key] = {
      ...item,
      order: index,
    };
  });

  return groups;
}

export default getModifierValues;

// group by condition
// apply order
