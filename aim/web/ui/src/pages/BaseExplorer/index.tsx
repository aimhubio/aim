import { memo } from 'react';

import createExplorer from 'modules/BaseExplorer';
import {
  IBaseComponentProps,
  IExplorerConfig,
  IQueryFormProps,
  styleApplier,
} from 'modules/BaseExplorer/types';
import {
  Grouping,
  GroupingItem,
  QueryForm,
  Visualizer,
} from 'modules/BaseExplorer/components';
import { AimFlatObjectBase } from 'modules/BaseExplorerCore/pipeline/adapter/processor';
import {
  GroupType,
  Order,
} from 'modules/BaseExplorerCore/pipeline/grouping/types';
import Figures from 'modules/BaseExplorer/components/Figures/Figures';
import Controls from 'modules/BaseExplorer/components/Controls';
import BoxConfig from 'modules/BaseExplorer/components/Controls/BoxConfig';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

const applyStyle: styleApplier = (object: any, boxConfig: any, group: any) => {
  return {
    x: boxConfig.width * 2 + boxConfig.gap,
    y: boxConfig.height * 2 + boxConfig.gap,
  };
};

// @ts-ignore
const config: IExplorerConfig = {
  explorerName: 'Figures Explorer',
  engine: {
    useCache: true,
    sequenceName: SequenceTypesEnum.Figures,
    adapter: {
      objectDepth: AimObjectDepths.Step,
    },
    grouping: {
      [GroupType.COLUMN]: {
        component: memo((props: IBaseComponentProps) => (
          <GroupingItem
            groupName='columns'
            iconName='manage-column'
            {...props}
          />
        )),
        // @ts-ignore
        styleApplier: (
          object: AimFlatObjectBase,
          group: any,
          boxConfig: any,
          iteration: number,
        ) => {
          return {
            left: group[GroupType.COLUMN]
              ? group[GroupType.COLUMN].order *
                (boxConfig.width + boxConfig.gap)
              : 0,
          };
        },
        defaultApplications: {
          fields: [],
          orders: [Order.DESC, Order.ASC],
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
          <GroupingItem groupName='rows' iconName='row-height' {...props} />
        )),
        // @ts-ignore
        styleApplier: (
          object: AimFlatObjectBase,
          group: any,
          boxConfig: any,
          iteration: number,
        ) => {
          return {
            top: group[GroupType.ROW]
              ? group[GroupType.ROW].order *
                  (boxConfig.height + boxConfig.gap) +
                30
              : 30,
          };
        },
        defaultApplications: {
          fields: [],
          orders: [Order.DESC, Order.ASC],
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
    },

    controls: {
      boxProperties: {
        component: BoxConfig,
        settings: {
          maxWidth: 600,
          minWidth: 300,
          maxGap: 100,
          minGap: 100,
          step: 10,
        },
        // no need to have state for boxProperties since it works with the state, which is responsible for grouping as well
        // this is the reason for empty state, the state property is optional, just kept empty here to have an example for other controls
        state: {
          initialState: {},
        },
      },

      // @TODO uncomment the code below to see how to see an example more than boxProperties the controls
      // @TODO delete this example after successfully implementing the controls
      /*testProperties: {
        component: (props: IBaseComponentProps) => {
          const state = props.engine.useStore(
            props.engine.controls.testProperties.stateSelector,
          );
          const settings = props.engine.controls.testProperties;

          function onUpdate() {
            props.engine.controls.testProperties.methods.update({
              test: false,
            });
          }
          return <button onClick={onUpdate}>update</button>;
        },
        settings: {
          test: 10,
        },
        // no need to have state for boxProperties since it works with the state, which is responsible for grouping as well
        // this is the reason for empty state, the state property is optional, just kept empty here to have an example for other controls
        state: {
          initialState: {},
        },
      },*/
    },
  },
  ui: {
    // visualizationType: 'box', // 'box', 'sequence'
    defaultBoxConfig: {
      width: 150,
      height: 150,
      gap: 10,
    },
    styleAppliers: {
      grid: applyStyle,
    },
    components: {
      queryForm: memo((props: IQueryFormProps) => (
        <QueryForm engine={props.engine} hasAdvancedMode />
      )),
      visualizations: [Visualizer],
      grouping: Grouping,
      box: Figures,
      controls: Controls,
    },
  },
  states: {
    // change to custom state
    custom1: {
      initialState: { rowLength: 1 },
    },
  },
};

const SampleExplorer = createExplorer(config);

export default SampleExplorer;
