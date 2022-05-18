export enum ADAPTER_OBJECT_DEPTHS {
  Container = 0,
  Sequence = 1,
  Step = 2,
  Index = 3,
}

type Adapter = {
  execute: () => any;
};

function createAdapter(objectDepth: ADAPTER_OBJECT_DEPTHS) {}

export {};
