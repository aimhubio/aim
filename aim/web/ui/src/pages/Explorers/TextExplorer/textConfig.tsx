import React, { memo } from 'react';
import produce from 'immer';

import COLORS from 'config/colors/colors';

import CaptionProperties from 'modules/BaseExplorer/components/Controls/CaptionProperties';
import TextRendererMode from 'modules/BaseExplorer/components/Controls/TextRendererMode';
import Legends from 'modules/BaseExplorer/components/Controls/Legends';
import { GroupingItem } from 'modules/BaseExplorer/components/Grouping';
import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';
import { PersistenceTypesEnum } from 'modules/core/engine/types';
import { StyleApplierCallbackArgs } from 'modules/core/engine/explorer/groupings';

import { LegendsModeEnum } from 'utils/d3';

import getTextExplorerStaticContent from './getStaticContent';

export enum TEXT_RENDERER_MODES {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  HTML = 'html',
  CODE = 'code',
}

export const getTextDefaultConfig = (): typeof defaultHydration => {
  const defaultConfig = getDefaultHydration();

  const groupings = produce(defaultConfig.groupings, (draft: any) => {
    draft[GroupType.COLUMN].defaultApplications.orders = [Order.ASC, Order.ASC];
    draft[GroupType.COLUMN].defaultApplications.fields = [
      'run.hash',
      'texts.name',
    ];

    draft[GroupType.GRID].defaultApplications.orders = [Order.ASC];
    draft[GroupType.GRID].defaultApplications.fields = ['texts.name'];

    draft[GroupType.COLOR] = {
      component: memo((props: IBaseComponentProps) => (
        <GroupingItem groupName='color' iconName='coloring' {...props} />
      )),

      styleApplier: ({ groupInfo }: StyleApplierCallbackArgs<any>) => {
        return {
          color:
            groupInfo[GroupType.COLOR]?.order !== undefined
              ? COLORS[0][groupInfo[GroupType.COLOR].order % COLORS[0].length]
              : null,
        };
      },
      defaultApplications: {
        fields: ['run.hash'],
        orders: [Order.ASC],
        isApplied: true,
      },
    };
  });

  return {
    ...defaultConfig,
    groupings,
    controls: {
      ...defaultConfig.controls,
      captionProperties: {
        component: CaptionProperties,
        state: {
          initialState: {
            displayBoxCaption: true,
            selectedFields: ['run.name', 'texts.name', 'texts.context'],
          },
          persist: PersistenceTypesEnum.Url,
        },
      },
      textRenderer: {
        component: TextRendererMode,
        state: {
          initialState: {
            type: 'text',
          },
          persist: PersistenceTypesEnum.Url,
        },
      },
      legends: {
        component: Legends,
        state: {
          initialState: {
            display: false,
            mode: LegendsModeEnum.PINNED,
          },
          persist: PersistenceTypesEnum.Url,
        },
      },
    },
    box: {
      ...defaultConfig.box,
    },
    getStaticContent: getTextExplorerStaticContent,
  };
};
