import { ControlsConfigs } from 'modules/core/engine/store/controls';

import { BoxProperties, CaptionProperties } from './components/Controls';
import FullVewPopover from './components/BoxFullViewPopover';
import Visualizer from './components/Visualizer';
import BoxWrapper from './components/BoxWrapper';
import { AdvancedQueryForm } from './components/QueryForm';
import Controls from './components/Controls';
import Grouping from './components/Grouping';

const controls: ControlsConfigs = {
  boxProperties: {
    component: BoxProperties,
    settings: {
      minWidth: 200,
      maxWidth: 800,
      minHeight: 200,
      maxHeight: 800,
      step: 10,
    },
    // no need to have state for boxProperties since it works with the state, which is responsible for grouping as well
    // this is the reason for empty state, the state property is optional, just kept empty here to have an example for other controls
    state: {
      initialState: {},
    },
  },
  captionProperties: {
    component: CaptionProperties,
    state: {
      initialState: {
        displayBoxCaption: true,
        selectedFields: ['run.name', 'figures.name', 'figures.context'],
      },
    },
  },
};

const defaultHydration = {
  ObjectFullView: FullVewPopover,
  BoxWrapper: BoxWrapper,
  Visualizer: Visualizer,
  QueryForm: AdvancedQueryForm,
  Controls: Controls,
  Groupings: Grouping,
  documentationLink:
    'https://aimstack.readthedocs.io/en/latest/ui/pages/explorers.html',
  box: {
    initialState: {
      width: 400,
      height: 40,
    },
  },
  controls,
};

/**
 * getDefaultHydration
 * This file consists of explorer default configuration for ui components and explorer specific options
 * May receive the configuration and return new hydrated object later
 */
function getDefaultHydration(): typeof defaultHydration {
  return defaultHydration;
}

export default getDefaultHydration;
