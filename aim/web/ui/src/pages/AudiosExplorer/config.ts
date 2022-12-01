import CaptionProperties from 'modules/BaseExplorer/components/Controls/CaptionProperties';
import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';

import getAudiosExplorerStaticContent from './getStaticContent';

export const getAudiosDefaultConfig = (): typeof defaultHydration => {
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
          fields: ['run.hash', 'audios.name'],
        },
      },
    },
    controls: {
      captionProperties: {
        component: CaptionProperties,
        state: {
          initialState: {
            displayBoxCaption: true,
            selectedFields: ['run.name', 'audios.name', 'audios.context'],
          },
          persist: 'url',
        },
      },
    },
    box: {
      ...defaultConfig.box,
      initialState: {
        width: 350,
        height: 170,
        gap: 0,
      },
    },
    getStaticContent: getAudiosExplorerStaticContent,
  };
};
