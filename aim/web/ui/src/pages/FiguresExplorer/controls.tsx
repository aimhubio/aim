import {
  BoxProperties,
  CaptionProperties,
} from 'modules/BaseExplorer/components/Controls';
import { ControlsConfigs } from 'modules/core/engine/store/controls';

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

export default controls;
