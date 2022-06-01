import { memoize } from 'modules/BaseExplorerCore/cache';

import { AimFlatObjectBase } from '../adapter/processor';

import applyModifier, { GroupOptions } from './applyModifier';

interface ModifiedObject extends AimFlatObjectBase {}

export type ModifierConfigOptions = {
  useCache?: boolean;
};

type ModifierParams = {
  objectList: any[];
  modifier: GroupOptions;
};

export type Modifier = {
  execute: (params: ModifierParams) => ModifierResult;
};

export type ModifierResult = {
  data: ModifiedObject[];
  modifierConfig: any;
};

let modifierConfig: {
  useCache: boolean;
};

function setAdapterConfig(options: ModifierConfigOptions): void {
  const { useCache } = options;
  modifierConfig = {
    useCache: !!useCache,
  };
}

export function modify({ objectList, modifier }: ModifierParams): any {
  const result = applyModifier(objectList, modifier);

  // get modifier values learning_rat==0.01
  // traverse through object set group key to corresponding
  // set order

  return result;
}

function createModifier({ useCache = false }: ModifierConfigOptions): Modifier {
  setAdapterConfig({ useCache });

  const execute = useCache
    ? memoize<ModifierParams, ModifierResult>(modify)
    : modify;
  return {
    execute,
  };
}

export default createModifier;
