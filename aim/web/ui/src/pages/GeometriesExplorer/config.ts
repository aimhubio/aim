import produce from 'immer';

import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';
import { CaptionProperties } from 'modules/BaseExplorer/components/Controls';

import getGeometriesExplorerStaticContent from './getStaticContent';

export const getGeometriesDefaultConfig = (): typeof defaultHydration => {
  const defaultConfig = getDefaultHydration();

  const groupings = produce(defaultConfig.groupings, (draft: any) => {
    draft[GroupType.COLUMN].defaultApplications.orders = [Order.ASC, Order.ASC];
    draft[GroupType.COLUMN].defaultApplications.fields = [
      'run.hash',
      'geometries.name',
    ];
    draft[GroupType.ROW].defaultApplications.orders = [Order.DESC];
    draft[GroupType.ROW].defaultApplications.fields = ['record.step'];
  });

  const controls = produce(defaultConfig.controls, (draft: any) => {
    draft.captionProperties = {
      component: CaptionProperties,
      state: {
        initialState: {
          displayBoxCaption: true,
          selectedFields: ['run.name', 'geometries.name', 'geometries.context'],
        },
        persist: 'url',
      },
    };
  });

  return {
    ...defaultConfig,
    groupings,
    controls,
    box: defaultConfig.box,
    getStaticContent: getGeometriesExplorerStaticContent,
  };
};
