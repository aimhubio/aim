import { memo } from 'react';

import renderer from 'modules/BaseExplorer';
import CaptionProperties from 'modules/BaseExplorer/components/Controls/CaptionProperties';
import { GroupType, Order } from 'modules/core/pipeline';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';
import { GroupingItem } from 'modules/BaseExplorer/components/Grouping';
import Visualizer from 'modules/BaseExplorer/components/Visualizer';
import AudioBox from 'modules/BaseExplorer/components/AudioBox';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { AimFlatObjectBase } from 'types/core/AimObjects';

const AudioExplorer = renderer(
  {
    sequenceName: SequenceTypesEnum.Audios,
    name: 'Audio Explorer',
    adapter: {
      objectDepth: AimObjectDepths.Index,
    },
    groupings: {
      [GroupType.COLUMN]: {
        component: memo((props: IBaseComponentProps) => (
          <GroupingItem
            groupName='columns'
            iconName='group-column'
            {...props}
          />
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
          fields: ['run.hash', 'audios.name'],
          orders: [Order.ASC, Order.ASC],
        },
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
              ? group[GroupType.ROW].order *
                  (boxConfig.height + boxConfig.gap) +
                30 +
                boxConfig.gap
              : (group[GroupType.COLUMN] ? 30 : 0) + boxConfig.gap,
          };
        },
        defaultApplications: {
          fields: ['record.step'],
          orders: [Order.DESC],
        },
      },
    },
    visualizations: {
      vis1: {
        component: Visualizer,
        controls: {
          captionProperties: {
            component: CaptionProperties,
            state: {
              initialState: {
                displayBoxCaption: true,
                selectedFields: ['run.name', 'audios.name', 'audios.context'],
              },
            },
          },
        },
        box: {
          //@ts-ignore
          component: AudioBox,
          hasDepthSlider: true,
          initialState: {
            width: 300,
            height: 250,
            gap: 0,
          },
        },
      },
    },
  },
  __DEV__,
);

export default AudioExplorer;
