import renderer from 'modules/BaseExplorer';
import Metrics from 'modules/BaseExplorer/components/Metrics/Metrics';
import { PersistenceTypesEnum } from 'modules/core/engine/types';
import {
  VisualizerTooltip,
  VisualizerLegends,
} from 'modules/BaseExplorer/components/Widgets';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { getMetricsDefaultConfig } from './config';
import TooltipContentHeader from './TooltipContentHeader';

const defaultConfig = getMetricsDefaultConfig();

const MetricsExplorer = renderer(
  {
    name: 'Metrics Explorer V2',
    sequenceName: SequenceTypesEnum.Metric,
    basePath: 'metrics_v2',
    persist: true,
    adapter: {
      objectDepth: AimObjectDepths.Sequence,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: defaultConfig.Visualizer,
        controls: defaultConfig.controls,
        box: {
          ...defaultConfig.box,
          component: Metrics,
        },
        widgets: {
          tooltip: {
            component: VisualizerTooltip,
            props: {
              tooltipContentHeader: TooltipContentHeader,
            },
          },
          legends: {
            component: VisualizerLegends,
          },
        },
      },
    },
    states: {
      focusedState: {
        initialState: {
          key: null,
          xValue: null,
          yValue: null,
          active: false,
          chartIndex: null,
          visId: null,
        },
        persist: PersistenceTypesEnum.Url,
      },
      activeElement: {
        initialState: {
          key: null,
          rect: null,
          xValue: null,
          yValue: null,
          visId: null,
          inProgress: null,
        },
        // persist: PersistenceTypesEnum.LocalStorage, // @TODO: persistence by "LocalStorage" doesn't supported yet
      },
    },
    getStaticContent: defaultConfig.getStaticContent,
  },
  __DEV__,
);

export default MetricsExplorer;
