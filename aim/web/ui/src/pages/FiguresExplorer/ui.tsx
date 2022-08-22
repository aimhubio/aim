// visualizationType: 'box', // 'box', 'sequence'
import { memo } from 'react';

import { IQueryFormProps, IUIConfig } from 'modules/BaseExplorer/types';
import {
  Grouping,
  QueryForm,
  Visualizer,
} from 'modules/BaseExplorer/components';
import Figures from 'modules/BaseExplorer/components/Figures/Figures';
import Controls from 'modules/BaseExplorer/components/Controls';

const ui: IUIConfig = {
  defaultBoxConfig: {
    width: 400,
    height: 400,
    gap: 0,
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
};

export default ui;
