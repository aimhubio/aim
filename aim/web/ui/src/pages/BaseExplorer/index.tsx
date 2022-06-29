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
import { Order } from 'modules/BaseExplorerCore/pipeline/grouping/types';
import Figures from 'modules/BaseExplorer/components/Figures/Figures';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

const applyStyle: styleApplier = (object: any, boxConfig: any, group: any) => {
  return {
    x: boxConfig.width * 2 + boxConfig.gap,
    y: boxConfig.height * 2 + boxConfig.gap,
  };
};

const config: IExplorerConfig = {
  explorerName: 'Images Explorer',
  engine: {
    useCache: false,
    sequenceName: SequenceTypesEnum.Figures,
    adapter: {
      objectDepth: AimObjectDepths.Step,
    },
    grouping: {
      row: {
        component: memo((props: IBaseComponentProps) => (
          <GroupingItem groupName='row' iconName='chart-group' {...props} />
        )),
        styleApplier: (
          object: AimFlatObjectBase,
          group: string[],
          config: any,
        ) => ({
          x: config.row.rowLength * config.box.width,
        }),
        defaultApplications: {
          fields: ['run.hash'],
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
      column: {
        component: memo((props: IBaseComponentProps) => (
          <GroupingItem groupName='column' iconName='chart-group' {...props} />
        )),
        styleApplier: (
          object: AimFlatObjectBase,
          group: string[],
          config: any,
        ) => ({
          x: config.column.rowLength * config.box.width,
        }),
        defaultApplications: {
          fields: ['run.hash'],
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
  },
  ui: {
    // visualizationType: 'box', // 'box', 'sequence'
    defaultBoxConfig: {
      width: 150,
      height: 150,
      gap: 20,
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
