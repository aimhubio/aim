import { memoize } from 'modules/BaseExplorerCore/cache';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { RunSearchRunView } from 'types/core/AimObjects/Run';

import { AimFlatObjectBase } from '../adapter/processor';

interface ModifiedObject extends AimFlatObjectBase {}

export type ModifierConfigOptions = {
  useCache?: boolean;
};

export type Modifier = {
  execute: (data: AimFlatObjectBase[]) => ModifiedObject[];
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

function modify(objectList: AimFlatObjectBase[]): ModifiedObject[] {
  console.log('modifying');
  return objectList;
}

function createModifier({ useCache = false }: ModifierConfigOptions): Modifier {
  setAdapterConfig({ useCache });

  const execute = useCache
    ? memoize<AimFlatObjectBase[], ModifiedObject[]>(modify)
    : modify;
  return {
    execute,
  };
}

export default createModifier;
