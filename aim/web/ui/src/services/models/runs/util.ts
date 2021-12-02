import bs58check from 'bs58check';

import { IMenuItem } from 'components/kit/Menu';

import contextToString from 'utils/contextToString';

import {
  DistributionsData,
  DistributionValue,
  TraceProcessedData,
  TraceRawDataItem,
  TraceType,
} from './types';

/**
 * getMenuItemFromRawInfo
 * --------- Complexity analyse -----------
 *   The runtime is quadratic
 *   O(n) - Best case
 *   O(n * k) - Worst case where k is the maximum length of all children
 * --------- Complexity analyse -----------
 * We assume info already has length
 * @param info {TraceRawDataItem[]} - raw info data
 * @param separator {string} - key value separator
 * @returns - compatible Menu data, availableIds for the first layer
 */
export function getMenuItemFromRawInfo(
  info: TraceRawDataItem[],
  separator: string = '=',
): {
  data: IMenuItem[];
  availableIds: string[];
} {
  // for checking duplications
  const checkedItemIds: string[] = [];

  const data: IMenuItem[] = [];

  // doesn't destructuring item, because we are not sure it has context
  info.forEach((item: TraceRawDataItem) => {
    const id: string = bs58check.encode(Buffer.from(`${item.name}`));
    let menuItem: IMenuItem = {
      name: item.name,
      id,
    };

    // this check is for ensure raw data has context
    if (item.context) {
      const keys: string[] = Object.keys(item.context);
      if (keys.length) {
        const children: IMenuItem[] = [];
        const child: IMenuItem = {
          name: `${contextToString(item.context)}`,
          id: bs58check.encode(Buffer.from(JSON.stringify(item.context))),
        };
        children.push(child);
        /*keys.forEach((key: string) => {
          const childItem = {
            name: `${key} ${separator} ${item.context[key]}`,
            // remove whitespaces from id
            id: `${key}${separator}${item.context[key]}`,
          };
          children.push(childItem);
        });*/

        menuItem.children = children;
      }
    }

    /* Group children under the same id
     * Currently this function supports only the first layer of the array
     * To solve problem for nested items run recursively, not checked, that is not reliable right now
     * Or iterate through the children and remove if duplicate
     */
    if (checkedItemIds.includes(id)) {
      data.forEach((it: IMenuItem, index: number) => {
        if (it.id === id) {
          const itemChildren = data[index].children || [];
          const currentChildren = menuItem.children || [];
          data[index].children = [...itemChildren, ...currentChildren];

          // clear empty array
          // @ts-ignore because we already set it minimum empty array
          if (!data[index].children.length) {
            delete data[index].children;
          }
        }
      });
    } else {
      data.push(menuItem);
      checkedItemIds.push(id);
    }
  });

  return {
    availableIds: checkedItemIds,
    data,
  };
}

/**
 * Generates api call request compatible data from menu's active key
 * 'dist_test.subset:value' -> { name: 'dist_test', context: { subset: 'val' } }
 * @param key {String} - active key
 * @param data {IMenuItem[]} - data
 * @param separator {string} - key value separator
 * @returns TraceRawDataItem - the object compatible to api call
 */
export function getContextObjFromMenuActiveKey(
  key: string,
  data: string[],
  separator: string = '=',
): TraceRawDataItem {
  let name = '';
  let contextKey = '';
  let context = {};

  for (let i = 0; i < key.length; i++) {
    // check includes to ensure we have not a wrong string
    // It is the case when the actual name has '.' inside
    if (!data.includes(name)) {
      name += key[i];
    } else {
      contextKey += key[i];
    }
  }

  name = bs58check.decode(name).toString();
  if (contextKey) {
    // remove contextKey[0] because it is '.'
    context = JSON.parse(
      bs58check.decode(contextKey.substring(1, contextKey.length)).toString(),
    );
    // const keyValue: string[] = contextKey.split(separator);
    // assumed there are separated string width "->"
    // @TODO check if the actual string may have "separator" inside, it's very hard case
    // @ts-ignore
  }

  return {
    name,
    context,
  };
}

export function getMenuData(traceType: TraceType, traces: TraceRawDataItem[]) {
  const VisualizationMenuTitles = {
    images: 'Images',
    distributions: 'Distributions',
  };

  let title = VisualizationMenuTitles[traceType];

  let defaultActiveKey = '';
  let defaultActiveName = '';

  const { data, availableIds } = getMenuItemFromRawInfo(traces);

  if (data[0].children && data[0].children.length) {
    defaultActiveKey = data[0].id + '.' + data[0].children[0].id;
    defaultActiveName = data[0].children[0].name;
  } else {
    defaultActiveKey = data[0].id + ''; // make string
    defaultActiveName = data[0].name;
  }

  return { data, defaultActiveKey, availableIds, title, defaultActiveName };
}

/**
 * process distributions data
 */
export function processDistributionsData(data: Partial<DistributionsData>) {
  const { record_range, iters, values } = data;
  const processedValues: any[] = [];
  const originalValues: TraceProcessedData[] = [];

  if (values) {
    values.forEach((value: DistributionValue) => {
      const parsedBlob: number[] = [...new Float64Array(value.data.blob)];

      const bin = [];
      const xMin = value.range[0];
      const xMax = value.range[1];
      const binSize = (xMax - xMin) / value.bin_count;
      for (let i = 0; i <= value.bin_count; i++) {
        bin.push(xMin + i * binSize);
      }

      processedValues.push([parsedBlob, bin]);
      originalValues.push({
        ...value,
        data: {
          blob: parsedBlob,
        },
      });
    });
  }

  return { iters, record_range, processedValues, originalValues };
}

/**
 * process distributions data
 */
export function processImagesData() {
  return {};
}
