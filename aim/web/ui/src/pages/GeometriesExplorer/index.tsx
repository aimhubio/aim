import renderer from 'modules/BaseExplorer';
import Geometries from 'modules/BaseExplorer/components/Geometries';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { getGeometriesDefaultConfig } from './config';

const defaultConfig = getGeometriesDefaultConfig();

const GeometriesExplorer = renderer(
  {
    name: 'Geometries Explorer',
    sequenceName: SequenceTypesEnum.Geometries,
    basePath: 'geometries',
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
          component: Geometries,
        },
      },
    },
    getStaticContent: defaultConfig.getStaticContent,
  },
  __DEV__,
);

export default GeometriesExplorer;
