import { IEngineConfig } from 'modules/BaseExplorer/types';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import grouping from './groupings';
import controls from './controls';

const engineConfig: IEngineConfig = {
  useCache: true,
  sequenceName: SequenceTypesEnum.Figures,
  adapter: {
    objectDepth: AimObjectDepths.Step,
  },
  grouping,
  controls,
};

export default engineConfig;
