import produce from 'immer';

import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';
import { CaptionProperties } from 'modules/BaseExplorer/components/Controls';

import { GetSequenceName, SequenceType } from 'types/core/enums';

import getAudiosExplorerStaticContent from './getStaticContent';

export const getAudiosDefaultConfig = (): typeof defaultHydration => {
  const defaultConfig = getDefaultHydration();
  const sequenceName = GetSequenceName(SequenceType.Audio);

  const groupings = produce(defaultConfig.groupings, (draft: any) => {
    draft[GroupType.COLUMN].defaultApplications.orders = [Order.ASC, Order.ASC];
    draft[GroupType.COLUMN].defaultApplications.fields = [
      'run.hash',
      `${sequenceName}.name`,
    ];
    draft[GroupType.ROW].defaultApplications.orders = [Order.DESC];
    draft[GroupType.ROW].defaultApplications.fields = ['record.step'];

    draft[GroupType.GRID].defaultApplications.orders = [Order.ASC];
    draft[GroupType.GRID].defaultApplications.fields = [`${sequenceName}.name`];
  });

  const controls = produce(defaultConfig.controls, (draft: any) => {
    draft.captionProperties = {
      component: CaptionProperties,
      state: {
        initialState: {
          displayBoxCaption: true,
          selectedFields: [
            'run.name',
            `${sequenceName}.name`,
            `${sequenceName}.context`,
          ],
        },
        persist: 'url',
      },
    };
  });

  const box = produce(defaultConfig.box, (draft: any) => {
    draft.initialState.width = 350;
    draft.initialState.height = 170;
  });

  return {
    ...defaultConfig,
    groupings,
    controls,
    box,
    getStaticContent: getAudiosExplorerStaticContent,
  };
};
