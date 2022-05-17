export enum ADAPTER_OBJECT_DEPTHS {}

type Adapter = {
  execute: () => any;
};

function createAdapter(objectDepth: ADAPTER_OBJECT_DEPTHS) {}

export {};
