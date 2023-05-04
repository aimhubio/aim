import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

export interface IAggregationProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IAggregationConfig {
  methods: {
    area: AggregationAreaMethods;
    line: AggregationLineMethods;
  };
  isApplied: boolean;
  isInitial: boolean;
}

export interface IAggregationData {
  area: {
    min: {
      xValues: number[];
      yValues: number[];
    } | null;
    max: {
      xValues: number[];
      yValues: number[];
    } | null;
    stdDevValue?: {
      xValues: number[];
      yValues: number[];
    };
    stdErrValue?: {
      xValues: number[];
      yValues: number[];
    };
  };
  line: {
    xValues: number[];
    yValues: number[];
  } | null;
}

export interface IAggregatedData extends IAggregationData {
  key?: string;
  color: string;
  dasharray: string;
  chartIndex?: number;
}
