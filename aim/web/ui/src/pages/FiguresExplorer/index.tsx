import createExplorer from 'modules/BaseExplorer';

import { DOCUMENTATIONS } from 'config/references';

import ui from './ui';
import customStates from './customStates';
import engine from './engineConfig';

const FiguresExplorer = createExplorer({
  explorerName: 'Figures Explorer',
  documentationLink: DOCUMENTATIONS.EXPLORERS.FIGURES.MAIN,
  engine,
  ui,
  states: customStates,
});

export default FiguresExplorer;
