import { AimObjectDepths } from 'types/core/enums';

type Adapter = {
  execute: () => any;
};

function createAdapter(objectDepth: AimObjectDepths): Adapter {
  return {
    execute: () => null,
  };
}

export default createAdapter;
