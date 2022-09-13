import React, { memo } from 'react';

import FullVewPopover from './components/BoxFullViewPopover';
import Visualizer from './components/Visualizer';
import BoxWrapper from './components/BoxWrapper';
import { AdvancedQueryForm } from './components/QueryForm';
import Controls from './components/Controls';
import Grouping from './components/Grouping';

const defaultHydration = {
  ObjectFullView: FullVewPopover,
  BoxWrapper: BoxWrapper,
  Visualizer: Visualizer,
  QueryForm: AdvancedQueryForm,
  Controls: Controls,
  Groupings: Grouping,
  documentationLink:
    'https://aimstack.readthedocs.io/en/latest/ui/pages/explorers.html',
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
