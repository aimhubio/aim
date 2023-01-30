import renderer from 'modules/BaseExplorer';
import Figures from 'modules/BaseExplorer/components/Figures';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { getFiguresDefaultConfig } from './config';

const defaultConfig = getFiguresDefaultConfig();

const FiguresExplorer = renderer(
  {
    name: 'Figures Explorer',
    sequenceName: SequenceTypesEnum.Figures,
    basePath: 'figures',
    persist: true,
    adapter: {
      objectDepth: AimObjectDepths.Step,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: defaultConfig.Visualizer,
        controls: defaultConfig.controls,
        box: {
          ...defaultConfig.box,
          component: Figures,
        },
      },
    },
    getStaticContent: defaultConfig.getStaticContent,
  },
  __DEV__,
);

export default FiguresExplorer;
