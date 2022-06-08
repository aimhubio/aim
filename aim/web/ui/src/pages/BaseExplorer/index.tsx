import createExplorer from 'modules/BaseExplorer';
import { IExplorerConfig, styleApplier } from 'modules/BaseExplorer/types';
import {
  Box,
  Grouping,
  QueryForm,
  Visualizer,
} from 'modules/BaseExplorer/components';

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
    sequenceName: SequenceTypesEnum.Images,
    adapter: {
      objectDepth: AimObjectDepths.Index,
    },
    grouping: {},
  },
  ui: {
    defaultBoxConfig: {
      width: 150,
      height: 150,
      gap: 20,
    },
    styleAppliers: {
      grid: applyStyle,
    },
    components: {
      queryForm: (props: any) => (
        <QueryForm engine={props.engine} hasAdvancedMode />
      ),
      visualizations: [Visualizer],
      grouping: Grouping,
      box: Box,
    },
  },
  states: {
    custom1: {
      initialState: { rowLength: 1 },
    },
  },
};

const SampleExplorer = createExplorer(config);

export default SampleExplorer;
