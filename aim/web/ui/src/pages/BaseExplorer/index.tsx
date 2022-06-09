import createExplorer from 'modules/BaseExplorer';
import { IExplorerConfig, styleApplier } from 'modules/BaseExplorer/types';
import {
  Box,
  Grouping,
  QueryForm,
  Visualizer,
} from 'modules/BaseExplorer/components';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { AimFlatObjectBase } from '../../modules/BaseExplorerCore/pipeline/adapter/processor';

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
    sequenceName: SequenceTypesEnum.Images,
    adapter: {
      objectDepth: AimObjectDepths.Index,
    },
    grouping: {
      grid: {
        component: () => <div>Grid</div>,
        styleApplier: (
          object: AimFlatObjectBase,
          group: string[],
          config: any,
        ) => ({
          x: config.grid.rowLength * config.box.width,
        }),
        state: {
          // observable state, to listen on base visualizer
          initialState: {
            rowLength: 4,
          },
        },
        settings: {
          // settings to pass to component, to use, alter it can be color scales values for color grouping
          maxRowsLength: 10,
        },
      },
      group: {
        component: () => <div>Group for images</div>,
        styleApplier: (
          object: AimFlatObjectBase,
          group: string[],
          config: any,
        ) => ({
          x: 1,
        }),
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
      queryForm: QueryForm,
      visualizations: [Visualizer],
      grouping: Grouping,
      box: Box,
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
