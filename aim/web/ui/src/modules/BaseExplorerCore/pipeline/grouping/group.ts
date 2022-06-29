// group by [group type] [group_type] [order]
import { encode } from 'utils/encoder/encoder';

import { pickValues } from './getGroupValues';
import { GroupOptions, GroupType, Order } from './types';
import getGroupValues from './getGroupValues';

const boxStyles = {
  width: 100,
  height: 100,
  gap: 15,
};

const groupConfig = {
  [GroupType.ROW]: {
    property: 'y', // y
    defaultFields: [],
    defaultOrder: Order.ASC,
    defaultApplier: (order: number): number => order * boxStyles.height, // + boxStyles.gap,
  },
  [GroupType.COLUMN]: {
    property: 'x', // x
    defaultFields: [],
    defaultOrder: Order.ASC,
    defaultApplier: (order: number) => order * boxStyles.width, // + boxStyles.gap
  },
  [GroupType.COLOR]: {
    property: 'color',
    defaultFields: [],
    defaultOrder: Order.ASC,
    defaultApplier: () => {},
  },
};

/*
 * cache = {
 *   hash1
 * }
 */
function group(
  data: any[],
  args: {
    type: GroupType;
    fields: string[];
    orders: Order[];
  },
) {
  const config = {
    ...args,
    orders: args.orders,
  };

  // if (cache.has(groupHash)) {
  //   const config = cache.get(groupHash);
  //   if (config?.options.order === args.order) {
  //     return config?.result;
  //   }
  //   // order
  //   const data = applyOrder(config?.result);
  //   const result = { data, modificationKey: config?.result.modificationKey };
  //   const cacheData = { result, options: { order: args.order } };
  //   cache.set(groupHash, cacheData);
  //
  //   return result;
  // }
  const groups = getGroupValues(data, config.fields, config.orders);

  // @ts-ignore
  const result = data.map((item: any) => {
    const groupKey: string = encode(pickValues(item, config.fields), true);

    const group = item['groups'] || {};
    return {
      ...item,
      groups: {
        ...group,
        [config.type]: [groupKey],
      },
    };
  });

  return {
    data: result,
    foundGroups: groups,
  };
}

export default group;
