import React, { memo } from 'react';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';
import { GroupingItem } from 'modules/BaseExplorer/components';
import { GroupType, Order } from 'modules/core/pipeline';
import { GroupingConfigs } from 'modules/core/engine/store/grouping';

import { AimFlatObjectBase } from 'types/core/AimObjects';

const groupings: GroupingConfigs = {
  [GroupType.COLUMN]: {
    component: memo((props: IBaseComponentProps) => (
      <GroupingItem groupName='columns' iconName='group-column' {...props} />
    )),
    // @ts-ignore
    styleApplier: (
      object: AimFlatObjectBase<any>,
      group: any,
      boxConfig: any,
      iteration: number,
    ) => {
      return {
        left:
          (group[GroupType.COLUMN]
            ? group[GroupType.COLUMN].order *
                (boxConfig.width + boxConfig.gap) +
              boxConfig.gap
            : boxConfig.gap) + (group[GroupType.ROW] ? 200 : 0),
      };
    },
    defaultApplications: {
      fields: ['run.hash', 'figures.name'],
      orders: [Order.ASC, Order.ASC],
    },
    // state: {
    //   // observable state, to listen on base visualizer
    //   initialState: {
    //     rowLength: 4,
    //   },
    // },
    // settings: {
    //   // settings to pass to component, to use, alter it can be color scales values for color grouping
    //   maxRowsLength: 10,
    // },
  },
  [GroupType.ROW]: {
    component: memo((props: IBaseComponentProps) => (
      <GroupingItem groupName='rows' iconName='image-group' {...props} />
    )),
    // @ts-ignore
    styleApplier: (
      object: AimFlatObjectBase<any>,
      group: any,
      boxConfig: any,
      iteration: number,
    ) => {
      return {
        top: group[GroupType.ROW]
          ? group[GroupType.ROW].order * (boxConfig.height + boxConfig.gap) +
            30 +
            boxConfig.gap
          : (group[GroupType.COLUMN] ? 30 : 0) + boxConfig.gap,
      };
    },
    defaultApplications: {
      fields: ['record.step'],
      orders: [Order.DESC],
    },
    // state: {
    //   // observable state, to listen on base visualizer
    //   initialState: {
    //     rowLength: 4,
    //   },
    // },
    // settings: {
    //   // settings to pass to component, to use, alter it can be color scales values for color grouping
    //   maxRowsLength: 10,
    // },
  },
};

export default groupings;
