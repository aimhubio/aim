import { orderBy } from 'lodash-es';

import { getValue } from 'utils/helper';

import { buildObjectHash } from '../../helpers';

import { Order } from './types';

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

function getGroups(
  data: any[],
  fields: string[],
  orders: Order[],
  type: string,
): Record<string, Group> {
  // generate possible groups
  const groups: Record<string, Group> = data.reduce(
    (groups: Group, value: any) => {
      const groupValue: GroupValue = pickValues(value, fields);
      const groupKey: string = buildObjectHash(groupValue);

      if (!groups.hasOwnProperty(groupKey)) {
        groups[groupKey] = {
          key: groupKey,
          fields: groupValue,
          items: [],
          type,
        };
      }

      groups[groupKey].items.push(value);

      return groups;
    },
    {},
  );

  const orderedGroups = orderBy(
    groups,
    fields.map((p) => `fields.${p}`),
    orders,
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

export default getGroups;

// group by condition
// apply order
