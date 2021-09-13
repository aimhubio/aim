import { IParamTrace, IRun } from 'types/services/models/metrics/runModel';
import {
  IGroupingSelectOption,
  IChartTooltip,
  IFocusedState,
} from 'metrics/metricsAppModel';
import { CurveEnum } from 'utils/d3';

export interface IParam {
  run: IRun<IParamTrace>;
  isHidden: boolean;
  color: string;
  key: string;
  dasharray: string;
  isHidden?: boolean;
}
interface IParamsAppConfig {
  grouping: {
    color: string[];
    stroke: string[];
    chart: string[];
    reverseMode: {
      color: boolean;
      stroke: boolean;
      chart: boolean;
    };
    isApplied: {
      color: boolean;
      stroke: boolean;
      chart: boolean;
    };
    persistence: {
      color: boolean;
      stroke: boolean;
    };
    seed: {
      color: number;
      stroke: number;
    };
    paletteIndex: number;
    selectOptions: IGroupingSelectOption[];
  };
  chart: {
    curveInterpolation: CurveEnum;
    isVisibleColorIndicator: boolean;
    focusedState: IFocusedState;
    tooltip: IChartTooltip;
  };
  select: {
    params: any; // ISelectMetricsOption[];
    query: string;
  };
  table: any;
  onParamsSelectChange: (data) => void;
}
