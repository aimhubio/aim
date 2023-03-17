import React, { memo } from 'react';

import COLORS from 'config/colors/colors';

import CaptionProperties from 'modules/BaseExplorer/components/Controls/CaptionProperties';
import TextRendererMode from 'modules/BaseExplorer/components/Controls/TextRendererMode';
import { GroupingItem } from 'modules/BaseExplorer/components/Grouping';
import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import getTextExplorerStaticContent from './getStaticContent';

export const getTextDefaultConfig = (): typeof defaultHydration => {
  const defaultConfig = getDefaultHydration();

  return {
    ...defaultConfig,
    groupings: {
      ...defaultConfig.groupings,
      [GroupType.COLUMN]: {
        ...defaultConfig.groupings[GroupType.COLUMN],
        defaultApplications: {
          orders: defaultConfig.groupings[GroupType.COLUMN].defaultApplications
            ?.orders ?? [Order.ASC, Order.ASC],
          fields: ['run.hash', 'texts.name'],
        },
      },
      [GroupType.COLOR]: {
        component: memo((props: IBaseComponentProps) => (
          <GroupingItem groupName='color' iconName='coloring' {...props} />
        )),

        // @ts-ignore
        styleApplier: (
          object: AimFlatObjectBase<any>,
          group: any,
          boxConfig: any,
          iteration: number,
        ) => {
          return {
            color:
              group[GroupType.COLOR]?.order !== undefined
                ? COLORS[0][group[GroupType.COLOR].order % COLORS[0].length]
                : null,
          };
        },
        defaultApplications: {
          fields: ['run.hash'],
          orders: [Order.ASC],
        },
      },
    },
    controls: {
      ...defaultConfig.controls,
      captionProperties: {
        component: CaptionProperties,
        state: {
          initialState: {
            displayBoxCaption: true,
            selectedFields: ['run.name', 'texts.name', 'texts.context'],
          },
          persist: 'url',
        },
      },
      textRenderer: {
        component: TextRendererMode,
        state: {
          initialState: {
            type: 'text',
          },
          persist: 'url',
        },
      },
    },
    box: {
      ...defaultConfig.box,
    },
    getStaticContent: getTextExplorerStaticContent,
  };
};
