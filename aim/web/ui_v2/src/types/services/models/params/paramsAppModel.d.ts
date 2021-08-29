import { IParamTrace, IRun } from 'types/services/models/metrics/runModel';
import {
  IGroupingSelectOption,
  IChartTooltip,
  IFocusedState,
} from 'metrics/metricsAppModel';
import { CurveEnum } from 'utils/d3';
import { ISelectMetricsOption } from 'pages/metrics/components/SelectForm/SelectForm';

export interface IParam {
  run: IRun<IParamTrace>;
  color: string;
  key: string;
  dasharray: string;
}
interface IParamsAppConfig {
  grouping: {
    color: string[];
    style: string[];
    chart: string[];
    reverseMode: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    isApplied: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    persistence: {
      color: boolean;
      style: boolean;
    };
    seed: {
      color: number;
      style: number;
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
    params: ISelectMetricsOption[];
    query: string;
  };
  onParamsSelectChange: (data) => void;
}
