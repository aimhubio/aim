import { shouldMatchObject } from 'tests/utils';

import { IMenuItem } from 'components/kit/Menu';

import { TraceRawDataItem } from './types';
import { getMenuItemFromRawInfo, getContextObjFromMenuActiveKey } from './util';

describe('[getMenuItemFromRawInfo]', () => {
  it('should return the right data if context is empty', () => {
    const rawData: TraceRawDataItem[] = [
      {
        context: {},
        name: 'dist_test',
      },
      {
        context: {},
        name: 'dist_test',
      },
      {
        context: {},
        name: 'dist_test1',
      },
    ];

    const actualResult = getMenuItemFromRawInfo(rawData);

    const expectedMenuData: IMenuItem[] = [
      {
        name: 'dist_test',
        id: 'dist_test',
      },
      {
        name: 'dist_test1',
        id: 'dist_test1',
      },
    ];
    const availableIds = ['dist_test', 'dist_test1'];
    shouldMatchObject(
      {
        availableIds,
        data: expectedMenuData,
      },
      actualResult,
    );
  });

  it('should return the right data if context is not empty', () => {
    const rawData: TraceRawDataItem[] = [
      {
        context: { subset: 'val', test: 'test' },
        name: 'dist_test',
      },
      {
        context: { subset: 'test', test1: 'test1' },
        name: 'dist_test',
      },
    ];

    const actualResult = getMenuItemFromRawInfo(rawData);

    const expectedMenuData: IMenuItem[] = [
      {
        name: 'dist_test',
        id: 'dist_test',
        children: [
          {
            name: 'subset = val',
            id: 'subset=val',
          },
          {
            name: 'test = test',
            id: 'test=test',
          },
          {
            name: 'subset = test',
            id: 'subset=test',
          },
          {
            name: 'test1 = test1',
            id: 'test1=test1',
          },
        ],
      },
    ];
    const availableIds = ['dist_test'];

    shouldMatchObject({ data: expectedMenuData, availableIds }, actualResult);
  });
});

describe('[getContextObjFromMenuActiveKey]', () => {
  it('should return the right object', () => {
    const rawData: TraceRawDataItem[] = [
      {
        context: { subset: 'val', test: 'test' },
        name: 'dist_test',
      },
      {
        context: { subset: 'test', test1: 'test1' },
        name: 'dist_test',
      },
    ];

    const { availableIds } = getMenuItemFromRawInfo(rawData);

    const result1 = getContextObjFromMenuActiveKey(
      'dist_test.subset=val',
      availableIds,
    );
    const result2 = getContextObjFromMenuActiveKey(
      'dist_test.test1=test1',
      availableIds,
    );
    shouldMatchObject(
      { name: 'dist_test', context: { subset: 'val' } },
      result1,
    );
    shouldMatchObject(
      { name: 'dist_test', context: { test1: 'test1' } },
      result2,
    );
  });
});
