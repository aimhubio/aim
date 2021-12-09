import bs58check from 'bs58check';
import _ from 'lodash';

import { IMenuItem } from 'components/kit/Menu';

import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';

import contextToString from 'utils/contextToString';
import { encode } from 'utils/encoder/encoder';
import getObjectPaths from 'utils/getObjectPaths';

import imagesExploreAppModel from '../imagesExplore/imagesExploreAppModel';

import {
  DistributionsData,
  DistributionValue,
  ImagesData,
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
      } else {
        menuItem.children = [
          {
            name: 'no context',
            id: bs58check.encode(Buffer.from(JSON.stringify({}))),
          },
        ];
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
    audios: 'Audios',
    videos: 'Videos',
    texts: 'Texts',
    plotly: 'Plotlies',
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

  return {
    iters,
    record_range,
    processedValues,
    originalValues,
  };
}

/**
 * process distributions data
 */
export function processImagesData(data: Partial<ImagesData>, params?: object) {
  const { record_range, iters, values, index_range, context, name } = data;
  const groupingSelectOptions = params
    ? imagesExploreAppModel.getGroupingSelectOptions({
        params: getObjectPaths(params as any, params as any),
      })
    : [];
  let metrics: any[] = [];
  values?.forEach((stepData: IImageData[], stepIndex: number) => {
    stepData.forEach((image: IImageData) => {
      const imageKey = encode({
        name,
        traceContext: context,
        index: image.index,
        step: iters?.[stepIndex],
        caption: image.caption,
      });
      const seqKey = encode({
        name,
        traceContext: context,
      });
      metrics.push({
        ...image,
        images_name: name,
        step: iters?.[stepIndex],
        context: context,
        // run: _.omit(run, 'traces'),
        key: imageKey,
        seqKey: seqKey,
      });
    });
  });
  const { imageSetData, orderedMap } = imagesExploreAppModel.getDataAsImageSet(
    groupData(_.orderBy(metrics)),
    groupingSelectOptions,
    ['step'],
  );
  return { imageSetData, orderedMap, record_range, index_range };
}

function groupData(data: any[]): any {
  const groupValues: { [key: string]: any } = {};

  for (let i = 0; i < data.length; i++) {
    const groupValue: { [key: string]: string } = {};
    ['step'].forEach((field) => {
      groupValue[field] = _.get(data[i], field);
    });
    const groupKey = encode(groupValue);
    if (groupValues.hasOwnProperty(groupKey)) {
      groupValues[groupKey].data.push(data[i]);
    } else {
      groupValues[groupKey] = {
        key: groupKey,
        config: groupValue,
        data: [data[i]],
      };
    }
  }
  return Object.values(groupValues);
}

export function reformatArrayQueries(
  queryObj: Record<string, [number, number]> = {},
) {
  const formattedQueryObject: Record<string, string> = {};
  Object.keys(queryObj).forEach((key) => {
    const item = queryObj[key];
    formattedQueryObject[key] = `${item[0]}:${item[1]}`;
  });

  return formattedQueryObject;
}
