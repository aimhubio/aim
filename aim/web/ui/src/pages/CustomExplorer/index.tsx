import createExplorer from 'modules/BaseExplorer';

import { DOCUMENTATIONS } from 'config/references';

import ui from './ui';
import customStates from './customStates';
import engine from './engineConfig';

const CustomExplorer = createExplorer({
  explorerName: 'Custom Explorer',
  documentationLink: DOCUMENTATIONS.EXPLORERS.METRICS.MAIN,
  engine,
  ui,
  states: customStates,
});

export default CustomExplorer;
