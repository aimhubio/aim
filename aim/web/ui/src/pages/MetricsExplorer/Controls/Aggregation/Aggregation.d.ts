import { IBaseComponentProps } from "modules/BaseExplorer/types";

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
