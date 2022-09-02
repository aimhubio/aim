import { AimObjectDepths } from 'types/core/enums';
import {
  IndexRanges,
  RecordRanges,
  AimFlatObjectBase,
} from 'types/core/AimObjects';
import { Context } from 'types/core/shared';

export type ProcessInterceptor = (...arg: any) => any;

export type DepthInterceptors = {
  [key in AimObjectDepths]: ProcessInterceptor;
};

export interface IQueryableData {
  ranges?: RecordRanges & IndexRanges;
}

export interface ProcessedData {
  objectList: AimFlatObjectBase[];
  queryable_data: IQueryableData;
  additionalData: {
    params: string[];
    sequenceInfo: string[];
    modifiers: string[];
  };
}

export type ObjectHashCreator = {
  runHash: string;
  name?: string;
  context?: Context;
  step?: number;
  index?: number;
};
