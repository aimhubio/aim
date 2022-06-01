import { orderBy } from 'lodash-es';
import md5 from 'md5';

import { encode } from '../../../../utils/encoder/encoder';

import getModificationValues, { pickValues } from './getModifierValues';

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export enum GroupType {
  ROW = 'rows',
  COLUMN = 'columns',
  COLOR = 'color',
}

export type GroupOptions = {
  type: GroupType;
  fields: string[];
  orders?: Order[];
  applier?: Function;
};

export enum ModifierType {
  GROUP = 'group',
}

const boxStyles = {
  width: 100,
  height: 100,
  gap: 15,
};

const modifierConfig = {
  [ModifierType.GROUP]: {
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
  },
};

type ModificationCache = {
  result: any;
  options: {
    [key: string]: any;
  };
};

function generateModificationHash(
  dataVersion: string,
  modifierType: ModifierType,
  additionalInfo: { [key: string]: any },
): string {
  const middle = `--${modifierType}--`;

  // make object sorted keys for hashing
  return dataVersion + middle + md5(JSON.stringify(additionalInfo));
}

const cache = new Map<string, ModificationCache>();

// group by [group type] [group_type] [order]
function group(data: any[], args: GroupOptions) {
  const config = {
    ...args,
    orders: args.orders || [Order.ASC],
    applier:
      args.applier ||
      modifierConfig[ModifierType.GROUP][args.type].defaultApplier,
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
  const groups = getModificationValues(data, config.fields, config.orders);

  // @ts-ignore
  function applyModification(d: any[]) {
    return d.map((item: any) => {
      const groupKey: string = encode(pickValues(item, config.fields), true);

      const order = groups[groupKey].order;

      const group = item[ModifierType.GROUP] || {};
      return {
        ...item,
        [ModifierType.GROUP]: {
          ...group,
          [config.type]: {
            [modifierConfig[ModifierType.GROUP][config.type].property]:
              config.applier(order),
            order: order,
          },
        },
      };
    });
  }

  return {
    data: applyModification(data),
    modificationValues: groups,
  };
}

function applyModifier(data: any[], modifier: GroupOptions) {
  // group column by modifier order desc
  console.log(
    'Query: ',
    `Group [${modifier.type}] based on [${modifier.fields}] order [${
      modifier.orders || Order.ASC
    }]`,
  );
  const result = group(data, modifier);
  console.log(result.data);
  return result;
}

export default applyModifier;
